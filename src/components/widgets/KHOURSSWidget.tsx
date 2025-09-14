import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Settings, X, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

interface KHOURSSWidgetProps {
  onRemove?: () => void;
}

const KHOU_FEEDS = {
  'local': { name: 'Local News', url: 'https://www.khou.com/feeds/syndication/rss/news/local', color: 'bg-blue-500', key: 'khou_local' },
  'animals': { name: 'Animals', url: 'https://www.khou.com/feeds/syndication/rss/life/animals', color: 'bg-green-500', key: 'khou_animals' },
  'crime': { name: 'Crime', url: 'https://www.khou.com/feeds/syndication/rss/news/crime', color: 'bg-red-500', key: 'khou_crime' },
  'entertainment': { name: 'Entertainment', url: 'https://www.khou.com/feeds/syndication/rss/news/entertaiment-news', color: 'bg-purple-500', key: 'khou_entertainment' },
  'great-day': { name: 'Great Day Houston', url: 'https://www.khou.com/feeds/syndication/rss/entertainment/television/programs/great-day-houston', color: 'bg-yellow-500', key: 'khou_great_day' },
  'health': { name: 'Health', url: 'https://www.khou.com/feeds/syndication/rss/news/health', color: 'bg-pink-500', key: 'khou_health' },
  'politics': { name: 'Politics', url: 'https://www.khou.com/feeds/syndication/rss/news/politics', color: 'bg-indigo-500', key: 'khou_politics' },
  'rodeo': { name: 'Rodeo Houston', url: 'https://www.khou.com/feeds/syndication/rss/entertainment/events/rodeo-houston', color: 'bg-orange-500', key: 'khou_rodeo' },
  'sports': { name: 'Sports', url: 'https://www.khou.com/feeds/syndication/rss/sports', color: 'bg-cyan-500', key: 'khou_sports' },
  'sports-extra': { name: 'Sports Extra', url: 'https://www.khou.com/feeds/syndication/rss/sports/sports-extra', color: 'bg-teal-500', key: 'khou_sports_extra' },
  'college': { name: 'College Sports', url: 'https://www.khou.com/feeds/syndication/rss/sports/college', color: 'bg-amber-500', key: 'khou_college' },
  'high-school': { name: 'High School Sports', url: 'https://www.khou.com/feeds/syndication/rss/sports/high-school', color: 'bg-lime-500', key: 'khou_high_school' },
  'astros': { name: 'Astros', url: 'https://www.khou.com/feeds/syndication/rss/sports/mlb/astros', color: 'bg-orange-600', key: 'khou_astros' },
  'dynamo': { name: 'Dynamo', url: 'https://www.khou.com/feeds/syndication/rss/sports/soccer/dynamo', color: 'bg-orange-400', key: 'khou_dynamo' },
  'rockets': { name: 'Rockets', url: 'https://www.khou.com/feeds/syndication/rss/sports/nba/rockets', color: 'bg-red-600', key: 'khou_rockets' },
  'texans': { name: 'Texans', url: 'https://www.khou.com/feeds/syndication/rss/sports/nfl/texans', color: 'bg-blue-700', key: 'khou_texans' },
  'texas': { name: 'Texas News', url: 'https://www.khou.com/feeds/syndication/rss/news/local/texas', color: 'bg-slate-600', key: 'khou_texas' },
  'verify': { name: 'Verify', url: 'https://www.khou.com/feeds/syndication/rss/news/verify', color: 'bg-emerald-500', key: 'khou_verify' }
};

export const KHOURSSWidget: React.FC<KHOURSSWidgetProps> = ({ onRemove }) => {
  const [selectedFeed, setSelectedFeed] = useState<string>('local');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: newsItems = [], isLoading, error } = useQuery({
    queryKey: ['khou-rss', selectedFeed],
    queryFn: async (): Promise<NewsItem[]> => {
      const feedInfo = KHOU_FEEDS[selectedFeed as keyof typeof KHOU_FEEDS];
      if (!feedInfo) return [];

      const { data, error } = await supabase.functions.invoke('rss-fetcher', {
        body: { 
          sources: [feedInfo.key],
          limit: 8 
        }
      });

      if (error) throw error;
      return data?.items || [];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const currentFeed = KHOU_FEEDS[selectedFeed as keyof typeof KHOU_FEEDS];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              11
            </div>
            <div>
              <CardTitle className="text-lg">KHOU 11</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${currentFeed?.color} text-white border-0`}>
                  {currentFeed?.name || 'News'}
                </Badge>
                <span className="text-xs text-slate-400">Houston</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>KHOU RSS Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">News Category</label>
                    <Select value={selectedFeed} onValueChange={setSelectedFeed}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(KHOU_FEEDS).map(([key, feed]) => (
                          <SelectItem key={key} value={key}>
                            {feed.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setIsSettingsOpen(false)} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {onRemove && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRemove}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-slate-400 py-8">
            <p>Unable to load news</p>
            <p className="text-xs mt-1">Check your connection</p>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>No news available</p>
            <p className="text-xs mt-1">Check back later</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-full">
            {newsItems.map((item, index) => (
              <div 
                key={index} 
                className="group cursor-pointer border-l-2 border-blue-500 pl-3 hover:border-blue-400 transition-colors"
                onClick={() => window.open(item.link, '_blank')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight text-white group-hover:text-blue-200 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(item.pubDate)}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};