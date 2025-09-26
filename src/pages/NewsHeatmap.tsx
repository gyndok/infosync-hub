import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewsPoint, NewsData, NewsFilters as INewsFilters, TIME_WINDOWS } from '@/types/news';
import NewsMap from '@/components/news/NewsMap';
import NewsFilters from '@/components/news/NewsFilters';
import NewsDrawer from '@/components/news/NewsDrawer';
import { Search, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

const NewsHeatmap: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<NewsPoint | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(0);

  const [filters, setFilters] = useState<INewsFilters>({
    query: '',
    topics: [],
    language: 'all',
    timeWindow: '24h',
    sources: [],
    minCount: 1,
    verifiedOnly: false,
  });

  // Load news data
  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first, fall back to sample data
        let data;
        try {
          const response = await fetch('/api/news?' + new URLSearchParams({
            query: filters.query,
            topics: filters.topics.join(','),
            lang: filters.language,
            from: getTimeWindowStart(filters.timeWindow),
            to: new Date().toISOString(),
            sources: filters.sources.join(','),
            minCount: filters.minCount.toString(),
          }));
          
          if (!response.ok) throw new Error('API request failed');
          data = await response.json();
        } catch (apiError) {
          // Fallback to sample data
          console.log('Using sample data:', apiError);
          const sampleResponse = await fetch('/data/sample.json');
          data = await sampleResponse.json();
        }
        
        setNewsData(data);
      } catch (err) {
        setError('Failed to load news data');
        console.error('Error loading news data:', err);
        toast({
          title: "Error",
          description: "Failed to load news data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadNewsData();
  }, [filters]);

  // Filter news points based on current filters
  const filteredPoints = useMemo(() => {
    if (!newsData?.points) return [];
    
    return newsData.points.filter(point => {
      // Search query filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesHeadlines = point.sample_headlines.some(h => 
          h.title.toLowerCase().includes(query)
        );
        const matchesPlace = point.place.toLowerCase().includes(query);
        if (!matchesHeadlines && !matchesPlace) return false;
      }
      
      // Topic filter
      if (filters.topics.length > 0) {
        const hasMatchingTopic = point.top_topics.some(topic => 
          filters.topics.includes(topic)
        );
        if (!hasMatchingTopic) return false;
      }
      
      // Minimum count filter
      if (point.article_count < filters.minCount) return false;
      
      // Source filter
      if (filters.sources.length > 0) {
        const hasMatchingSource = point.sample_headlines.some(h =>
          filters.sources.some(source => h.source.toLowerCase().includes(source.toLowerCase()))
        );
        if (!hasMatchingSource) return false;
      }
      
      return true;
    });
  }, [newsData, filters]);

  const handlePointClick = (point: NewsPoint) => {
    setSelectedPoint(point);
    setIsDrawerOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: searchQuery }));
  };

  const resetFilters = () => {
    const defaultFilters: INewsFilters = {
      query: '',
      topics: [],
      language: 'all',
      timeWindow: '24h',
      sources: [],
      minCount: 1,
      verifiedOnly: false,
    };
    setFilters(defaultFilters);
    setSearchQuery('');
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Timeline playback logic would go here
  };

  // Helper function to get start time for time window
  const getTimeWindowStart = (window: string): string => {
    const now = new Date();
    switch (window) {
      case '3h':
        return new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
      case '12h':
        return new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error Loading News</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Search Bar */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search global news events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 text-base"
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Filters Panel */}
        <div className="w-80 bg-white border-r">
          <NewsFilters 
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative z-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading global news data...</p>
              </div>
            </div>
          ) : (
            <NewsMap 
              newsPoints={filteredPoints}
              onPointClick={handlePointClick}
              selectedPoint={selectedPoint}
            />
          )}

          {/* Results Counter */}
          {!loading && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
              <span className="text-sm font-medium">
                {filteredPoints.length} locations • {filteredPoints.reduce((sum, p) => sum + p.article_count, 0)} articles
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center space-y-4 bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-semibold">No results found</h3>
                <p className="text-muted-foreground">
                  Try loosening your filters or adjusting the search terms.
                </p>
                <Button onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center gap-4">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Past {TIME_WINDOWS.find(w => w.value === filters.timeWindow)?.label || '24h'}
            </span>
            <Slider
              value={[timelinePosition]}
              onValueChange={(value) => setTimelinePosition(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Now
            </span>
          </div>
        </div>
      </div>

      {/* News Drawer */}
      <NewsDrawer 
        point={selectedPoint}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPoint(null);
        }}
      />
    </div>
  );
};

export default NewsHeatmap;