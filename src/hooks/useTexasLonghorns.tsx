import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logError';

interface LonghornsArticle {
  title: string;
  link: string;
  pubDate?: string;
  source: string;
}

interface LonghornsData {
  success: boolean;
  items: LonghornsArticle[];
  sources: string[];
}

export const useTexasLonghorns = () => {
  const fetchLonghornsNews = async (): Promise<LonghornsData> => {
    console.log('🏈 Fetching Texas Longhorns football news...');
    
    try {
      const { data, error } = await supabase.functions.invoke('rss-fetcher', {
        body: { 
          sources: ['texas_longhorns'], 
          limit: 8 
        }
      });

      if (error) throw error;

      console.log('🏈 Longhorns data received:', data);
      return data;
    } catch (error) {
      logError('Error fetching Longhorns news:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['texas-longhorns-news'],
    queryFn: fetchLonghornsNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
};