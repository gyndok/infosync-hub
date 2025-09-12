import { useQuery } from '@tanstack/react-query';
import { useApiProxy } from './useApiProxy';

interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export const useStockIndices = () => {
  const { makeRequest } = useApiProxy();

  const majorIndices = [
    { symbol: 'SPY', name: 'S&P 500 (SPY)' },
    { symbol: 'QQQ', name: 'NASDAQ (QQQ)' },
    { symbol: 'DIA', name: 'Dow Jones (DIA)' },
    { symbol: 'IWM', name: 'Russell 2000 (IWM)' },
    { symbol: 'VXX', name: 'VIX (VXX)' },
    { symbol: 'EFA', name: 'EAFE (EFA)' }
  ];

  const fetchIndexData = async (): Promise<IndexData[]> => {
    const results: IndexData[] = [];
    
    for (const index of majorIndices) {
      try {
        const response = await makeRequest({
          service: 'finnhub',
          endpoint: '/quote',
          params: {
            symbol: index.symbol,
            token: 'FINNHUB_API_KEY' // Will be replaced by proxy
          }
        });

        if (response.success && response.data && response.data.c) {
          const quote = response.data;
          const currentPrice = quote.c; // Current price
          const previousClose = quote.pc; // Previous close
          const change = currentPrice - previousClose;
          const changePercent = previousClose > 0 ? ((change / previousClose) * 100) : 0;
          
          results.push({
            symbol: index.symbol,
            name: index.name,
            price: currentPrice,
            change: change,
            changePercent: changePercent
          });
        }
      } catch (error) {
        console.error(`Error fetching index data for ${index.symbol}:`, error);
      }
    }
    
    return results;
  };

  const indicesQuery = useQuery({
    queryKey: ['stock-indices'],
    queryFn: fetchIndexData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Data is fresh for 30 seconds
  });

  return {
    indices: indicesQuery.data || [],
    isLoading: indicesQuery.isLoading,
    error: indicesQuery.error,
    refetch: indicesQuery.refetch
  };
};