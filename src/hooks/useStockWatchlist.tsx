import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useApiProxy } from './useApiProxy';
import { useToast } from './use-toast';

interface WatchlistStock {
  id: string;
  symbol: string;
  name: string;
  added_at: string;
}

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const useStockWatchlist = () => {
  const { user } = useAuth();
  const { makeRequest } = useApiProxy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's watchlist from database
  const watchlistQuery = useQuery({
    queryKey: ['stock-watchlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_widgets')
        .select('configuration')
        .eq('user_id', user.id)
        .eq('widget_type', 'stock_watchlist')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const config = data?.configuration as { stocks?: WatchlistStock[] } | null;
      return config?.stocks || [];
    },
    enabled: !!user,
  });

  // Fetch current prices for watchlist stocks
  const fetchStockPrices = async (symbols: string[]): Promise<StockPrice[]> => {
    const results: StockPrice[] = [];
    
    for (const symbol of symbols) {
      try {
        const response = await makeRequest({
          service: 'alpha_vantage',
          endpoint: '/query',
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: 'API_KEY'
          }
        });

        if (response.success && response.data['Global Quote']) {
          const quote = response.data['Global Quote'];
          results.push({
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
          });
        }
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
    }
    
    return results;
  };

  const watchlistSymbols = watchlistQuery.data?.map((stock: WatchlistStock) => stock.symbol) || [];
  
  const pricesQuery = useQuery({
    queryKey: ['watchlist-prices', watchlistSymbols],
    queryFn: () => fetchStockPrices(watchlistSymbols),
    enabled: watchlistSymbols.length > 0,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Add stock to watchlist
  const addToWatchlistMutation = useMutation({
    mutationFn: async ({ symbol, name }: { symbol: string; name: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const currentStocks = watchlistQuery.data || [];
      const newStock = {
        id: crypto.randomUUID(),
        symbol: symbol.toUpperCase(),
        name,
        added_at: new Date().toISOString()
      };
      
      const updatedStocks = [...currentStocks, newStock];
      
      const { error } = await supabase
        .from('user_widgets')
        .upsert({
          user_id: user.id,
          widget_type: 'stock_watchlist',
          configuration: { stocks: updatedStocks } as any
        });
      
      if (error) throw error;
      return updatedStocks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-watchlist', user?.id] });
      toast({
        title: "Stock added",
        description: "Stock has been added to your watchlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove stock from watchlist
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (stockId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const currentStocks = watchlistQuery.data || [];
      const updatedStocks = currentStocks.filter((stock: WatchlistStock) => stock.id !== stockId);
      
      const { error } = await supabase
        .from('user_widgets')
        .upsert({
          user_id: user.id,
          widget_type: 'stock_watchlist',
          configuration: { stocks: updatedStocks } as any
        });
      
      if (error) throw error;
      return updatedStocks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-watchlist', user?.id] });
      toast({
        title: "Stock removed",
        description: "Stock has been removed from your watchlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    watchlist: watchlistQuery.data || [],
    prices: pricesQuery.data || [],
    isLoadingWatchlist: watchlistQuery.isLoading,
    isLoadingPrices: pricesQuery.isLoading,
    addToWatchlist: addToWatchlistMutation.mutate,
    removeFromWatchlist: removeFromWatchlistMutation.mutate,
    isAddingStock: addToWatchlistMutation.isPending,
    isRemovingStock: removeFromWatchlistMutation.isPending,
  };
};