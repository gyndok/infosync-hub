import React from 'react';
import { RefreshCw, ExternalLink, Clock } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTexasLonghorns } from '@/hooks/useTexasLonghorns';
import { formatDistanceToNow } from 'date-fns';

interface TexasLonghornsWidgetProps {
  onRemove?: () => void;
}

const LoadingSkeleton = () => (
  <div className="space-y-4 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="border-b border-muted/20 pb-2" />
      </div>
    ))}
  </div>
);

const NewsItem: React.FC<{ 
  title: string; 
  link: string; 
  pubDate?: string; 
}> = ({ title, link, pubDate }) => {
  const timeAgo = pubDate ? formatDistanceToNow(new Date(pubDate), { addSuffix: true }) : null;

  return (
    <div className="border-b border-muted/20 last:border-b-0 pb-3 last:pb-0">
      <div className="space-y-2">
        <h4 className="text-sm font-medium leading-tight hover:text-primary cursor-pointer">
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-start gap-2 group"
          >
            <span className="flex-1">{title}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
          </a>
        </h4>
        {timeAgo && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TexasLonghornsWidget: React.FC<TexasLonghornsWidgetProps> = ({ onRemove }) => {
  const { data, isLoading, error, refetch, isRefetching } = useTexasLonghorns();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <WidgetContainer 
      title="Texas Longhorns Football"
      onRemove={onRemove}
      className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-800/50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-orange-200 dark:border-orange-800/50">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
              🏈 Football
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>Unable to load Longhorns news</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : data?.items?.length ? (
            <div className="overflow-y-auto max-h-full">
              <div className="p-4 space-y-3">
                {data.items.map((item, index) => (
                  <NewsItem
                    key={`${item.link}-${index}`}
                    title={item.title}
                    link={item.link}
                    pubDate={item.pubDate}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>No news available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {data?.items?.length > 0 && (
          <div className="border-t border-orange-200 dark:border-orange-800/50 p-2">
            <p className="text-xs text-center text-muted-foreground">
              Latest from Texas Longhorns Football
            </p>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};