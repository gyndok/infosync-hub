import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.50, change: +2.45, changePercent: +1.31 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: -1.20, changePercent: -0.86 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: +5.67, changePercent: +1.52 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.22, changePercent: -1.28 },
];

const crypto = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43250, change: +1250, changePercent: +2.98 },
  { symbol: 'ETH', name: 'Ethereum', price: 2680, change: -45, changePercent: -1.65 },
];

export const FinanceWidget: React.FC = () => {
  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          📊 Markets
          <span className="ml-auto text-xs bg-success/10 text-success px-2 py-1 rounded-full">
            Market Open
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {/* Stocks Section */}
          <div className="p-4 border-b border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-3">Stocks</h4>
            <div className="space-y-3">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground">{stock.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${stock.price.toFixed(2)}</span>
                    <div className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                      stock.change > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {stock.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crypto Section */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Cryptocurrency</h4>
            <div className="space-y-3">
              {crypto.map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{coin.symbol}</span>
                      <span className="text-xs text-muted-foreground">{coin.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${coin.price.toLocaleString()}</span>
                    <div className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                      coin.change > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {coin.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {coin.changePercent > 0 ? '+' : ''}{coin.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};