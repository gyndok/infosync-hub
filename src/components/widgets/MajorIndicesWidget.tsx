import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useStockIndices } from '@/hooks/useStockIndices';

// Safe currency formatter
const formatPrice = (value?: number) => {
  const n = typeof value === 'number' && isFinite(value) ? value : 0;
  const big = n > 1000;
  const min = big ? 0 : 2;
  const max = big ? 0 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(n);
};

const IndexItem: React.FC<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}> = ({ symbol, name, price, change, changePercent }) => (
  <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{symbol}</span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-sm font-medium">
          {formatPrice(price)}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
          change > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {change > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export const MajorIndicesWidget: React.FC = () => {
  const { indices, isLoading, refetch } = useStockIndices();

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            📈 Major Indices
            <Badge variant="secondary" className="bg-success/10 text-success">
              Live
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="px-1 pb-4">
            {indices.map((index) => (
              <IndexItem
                key={index.symbol}
                symbol={index.symbol}
                name={index.name}
                price={index.price}
                change={index.change}
                changePercent={index.changePercent}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};