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
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^DJI', name: 'Dow Jones' },
    { symbol: '^RUT', name: 'Russell 2000' },
    { symbol: '^VIX', name: 'VIX' },
    { symbol: '^FTSE', name: 'FTSE 100' }
  ];

  const fetchIndexData = async (): Promise<IndexData[]> => {
    const results: IndexData[] = [];
    
    for (const index of majorIndices) {
      try {
        const response = await makeRequest({
          service: 'yahoo_finance',
          endpoint: '/chart/' + encodeURIComponent(index.symbol),
          params: {
            interval: '1d',
            range: '1d',
            includePrePost: false
          }
        });

        if (response.success && response.data?.chart?.result?.length > 0) {
          const result = response.data.chart.result[0];
          const meta = result.meta;
          const quotes = result.indicators?.quote?.[0];
          
          if (meta && quotes) {
            const currentPrice = meta.regularMarketPrice || meta.previousClose;
            const previousClose = meta.previousClose;
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