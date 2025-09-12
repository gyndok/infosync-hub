import React, { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DraggableWidget } from './DraggableWidget';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { MajorIndicesWidget } from '@/components/widgets/MajorIndicesWidget';
import { StockWatchlistWidget } from '@/components/widgets/StockWatchlistWidget';
import { CryptocurrencyWidget } from '@/components/widgets/CryptocurrencyWidget';
import { SportsWidget } from '@/components/widgets/SportsWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetComponents = {
  news: NewsWidget,
  weather: WeatherWidget,
  indices: MajorIndicesWidget,
  watchlist: StockWatchlistWidget,
  crypto: CryptocurrencyWidget,
  sports: SportsWidget,
};

export const GridLayout: React.FC = () => {
  const { layoutConfig, updateWidgetLayout, saveCurrentLayout } = useLayoutConfig();

  const layouts = useMemo(() => {
    const baseLayouts = layoutConfig.widgets.map(widget => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW || 1,
      maxW: widget.maxW || layoutConfig.columns,
      minH: widget.minH || 2,
      maxH: widget.maxH || 6,
    }));

    return {
      lg: baseLayouts,
      md: baseLayouts,
      sm: baseLayouts.map(layout => ({ ...layout, w: Math.min(layout.w, 2), x: layout.x % 2 })),
      xs: baseLayouts.map(layout => ({ ...layout, w: 1, x: 0 })),
    };
  }, [layoutConfig]);

  const breakpoints = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
  };

  const cols = {
    lg: layoutConfig.columns,
    md: layoutConfig.columns,
    sm: 2,
    xs: 1,
  };

  const handleLayoutChange = (layout: any[], layouts: any) => {
    updateWidgetLayout(layout);
  };

  const handleDragStop = () => {
    // Auto-save after drag
    setTimeout(() => {
      saveCurrentLayout();
    }, 1000);
  };

  const handleResizeStop = () => {
    // Auto-save after resize
    setTimeout(() => {
      saveCurrentLayout();
    }, 1000);
  };

  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        onLayoutChange={handleLayoutChange}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        draggableHandle=".widget-header"
        resizeHandles={['se']}
      >
        {layoutConfig.widgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.type as keyof typeof widgetComponents];
          
          if (!WidgetComponent) {
            return (
              <div key={widget.id}>
                <DraggableWidget>
                  <div className="h-full border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Unknown widget: {widget.type}</span>
                  </div>
                </DraggableWidget>
              </div>
            );
          }

          return (
            <div key={widget.id}>
              <DraggableWidget>
                <WidgetComponent />
              </DraggableWidget>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};