import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useApiProxy } from "./useApiProxy";
import { useToast } from "./use-toast";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}

interface CryptoConfig {
  currencies: string[];
}

export const useCryptocurrency = () => {
  const { user } = useAuth();
  const { makeRequest } = useApiProxy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultCrypto = ["bitcoin", "ethereum", "ripple", "cardano", "solana"];

  // Fetch user's crypto preferences
  const configQuery = useQuery({
    queryKey: ["crypto-config", user?.id],
    queryFn: async () => {
      if (!user) return { currencies: defaultCrypto };

      const { data, error } = await supabase
        .from("user_widgets")
        .select("configuration")
        .eq("user_id", user.id)
        .eq("widget_type", "cryptocurrency")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching crypto config:", error);
        return { currencies: defaultCrypto };
      }

      const config = data?.[0]?.configuration as unknown as CryptoConfig | null;
      return config || { currencies: defaultCrypto };
    },
    enabled: !!user,
  });

  // Fetch crypto data from CoinGecko
  const fetchCryptoData = async (ids: string[]): Promise<CryptoData[]> => {
    try {
      const response = await makeRequest({
        service: "coingecko",
        endpoint: "/simple/price",
        params: {
          ids: ids.join(","),
          vs_currencies: "usd",
          include_24hr_change: "true",
          include_market_cap: "true",
          include_24hr_vol: "true",
        },
      });

      if (response.success) {
        return Object.keys(response.data).map((id) => {
          const data = response.data[id];
          return {
            id,
            symbol: id.toUpperCase(),
            name: id.charAt(0).toUpperCase() + id.slice(1),
            price: data.usd,
            change: data.usd_24h_change || 0,
            changePercent: data.usd_24h_change || 0,
            marketCap: data.usd_market_cap,
            volume: data.usd_24h_vol,
          };
        });
      }
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }

    return [];
  };

  const cryptoCurrencies = configQuery.data?.currencies || defaultCrypto;

  const cryptoQuery = useQuery({
    queryKey: ["crypto-prices", cryptoCurrencies],
    queryFn: () => fetchCryptoData(cryptoCurrencies),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Update crypto configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: CryptoConfig) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("user_widgets").upsert({
        user_id: user.id,
        widget_type: "cryptocurrency",
        configuration: newConfig as any,
      });

      if (error) throw error;
      return newConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crypto-config", user?.id] });
      toast({
        title: "Settings updated",
        description: "Cryptocurrency widget settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add cryptocurrency
  const addCrypto = (cryptoId: string) => {
    const currentConfig = configQuery.data || { currencies: defaultCrypto };
    if (!currentConfig.currencies.includes(cryptoId)) {
      const newConfig = {
        currencies: [...currentConfig.currencies, cryptoId],
      };
      updateConfigMutation.mutate(newConfig);
    }
  };

  // Remove cryptocurrency
  const removeCrypto = (cryptoId: string) => {
    const currentConfig = configQuery.data || { currencies: defaultCrypto };
    const newConfig = {
      currencies: currentConfig.currencies.filter((id) => id !== cryptoId),
    };
    updateConfigMutation.mutate(newConfig);
  };

  return {
    crypto: cryptoQuery.data || [],
    isLoading: cryptoQuery.isLoading,
    error: cryptoQuery.error,
    config: configQuery.data || { currencies: defaultCrypto },
    addCrypto,
    removeCrypto,
    updateConfig: updateConfigMutation.mutate,
    isUpdatingConfig: updateConfigMutation.isPending,
  };
};
