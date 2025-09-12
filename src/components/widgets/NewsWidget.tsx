import { useState, useEffect } from 'react';
import { useApiProxy } from '@/hooks/useApiProxy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Newspaper, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  RefreshCw,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  author: string;
  content: string;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

const NEWS_SOURCES = [
  { id: 'bbc-news', name: 'BBC News' },
  { id: 'cnn', name: 'CNN' },
  { id: 'techcrunch', name: 'TechCrunch' },
  { id: 'the-verge', name: 'The Verge' },
  { id: 'ars-technica', name: 'Ars Technica' },
  { id: 'reuters', name: 'Reuters' },
  { id: 'associated-press', name: 'Associated Press' },
  { id: 'the-wall-street-journal', name: 'Wall Street Journal' },
  { id: 'bloomberg', name: 'Bloomberg' },
  { id: 'espn', name: 'ESPN' },
  { id: 'engadget', name: 'Engadget' },
  { id: 'wired', name: 'Wired' },
];

const NEWS_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'science', label: 'Science' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
];

export const NewsWidget: React.FC = () => {
  const { makeRequest, loading } = useApiProxy();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'popularity' | 'relevancy'>('publishedAt');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('headlines');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch news based on current filters
  const fetchNews = async () => {
    try {
      setError(null);
      
      let endpoint = '';
      const params: Record<string, any> = {
        pageSize: 20,
        sortBy: sortBy,
      };

      if (activeTab === 'headlines') {
        endpoint = '/top-headlines';
        params.category = selectedCategory;
        params.country = 'us';
      } else {
        endpoint = '/everything';
        params.q = searchQuery || 'technology';
        params.language = 'en';
      }

      // Add source filtering
      if (selectedSources.length > 0) {
        params.sources = selectedSources.join(',');
        // Remove country and category when using sources (NewsAPI limitation)
        delete params.country;
        delete params.category;
      }

      console.log('Fetching news with params:', params);

      const response = await makeRequest({
        service: 'news',
        endpoint,
        params
      });

      if (response.success && response.data) {
        const newsData = response.data as NewsResponse;
        if (newsData.status === 'ok') {
          setArticles(newsData.articles || []);
          setFilteredArticles(newsData.articles || []);
          setLastUpdated(new Date());
        } else {
          throw new Error('Invalid response from NewsAPI');
        }
      } else {
        throw new Error(response.error || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(errorMessage);
      console.error('News fetch error:', err);
    }
  };

  // Filter articles based on local search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchQuery, articles]);

  // Initial load
  useEffect(() => {
    fetchNews();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedCategory, selectedSources, sortBy, activeTab]);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleRefresh = () => {
    fetchNews();
  };

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
    <Card className="dashboard-card h-full flex flex-col">
      <CardHeader className="widget-header pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Latest News</CardTitle>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(lastUpdated.toISOString())}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Quick Filters */}
        {showFilters && (
          <div className="space-y-4 p-3 border rounded-lg mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="headlines">Headlines</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
              </TabsList>

              <TabsContent value="headlines" className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEWS_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="search" className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Search news..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchNews()}
                      className="pl-7 h-8 text-xs"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Source Selection */}
            <div className="space-y-2">
              <Label className="text-xs">
                Sources ({selectedSources.length} selected)
              </Label>
              <div className="flex flex-wrap gap-1">
                {NEWS_SOURCES.slice(0, 6).map(source => (
                  <Button
                    key={source.id}
                    variant={selectedSources.includes(source.id) ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleSourceToggle(source.id)}
                  >
                    {source.name}
                  </Button>
                ))}
              </div>
              {selectedSources.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedSources([])}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto">
          {loading && articles.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm">Loading news...</span>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No articles found</p>
              <p className="text-xs">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredArticles.slice(0, 10).map((article, index) => (
                <div 
                  key={index}
                  className={`p-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                    index !== filteredArticles.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {article.urlToImage && (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm leading-tight line-clamp-2">
                          {article.title}
                        </h4>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-1 hover:bg-muted rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      {article.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {article.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-xs">
                          {article.source.name}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(article.publishedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredArticles.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50 text-center">
            <span className="text-xs text-muted-foreground">
              Showing {Math.min(filteredArticles.length, 10)} of {filteredArticles.length} articles
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};