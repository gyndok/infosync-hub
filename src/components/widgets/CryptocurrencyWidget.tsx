import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Settings, RefreshCw, Bitcoin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCryptocurrency } from '@/hooks/useCryptocurrency';

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

const CryptoItem: React.FC<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}> = ({ symbol, name, price, change, changePercent, marketCap, volume }) => (
  <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{symbol}</span>
        <span className="text-xs text-muted-foreground truncate">{name}</span>
      </div>
      {(volume || marketCap) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {volume && <span>Vol: ${(volume / 1e9).toFixed(1)}B</span>}
          {marketCap && <span>MCap: ${(marketCap / 1e9).toFixed(1)}B</span>}
        </div>
      )}
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

const CryptoSettingsDialog: React.FC<{
  config: any;
  onUpdateConfig: (config: any) => void;
  isUpdating: boolean;
}> = ({ config, onUpdateConfig, isUpdating }) => {
  const [selectedCurrencies, setSelectedCurrencies] = useState(config.currencies || []);
  const [open, setOpen] = useState(false);

  const availableCrypto = [
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'binancecoin', name: 'BNB' },
    { id: 'cardano', name: 'Cardano' },
    { id: 'solana', name: 'Solana' },
    { id: 'polkadot', name: 'Polkadot' },
    { id: 'dogecoin', name: 'Dogecoin' },
    { id: 'avalanche-2', name: 'Avalanche' },
    { id: 'chainlink', name: 'Chainlink' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'litecoin', name: 'Litecoin' },
    { id: 'stellar', name: 'Stellar' },
  ];

  const handleToggleCrypto = (cryptoId: string, checked: boolean) => {
    if (checked) {
      setSelectedCurrencies([...selectedCurrencies, cryptoId]);
    } else {
      setSelectedCurrencies(selectedCurrencies.filter(id => id !== cryptoId));
    }
  };

  const handleSave = () => {
    onUpdateConfig({ currencies: selectedCurrencies });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Cryptocurrencies</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {availableCrypto.map((crypto) => (
              <div key={crypto.id} className="flex items-center space-x-2">
                <Checkbox
                  id={crypto.id}
                  checked={selectedCurrencies.includes(crypto.id)}
                  onCheckedChange={(checked) => handleToggleCrypto(crypto.id, checked as boolean)}
                />
                <label htmlFor={crypto.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {crypto.name}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || selectedCurrencies.length === 0}>
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
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

export const CryptocurrencyWidget: React.FC = () => {
  const { crypto, isLoading, config, updateConfig, isUpdatingConfig } = useCryptocurrency();

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            ₿ Cryptocurrency
            <Badge variant="secondary" className="bg-success/10 text-success">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <CryptoSettingsDialog 
              config={config} 
              onUpdateConfig={updateConfig}
              isUpdating={isUpdatingConfig}
            />
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        {isLoading ? (
          <LoadingSkeleton />
        ) : crypto.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bitcoin className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No cryptocurrencies selected</p>
            <p className="text-xs text-muted-foreground">Use settings to add cryptocurrencies</p>
          </div>
        ) : (
          <div className="px-1 pb-4">
            {crypto.map((coin) => (
              <CryptoItem
                key={coin.id}
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
      </CardContent>
    </Card>
  );
};