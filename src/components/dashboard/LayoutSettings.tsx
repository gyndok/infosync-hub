import React, { useState } from 'react';
import { Settings, Layout, RotateCcw, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

const AVAILABLE_WIDGETS = [
  { id: 'news', name: 'General News', description: 'Latest breaking news' },
  { id: 'weather', name: 'Weather', description: 'Current weather conditions' },
  { id: 'indices', name: 'Stock Indices', description: 'Major market indices' },
  { id: 'watchlist', name: 'Stock Watchlist', description: 'Personal stock watchlist' },
  { id: 'crypto', name: 'Cryptocurrency', description: 'Crypto market data' },
  { id: 'sports', name: 'General Sports', description: 'Sports scores and news' },
  { id: 'clock', name: 'World Clock', description: 'Multiple timezone clocks' },
  { id: 'khou_sports', name: 'KHOU Sports', description: 'Houston sports news' },
  { id: 'khou_astros', name: 'Houston Astros', description: 'Astros baseball news' },
  { id: 'khou_rockets', name: 'Houston Rockets', description: 'Rockets basketball news' },
  { id: 'khou_texans', name: 'Houston Texans', description: 'Texans football news' },
  { id: 'khou_local', name: 'Houston Local News', description: 'Local Houston news' },
  { id: 'houston_traffic', name: 'Houston Traffic', description: 'Real-time traffic and metro alerts' },
  { id: 'texas_longhorns', name: 'Texas Longhorns', description: 'Texas Longhorns football news' },
];

export const LayoutSettings: React.FC = () => {
  const { 
    layoutConfig, 
    isSaving,
    updateColumnCount, 
    saveCurrentLayout, 
    resetLayout,
    addWidget: addWidgetToLayout
  } = useLayoutConfig();
  const [selectedWidget, setSelectedWidget] = useState('');

  const addWidget = () => {
    if (!selectedWidget) return;
    
    const success = addWidgetToLayout(selectedWidget);
    if (success) {
      setSelectedWidget('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Layout className="w-4 h-4" />
          Layout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Layout
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Widget */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Widget</Label>
            <div className="flex gap-2">
              <Select value={selectedWidget} onValueChange={setSelectedWidget}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a widget to add" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_WIDGETS
                    .filter(widget => !layoutConfig.widgets.some(w => w.id === widget.id || w.type === widget.id))
                    .map(widget => (
                      <SelectItem key={widget.id} value={widget.id}>
                        <div>
                          <div className="font-medium">{widget.name}</div>
                          <div className="text-xs text-muted-foreground">{widget.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={addWidget}
                disabled={!selectedWidget}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Column Count */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Grid Columns</Label>
            <RadioGroup
              value={layoutConfig.columns.toString()}
              onValueChange={(value) => updateColumnCount(Number(value) as 2 | 3)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="cols-2" />
                <Label htmlFor="cols-2" className="flex items-center gap-2">
                  2 Columns
                  <Badge variant="outline" className="text-xs">Balanced</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="cols-3" />
                <Label htmlFor="cols-3" className="flex items-center gap-2">
                  3 Columns
                  <Badge variant="outline" className="text-xs">Compact</Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Widget Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Widget Count</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{layoutConfig.widgets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Columns:</span>
                <span className="font-medium">{layoutConfig.columns}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <h4 className="font-medium text-foreground">How to customize:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Drag widgets to reposition</li>
                  <li>• Resize by dragging corners</li>
                  <li>• Widgets can span 1-{layoutConfig.columns} columns</li>
                  <li>• Changes auto-save</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={saveCurrentLayout}
              disabled={isSaving}
              className="flex-1 gap-2"
              size="sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
            <Button 
              onClick={resetLayout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};