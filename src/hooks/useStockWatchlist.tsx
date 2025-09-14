import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useApiProxy } from "./useApiProxy";
import { useToast } from "./use-toast";

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
    queryKey: ["stock-watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_widgets")
        .select("configuration")
        .eq("user_id", user.id)
        .eq("widget_type", "stock_watchlist")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching watchlist:", error);
        return [];
      }

      // Get the most recent configuration or return empty array
      const config = data?.[0]?.configuration as {
        stocks?: WatchlistStock[];
      } | null;
      return config?.stocks || [];
    },
    enabled: !!user,
  });

  // Fetch current prices for watchlist stocks using Finnhub
  const fetchStockPrices = async (symbols: string[]): Promise<StockPrice[]> => {
    const results: StockPrice[] = [];

    for (const symbol of symbols) {
      try {
        const response = await makeRequest({
          service: "finnhub",
          endpoint: "/quote",
          params: {
            symbol: symbol,
            token: "FINNHUB_API_KEY", // Will be replaced by proxy
          },
        });

        if (response.success && response.data && response.data.c) {
          const quote = response.data;
          const currentPrice = quote.c; // Current price
          const previousClose = quote.pc; // Previous close
          const change = currentPrice - previousClose;
          const changePercent =
            previousClose > 0 ? (change / previousClose) * 100 : 0;

          results.push({
            symbol: symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
          });
        }
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
    }

    return results;
  };

  const watchlistSymbols =
    watchlistQuery.data?.map((stock: WatchlistStock) => stock.symbol) || [];

  const pricesQuery = useQuery({
    queryKey: ["watchlist-prices", watchlistSymbols],
    queryFn: () => fetchStockPrices(watchlistSymbols),
    enabled: watchlistSymbols.length > 0,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Add stock to watchlist
  const addToWatchlistMutation = useMutation({
    mutationFn: async ({ symbol, name }: { symbol: string; name: string }) => {
      if (!user) throw new Error("User not authenticated");

      const currentStocks = watchlistQuery.data || [];
      const newStock = {
        id: crypto.randomUUID(),
        symbol: symbol.toUpperCase(),
        name,
        added_at: new Date().toISOString(),
      };

      const updatedStocks = [...currentStocks, newStock];

      const { error } = await supabase.from("user_widgets").upsert({
        user_id: user.id,
        widget_type: "stock_watchlist",
        configuration: { stocks: updatedStocks } as any,
      });

      if (error) throw error;
      return updatedStocks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stock-watchlist", user?.id],
      });
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
      if (!user) throw new Error("User not authenticated");

      const currentStocks = watchlistQuery.data || [];
      const updatedStocks = currentStocks.filter(
        (stock: WatchlistStock) => stock.id !== stockId,
      );

      const { error } = await supabase.from("user_widgets").upsert({
        user_id: user.id,
        widget_type: "stock_watchlist",
        configuration: { stocks: updatedStocks } as any,
      });

      if (error) throw error;
      return updatedStocks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stock-watchlist", user?.id],
      });
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
