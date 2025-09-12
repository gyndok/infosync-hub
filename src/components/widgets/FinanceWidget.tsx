import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Bell, Briefcase, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useFinance } from '@/hooks/useFinance';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePortfolioDialog } from '@/components/finance/CreatePortfolioDialog';
import { AddHoldingDialog } from '@/components/finance/AddHoldingDialog';
import { AddPriceAlertDialog } from '@/components/finance/AddPriceAlertDialog';

const AssetItem: React.FC<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}> = ({ symbol, name, price, change, changePercent, volume, marketCap }) => (
  <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{symbol}</span>
        <span className="text-xs text-muted-foreground truncate">{name}</span>
      </div>
      {(volume || marketCap) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {volume && <span>Vol: ${volume.toLocaleString()}</span>}
          {marketCap && <span>MCap: ${marketCap.toLocaleString()}</span>}
        </div>
      )}
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-sm font-medium">
          ${typeof price === 'number' ? price.toLocaleString(undefined, { 
            minimumFractionDigits: price > 1000 ? 0 : 2, 
            maximumFractionDigits: price > 1000 ? 0 : 2 
          }) : '0.00'}
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
    {[1, 2, 3, 4].map((i) => (
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

export const FinanceWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState('markets');
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const {
    stocks,
    crypto,
    portfolios,
    holdings,
    priceAlerts,
    isLoadingStocks,
    isLoadingCrypto,
    isLoadingPortfolios,
    isLoadingHoldings,
    isLoadingAlerts,
    deletePriceAlert
  } = useFinance();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      const currentPrice = [...stocks, ...crypto].find(
        asset => asset.symbol === holding.symbol
      )?.price || holding.avg_cost_per_unit;
      return total + (holding.quantity * currentPrice);
    }, 0);
  };

  const activeAlerts = priceAlerts.filter(alert => alert.is_active && !alert.is_triggered);
  const triggeredAlerts = priceAlerts.filter(alert => alert.is_triggered);

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            📊 Finance
            <Badge variant="secondary" className="bg-success/10 text-success">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {triggeredAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <Bell className="w-3 h-3 mr-1" />
                {triggeredAlerts.length}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-4 mx-4 mb-2">
            <TabsTrigger value="markets" className="text-xs">Markets</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
            <TabsTrigger value="watchlist" className="text-xs">Watch</TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {/* Stocks Section */}
              <div className="border-b border-border/50">
                <div className="p-4 pb-2">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    Stocks
                    {isLoadingStocks && <RefreshCw className="w-3 h-3 animate-spin" />}
                  </h4>
                </div>
                {isLoadingStocks ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="px-1">
                    {stocks.map((stock) => (
                      <AssetItem
                        key={stock.symbol}
                        symbol={stock.symbol}
                        name={stock.name}
                        price={stock.price}
                        change={stock.change}
                        changePercent={stock.changePercent}
                        volume={stock.volume}
                        marketCap={stock.marketCap}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Crypto Section */}
              <div className="p-4 pb-2">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  Cryptocurrency
                  {isLoadingCrypto && <RefreshCw className="w-3 h-3 animate-spin" />}
                </h4>
              </div>
              {isLoadingCrypto ? (
                <LoadingSkeleton />
              ) : (
                <div className="px-1 pb-4">
                  {crypto.map((coin) => (
                    <AssetItem
                      key={coin.symbol}
                      symbol={coin.symbol}
                      name={coin.name}
                      price={coin.price}
                      change={coin.change}
                      changePercent={coin.changePercent}
                      volume={coin.volume}
                      marketCap={coin.marketCap}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="portfolio" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Portfolio Value</h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(calculatePortfolioValue())}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (portfolios.length === 0) {
                      setShowCreatePortfolio(true);
                    } else {
                      setShowAddHolding(true);
                    }
                  }}>
                    <Plus className="w-4 h-4 mr-1" />
                    {portfolios.length === 0 ? 'Create Portfolio' : 'Add Holding'}
                  </Button>
                </div>

                {isLoadingHoldings ? (
                  <LoadingSkeleton />
                ) : holdings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No holdings yet</p>
                    <p className="text-xs text-muted-foreground">Add your first investment</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {holdings.map((holding) => {
                      const currentPrice = [...stocks, ...crypto].find(
                        asset => asset.symbol === holding.symbol
                      )?.price || holding.avg_cost_per_unit;
                      const totalValue = holding.quantity * currentPrice;
                      const totalCost = holding.quantity * holding.avg_cost_per_unit;
                      const pnl = totalValue - totalCost;
                      const pnlPercent = totalCost > 0 ? ((pnl / totalCost) * 100) : 0;

                      return (
                        <div key={holding.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{holding.symbol}</span>
                                <Badge variant="outline" className="text-xs">
                                  {holding.asset_type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {holding.quantity} shares
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(totalValue)}</p>
                              <div className={cn(
                                "text-xs flex items-center gap-1",
                                pnl >= 0 ? "text-success" : "text-destructive"
                              )}>
                                {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPercent.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-foreground">Price Alerts</h4>
                  <Button size="sm" variant="outline" onClick={() => setShowAddAlert(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Alert
                  </Button>
                </div>

                {triggeredAlerts.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Triggered Alerts
                    </h5>
                    <div className="space-y-2">
                      {triggeredAlerts.map((alert) => (
                        <div key={alert.id} className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{alert.symbol}</p>
                              <p className="text-xs text-muted-foreground">
                                {alert.alert_type === 'above' ? 'Above' : alert.alert_type === 'below' ? 'Below' : 'Change'} ${alert.target_value}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">Triggered</Badge>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deletePriceAlert(alert.id)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isLoadingAlerts ? (
                  <LoadingSkeleton />
                ) : activeAlerts.length === 0 && triggeredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No price alerts</p>
                    <p className="text-xs text-muted-foreground">Set up alerts to track prices</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{alert.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                              {alert.alert_type === 'above' ? 'Above' : alert.alert_type === 'below' ? 'Below' : 'Change'} ${alert.target_value}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Active</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deletePriceAlert(alert.id)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="watchlist" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-foreground">Watchlist</h4>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Symbol
                  </Button>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No watchlist items</p>
                  <p className="text-xs text-muted-foreground">Add symbols to track</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreatePortfolioDialog 
          open={showCreatePortfolio} 
          onOpenChange={setShowCreatePortfolio} 
        />
        <AddHoldingDialog 
          open={showAddHolding} 
          onOpenChange={setShowAddHolding}
          portfolioId={portfolios.find(p => p.is_default)?.id}
        />
        <AddPriceAlertDialog 
          open={showAddAlert} 
          onOpenChange={setShowAddAlert} 
        />
      </CardContent>
    </Card>
  );
};