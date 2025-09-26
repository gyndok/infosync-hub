import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { NewsPoint, SummaryData, TOPIC_COLORS } from '@/types/news';
import { ExternalLink, Clock, TrendingUp, Globe, Share, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface NewsDrawerProps {
  point: NewsPoint | null;
  isOpen: boolean;
  onClose: () => void;
}

const NewsDrawer: React.FC<NewsDrawerProps> = ({ point, isOpen, onClose }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (point && isOpen) {
      setLoading(true);
      // Simulate API call for summary data
      setTimeout(() => {
        setSummary({
          id: point.id,
          summary: `This is a comprehensive analysis of the news events happening in ${point.place}. The region is experiencing significant developments across multiple sectors, with ${point.article_count} articles covering various aspects of current events. Key developments include economic indicators, policy changes, and market movements that are shaping the local and regional landscape. The coverage spans multiple reliable sources providing diverse perspectives on the unfolding situation.`,
          citations: point.sample_headlines.map(h => ({ title: h.title, url: h.url })),
          sentiment: {
            polarity: Math.random() * 2 - 1, // Random between -1 and 1
            subjectivity: Math.random(), // Random between 0 and 1
          },
          diversity: {
            outlets: Math.floor(Math.random() * 10) + 5,
            countries: Math.floor(Math.random() * 5) + 1,
          },
          bias: ['center', 'lean_left'] as any,
        });
        setLoading(false);
      }, 1000);
    } else {
      setSummary(null);
    }
  }, [point, isOpen]);

  if (!point) return null;

  const getSentimentColor = (polarity: number) => {
    if (polarity > 0.1) return 'text-green-600';
    if (polarity < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentLabel = (polarity: number) => {
    if (polarity > 0.1) return 'Positive';
    if (polarity < -0.1) return 'Negative';
    return 'Neutral';
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'left': return 'bg-blue-600';
      case 'lean_left': return 'bg-blue-400';
      case 'center': return 'bg-gray-500';
      case 'lean_right': return 'bg-red-400';
      case 'right': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {point.place}
          </SheetTitle>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {point.article_count} articles
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(point.last_updated), 'MMM d, HH:mm')}
            </div>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-2">
            {point.top_topics.map((topic) => {
              const color = TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS] || '#f97316';
              return (
                <Badge 
                  key={topic} 
                  variant="secondary"
                  className="capitalize"
                  style={{ 
                    backgroundColor: `${color}20`,
                    color: color,
                    borderColor: color
                  }}
                >
                  {topic}
                </Badge>
              );
            })}
          </div>
        </SheetHeader>

        <Separator className="my-6" />

        {/* Headlines */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Headlines
          </h4>
          <div className="space-y-3">
            {point.sample_headlines.map((headline, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <h5 className="font-medium text-sm leading-relaxed mb-2">
                  {headline.title}
                </h5>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{headline.source}</span>
                  <div className="flex items-center gap-2">
                    <span>{format(new Date(headline.published_at), 'HH:mm')}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={headline.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Generating analysis...</span>
            </div>
          </div>
        )}

        {summary && (
          <>
            <Separator className="my-6" />
            
            {/* AI Summary */}
            <div className="space-y-4">
              <h4 className="font-semibold">AI Summary</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {summary.summary}
              </p>
            </div>

            <Separator className="my-6" />

            {/* Analysis Metrics */}
            <div className="space-y-6">
              <h4 className="font-semibold">Analysis</h4>
              
              {/* Sentiment */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sentiment</span>
                  <span className={getSentimentColor(summary.sentiment.polarity)}>
                    {getSentimentLabel(summary.sentiment.polarity)}
                  </span>
                </div>
                <Progress 
                  value={(summary.sentiment.polarity + 1) * 50} 
                  className="h-2"
                />
              </div>

              {/* Subjectivity */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subjectivity</span>
                  <span>{Math.round(summary.sentiment.subjectivity * 100)}%</span>
                </div>
                <Progress 
                  value={summary.sentiment.subjectivity * 100} 
                  className="h-2"
                />
              </div>

              {/* Source Diversity */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-lg">{summary.diversity.outlets}</div>
                  <div className="text-muted-foreground">Outlets</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-lg">{summary.diversity.countries}</div>
                  <div className="text-muted-foreground">Countries</div>
                </div>
              </div>

              {/* Bias Distribution */}
              {summary.bias.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Source Bias</span>
                  <div className="flex gap-1">
                    {summary.bias.map((bias, index) => (
                      <div
                        key={index}
                        className={`${getBiasColor(bias)} text-white text-xs px-2 py-1 rounded capitalize`}
                      >
                        {bias.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Share */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const url = `${window.location.origin}/news-heatmap?point=${point.id}`;
                navigator.clipboard.writeText(url);
                // You could add a toast notification here
              }}
            >
              <Share className="h-4 w-4 mr-2" />
              Share This Location
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NewsDrawer;