import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sampleNews = [
  {
    id: 1,
    title: "AI Technology Advances in Healthcare",
    summary: "Revolutionary breakthrough in medical diagnostics using machine learning algorithms.",
    source: "TechNews",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Global Market Updates",
    summary: "Stock markets show positive trends across major indices worldwide.",
    source: "Financial Times",
    time: "4 hours ago",
  },
  {
    id: 3,
    title: "Climate Change Initiative",
    summary: "New international agreement on carbon emission reduction targets.",
    source: "Environmental Today",
    time: "6 hours ago",
  },
];

export const NewsWidget: React.FC = () => {
  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          📰 Latest News
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            Live
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {sampleNews.map((article, index) => (
            <div 
              key={article.id} 
              className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                index !== sampleNews.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.time}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border/50">
          <button className="text-sm text-primary hover:text-primary-hover font-medium">
            View all news →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};