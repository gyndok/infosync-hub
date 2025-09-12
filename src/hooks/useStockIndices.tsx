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
    { symbol: '^VIX', name: 'VIX' }
  ];

  const fetchIndexData = async (): Promise<IndexData[]> => {
    const results: IndexData[] = [];
    
    for (const index of majorIndices) {
      try {
        const response = await makeRequest({
          service: 'alpha_vantage',
          endpoint: '/query',
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: index.symbol,
            apikey: 'API_KEY'
          }
        });

        if (response.success && response.data['Global Quote']) {
          const quote = response.data['Global Quote'];
          results.push({
            symbol: index.symbol,
            name: index.name,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
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