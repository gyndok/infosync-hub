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
import { ClockWidget } from '@/components/widgets/ClockWidget';
import { KHOUSportsWidget } from '@/components/widgets/KHOUSportsWidget';
import { KHOUAstrosWidget } from '@/components/widgets/KHOUAstrosWidget';
import { KHOURocketsWidget } from '@/components/widgets/KHOURocketsWidget';
import { KHOUTexansWidget } from '@/components/widgets/KHOUTexansWidget';
import { KHOULocalWidget } from '@/components/widgets/KHOULocalWidget';
import { TexasLonghornsWidget } from '@/components/widgets/TexasLonghornsWidget';
import { HoustonTrafficWidget } from '@/components/widgets/HoustonTrafficWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetComponents = {
  news: NewsWidget,
  weather: WeatherWidget,
  indices: MajorIndicesWidget,
  watchlist: StockWatchlistWidget,
  crypto: CryptocurrencyWidget,
  sports: SportsWidget,
  clock: ClockWidget,
  khou_sports: KHOUSportsWidget,
  khou_astros: KHOUAstrosWidget,
  khou_rockets: KHOURocketsWidget,
  khou_texans: KHOUTexansWidget,
  khou_local: KHOULocalWidget,
  houston_traffic: HoustonTrafficWidget,
  texas_longhorns: TexasLonghornsWidget,
} as const;

export const GridLayout: React.FC = () => {
  const { layoutConfig, updateWidgetLayout, saveLayoutFromLayouts, removeWidget } = useLayoutConfig();

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
      static: false
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
  } as const;

  const cols = {
    lg: layoutConfig.columns,
    md: layoutConfig.columns,
    sm: 2,
    xs: 1,
  } as const;

  const handleLayoutChange = (layout: any[]) => {
    updateWidgetLayout(layout);
  };

  const handleDragStop = (layout: any[]) => {
    saveLayoutFromLayouts(layout);
  };

  const handleResizeStop = (layout: any[]) => {
    saveLayoutFromLayouts(layout);
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
        draggableHandle=".drag-handle"
        draggableCancel=".widget-action, .no-drag, button, input, a"
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
                <WidgetComponent onRemove={() => removeWidget(widget.id)} />
              </DraggableWidget>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};