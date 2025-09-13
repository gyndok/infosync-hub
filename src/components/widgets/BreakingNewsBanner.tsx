import { useState, useEffect } from 'react';
import { useApiProxy } from '@/hooks/useApiProxy';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BreakingNewsItem {
  id: string;
  headline: string;
  url: string;
  source: string;
  publishedAt: string;
  isBreaking: boolean;
}

export const BreakingNewsBanner = () => {
  const [news, setNews] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { makeRequest } = useApiProxy();

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try RSS feeds first via edge function (fast, no API rate limits)
        try {
          const { data: rssData } = await supabase.functions.invoke('rss-fetcher', {
            body: { sources: ['ap'], limit: 20 }
          });

          if (rssData?.success && rssData.items?.length) {
            const breakingNews: BreakingNewsItem[] = rssData.items
              .slice(0, 10)
              .map((item: any, index: number) => ({
                id: `rss-${index}`,
                headline: item.title,
                url: item.link,
                source: (item.source || 'RSS').toString().toUpperCase(),
                publishedAt: item.pubDate || item.published || new Date().toISOString(),
                isBreaking: true,
              }));

            setNews(breakingNews);
            return; // Done if RSS succeeded
          }
        } catch (_) {
          // Ignore and continue to API proxy fallbacks
        }

        // Try NYT Top Stories API next (reliable and curated)
        const nytResponse = await makeRequest({
          service: 'nyt',
          endpoint: '/topstories/v2/home.json',
          params: {}
        });

        if (nytResponse.success && nytResponse.data.results) {
          // Filter for breaking/urgent news from NYT
          const breakingNews: BreakingNewsItem[] = nytResponse.data.results
            .filter((article: any) => 
              article.title.toLowerCase().includes('breaking') ||
              article.title.toLowerCase().includes('urgent') ||
              article.title.toLowerCase().includes('developing') ||
              article.section === 'World' || 
              article.section === 'U.S.'
            )
            .slice(0, 10)
            .map((article: any, index: number) => ({
              id: `nyt-${index}`,
              headline: article.title,
              url: article.url,
              source: 'The New York Times',
              publishedAt: article.published_date,
              isBreaking: true
            }));
          
          setNews(breakingNews);
        } else {
          // Fallback to NewsAPI for breaking news
          const newsApiResponse = await makeRequest({
            service: 'newsapi',
            endpoint: '/everything',
            params: {
              q: 'breaking news OR urgent',
              sortBy: 'publishedAt',
              pageSize: 10,
              language: 'en'
            }
          });

          if (newsApiResponse.success && newsApiResponse.data.articles) {
            const breakingNews: BreakingNewsItem[] = newsApiResponse.data.articles.map((article: any, index: number) => ({
              id: `news-${index}`,
              headline: article.title,
              url: article.url,
              source: article.source.name,
              publishedAt: article.publishedAt,
              isBreaking: article.title.toLowerCase().includes('breaking') || 
                         article.title.toLowerCase().includes('urgent')
            })).filter(item => item.isBreaking);
            
            setNews(breakingNews);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch breaking news');
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
    const interval = setInterval(fetchBreakingNews, 120000); // Refresh every 2 minutes to avoid rate limits

    return () => clearInterval(interval);
  }, [makeRequest]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (error) {
    return (
      <Alert className="mb-4 border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Breaking news unavailable: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="flex items-center">
          <Badge variant="secondary" className="bg-white text-red-600 font-bold mr-4 ml-4">
            BREAKING
          </Badge>
          <div className="animate-pulse">Loading breaking news...</div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden relative">
      <div className="flex items-center">
        <Badge variant="secondary" className="bg-white text-red-600 font-bold mr-4 ml-4 shrink-0">
          BREAKING
        </Badge>
        <div className="flex animate-[scroll-left_30s_linear_infinite] whitespace-nowrap">
          {news.concat(news).map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center mr-16">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center group"
              >
                <span className="font-medium">{item.headline}</span>
                <ExternalLink className="w-3 h-3 ml-2 opacity-70 group-hover:opacity-100" />
              </a>
              <span className="text-red-200 text-sm ml-3">
                {item.source} • {formatTimeAgo(item.publishedAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};