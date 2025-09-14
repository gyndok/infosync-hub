import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useApiProxy } from './useApiProxy';
import { useToast } from './use-toast';
import { logError } from '@/lib/logError';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  asset_type: 'stock' | 'crypto' | 'etf' | 'mutual_fund';
  quantity: number;
  avg_cost_per_unit: number;
  purchase_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: 'stock' | 'crypto' | 'etf' | 'mutual_fund';
  alert_type: 'above' | 'below' | 'change_percent';
  target_value: number;
  current_value?: number;
  is_triggered: boolean;
  is_active: boolean;
  notification_method: 'in_app' | 'email' | 'both';
  triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export const useFinance = () => {
  const { user } = useAuth();
  const { makeRequest } = useApiProxy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stock data
  const fetchStockData = async (symbols: string[]): Promise<StockData[]> => {
    const responses = await Promise.allSettled(
      symbols.map(symbol =>
        makeRequest({
          service: 'alpha_vantage',
          endpoint: '/query',
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
          },
        })
      )
    );

    const results: StockData[] = [];

    responses.forEach((result, index) => {
      const symbol = symbols[index];
      if (result.status === 'fulfilled') {
        const response = result.value;
        if (response.success && response.data['Global Quote']) {
          const quote = response.data['Global Quote'];
          results.push({
            symbol: quote['01. symbol'],
            name: symbol, // We'll need to fetch company names separately
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(
              quote['10. change percent'].replace('%', '')
            ),
            volume: parseInt(quote['06. volume']),
          });
        } else {
          logError(
            `Error fetching stock data for ${symbol}: Invalid response`,
            response
          );
        }
      } else {
        logError(
          `Error fetching stock data for ${symbol}:`,
          result.reason
        );
      }
    });

    return results;
  };

  // Fetch crypto data from CoinGecko
  const fetchCryptoData = async (ids: string[]): Promise<CryptoData[]> => {
    try {
      const response = await makeRequest({
        service: 'coingecko',
        endpoint: '/simple/price',
        params: {
          ids: ids.join(','),
          vs_currencies: 'usd',
          include_24hr_change: 'true',
          include_market_cap: 'true',
          include_24hr_vol: 'true'
        }
      });

      if (response.success) {
        return Object.keys(response.data).map(id => {
          const data = response.data[id];
          return {
            symbol: id.toUpperCase(),
            name: id.charAt(0).toUpperCase() + id.slice(1),
            price: data.usd,
            change: data.usd_24h_change || 0,
            changePercent: data.usd_24h_change || 0,
            marketCap: data.usd_market_cap,
            volume: data.usd_24h_vol
          };
        });
      }
    } catch (error) {
      logError('Error fetching crypto data:', error);
    }
    
    return [];
  };

  // Default stocks and crypto to display
  const defaultStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
  const defaultCrypto = ['bitcoin', 'ethereum'];

  const stocksQuery = useQuery({
    queryKey: ['stocks', defaultStocks],
    queryFn: () => fetchStockData(defaultStocks),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Data is fresh for 30 seconds
  });

  const cryptoQuery = useQuery({
    queryKey: ['crypto', defaultCrypto],
    queryFn: () => fetchCryptoData(defaultCrypto),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Portfolio queries
  const portfoliosQuery = useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');
      
      if (error) throw error;
      return data as Portfolio[];
    },
    enabled: !!user,
  });

  const portfolioHoldingsQuery = useQuery({
    queryKey: ['portfolio-holdings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select(`
          *,
          user_portfolios!inner(user_id)
        `)
        .eq('user_portfolios.user_id', user.id);
      
      if (error) throw error;
      return data as PortfolioHolding[];
    },
    enabled: !!user,
  });

  // Price alerts queries
  const priceAlertsQuery = useQuery({
    queryKey: ['price-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PriceAlert[];
    },
    enabled: !!user,
  });

  // Portfolio mutations
  const createPortfolioMutation = useMutation({
    mutationFn: async (portfolio: Omit<Portfolio, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_portfolios')
        .insert({
          ...portfolio,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios', user?.id] });
      toast({
        title: "Portfolio created",
        description: "Your portfolio has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating portfolio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addHoldingMutation = useMutation({
    mutationFn: async (holding: Omit<PortfolioHolding, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .upsert(holding)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-holdings', user?.id] });
      toast({
        title: "Holding added",
        description: "The holding has been added to your portfolio.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding holding",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Price alert mutations
  const createPriceAlertMutation = useMutation({
    mutationFn: async (alert: Omit<PriceAlert, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_triggered' | 'triggered_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          ...alert,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts', user?.id] });
      toast({
        title: "Price alert created",
        description: "Your price alert has been set up successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating price alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePriceAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts', user?.id] });
      toast({
        title: "Price alert deleted",
        description: "The price alert has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting price alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Data queries
    stocks: stocksQuery.data || [],
    crypto: cryptoQuery.data || [],
    portfolios: portfoliosQuery.data || [],
    holdings: portfolioHoldingsQuery.data || [],
    priceAlerts: priceAlertsQuery.data || [],
    
    // Loading states
    isLoadingStocks: stocksQuery.isLoading,
    isLoadingCrypto: cryptoQuery.isLoading,
    isLoadingPortfolios: portfoliosQuery.isLoading,
    isLoadingHoldings: portfolioHoldingsQuery.isLoading,
    isLoadingAlerts: priceAlertsQuery.isLoading,
    
    // Mutations
    createPortfolio: createPortfolioMutation.mutate,
    addHolding: addHoldingMutation.mutate,
    createPriceAlert: createPriceAlertMutation.mutate,
    deletePriceAlert: deletePriceAlertMutation.mutate,
    
    // Mutation states
    isCreatingPortfolio: createPortfolioMutation.isPending,
    isAddingHolding: addHoldingMutation.isPending,
    isCreatingAlert: createPriceAlertMutation.isPending,
    isDeletingAlert: deletePriceAlertMutation.isPending,
    
    // Utility functions
    fetchStockData,
    fetchCryptoData,
  };
};