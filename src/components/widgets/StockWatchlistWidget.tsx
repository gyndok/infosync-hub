import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, X, RefreshCw, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useStockWatchlist } from '@/hooks/useStockWatchlist';

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

const WatchlistItem: React.FC<{
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
  onRemove: () => void;
}> = ({ symbol, name, price, change, changePercent, onRemove }) => (
  <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors group">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{symbol}</span>
        <span className="text-xs text-muted-foreground truncate">{name}</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {price !== undefined ? (
        <div className="text-right">
          <div className="text-sm font-medium">
            {formatPrice(price)}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
            (change || 0) > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {(change || 0) > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {(changePercent || 0) > 0 ? '+' : ''}{(changePercent || 0).toFixed(2)}%
          </div>
        </div>
      ) : (
        <div className="text-right">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  </div>
);

const AddStockDialog: React.FC<{
  onAdd: (symbol: string, name: string) => void;
  isAdding: boolean;
}> = ({ onAdd, isAdding }) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim() && name.trim()) {
      onAdd(symbol.trim().toUpperCase(), name.trim());
      setSymbol('');
      setName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock to Watchlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Stock Symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Company Name (e.g., Apple Inc.)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!symbol.trim() || !name.trim() || isAdding}>
            {isAdding ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Watchlist'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    ))}
  </div>
);

interface StockWatchlistWidgetProps {
  onRemove?: () => void;
}

export const StockWatchlistWidget: React.FC<StockWatchlistWidgetProps> = ({ onRemove }) => {
  const {
    watchlist,
    prices,
    isLoadingWatchlist,
    isLoadingPrices,
    addToWatchlist,
    removeFromWatchlist,
    isAddingStock
  } = useStockWatchlist();

  const getPriceData = (symbol: string) => {
    return prices.find(p => p.symbol === symbol);
  };

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            ⭐ Stock Watchlist
            <Badge variant="secondary" className="bg-success/10 text-success">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <AddStockDialog 
              onAdd={(symbol, name) => addToWatchlist({ symbol, name })} 
              isAdding={isAddingStock} 
            />
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        {isLoadingWatchlist ? (
          <LoadingSkeleton />
        ) : watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No stocks in watchlist</p>
            <p className="text-xs text-muted-foreground">Add stocks to track their prices</p>
          </div>
        ) : (
          <div className="px-1 pb-4">
            {watchlist.map((stock: any) => {
              const priceData = getPriceData(stock.symbol);
              return (
                <WatchlistItem
                  key={stock.id}
                  symbol={stock.symbol}
                  name={stock.name}
                  price={priceData?.price}
                  change={priceData?.change}
                  changePercent={priceData?.changePercent}
                  onRemove={() => removeFromWatchlist(stock.id)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};