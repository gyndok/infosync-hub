import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import WidgetContainer from './WidgetContainer';
import { ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  source: string;
}

export const KHOUAstrosWidget = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase.functions.invoke('rss-fetcher', {
          body: { sources: ['khou_astros'], limit: 8 }
        });

        if (fetchError) throw fetchError;

        if (data?.success && data.items?.length) {
          setNews(data.items);
        } else {
          setError('No Astros news available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Astros news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <WidgetContainer title="Houston Astros" className="h-full">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading Astros news...</div>
        </div>
      </WidgetContainer>
    );
  }

  if (error) {
    return (
      <WidgetContainer title="Houston Astros" className="h-full">
        <div className="flex items-center justify-center h-full text-center p-4">
          <div className="text-muted-foreground text-sm">{error}</div>
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Houston Astros" className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {news.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No Astros news available
            </div>
          ) : (
            news.map((item, index) => (
              <article key={index} className="group cursor-pointer">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800">
                          Astros
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(item.pubDate)}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              </article>
            ))
          )}
        </div>
      </div>
    </WidgetContainer>
  );
};