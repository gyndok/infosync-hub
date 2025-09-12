import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WidgetConfig {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export interface LayoutConfig {
  columns: 2 | 3;
  widgets: WidgetConfig[];
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'news', type: 'news', x: 0, y: 0, w: 1, h: 4, minH: 3, maxH: 6 },
  { id: 'weather', type: 'weather', x: 1, y: 0, w: 1, h: 4, minH: 3, maxH: 6 },
  { id: 'indices', type: 'indices', x: 0, y: 4, w: 1, h: 3, minH: 2, maxH: 4 },
  { id: 'watchlist', type: 'watchlist', x: 1, y: 4, w: 1, h: 3, minH: 3, maxH: 5 },
  { id: 'crypto', type: 'crypto', x: 0, y: 7, w: 1, h: 3, minH: 3, maxH: 5 },
  { id: 'sports', type: 'sports', x: 1, y: 7, w: 1, h: 3, minH: 3, maxH: 5 },
];

const defaultLayout: LayoutConfig = {
  columns: 2,
  widgets: defaultWidgets
};

export const useLayoutConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(defaultLayout);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load layout configuration
  useEffect(() => {
    const loadLayoutConfig = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_widgets')
          .select('configuration')
          .eq('user_id', user.id)
          .eq('widget_type', 'layout')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading layout config:', error);
          setLayoutConfig(defaultLayout);
        } else if (data && data[0]) {
          const config = data[0].configuration as unknown as LayoutConfig;
          // Ensure all widgets have required properties
          const validatedConfig = {
            ...config,
            widgets: config.widgets.map(widget => ({
              ...widget,
              minH: widget.minH || 2,
              maxH: widget.maxH || 6,
              minW: widget.minW || 1,
              maxW: widget.maxW || config.columns
            }))
          };
          setLayoutConfig(validatedConfig);
        } else {
          setLayoutConfig(defaultLayout);
        }
      } catch (error) {
        console.error('Error loading layout config:', error);
        setLayoutConfig(defaultLayout);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayoutConfig();
  }, [user]);

  // Save layout configuration
  const saveLayoutConfig = async (newConfig: LayoutConfig) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_widgets')
        .upsert({
          user_id: user.id,
          widget_type: 'layout',
          configuration: newConfig as any
        });

      if (error) {
        throw error;
      }

      setLayoutConfig(newConfig);
      toast({
        title: "Layout saved",
        description: "Your dashboard layout has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error saving layout",
        description: "Failed to save your dashboard layout.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update column count
  const updateColumnCount = (columns: 2 | 3) => {
    const newConfig = {
      ...layoutConfig,
      columns,
      widgets: layoutConfig.widgets.map(widget => ({
        ...widget,
        maxW: columns,
        w: Math.min(widget.w, columns),
        x: Math.min(widget.x, columns - 1)
      }))
    };
    saveLayoutConfig(newConfig);
  };

  // Update widget layout
  const updateWidgetLayout = (layouts: any[]) => {
    const newConfig = {
      ...layoutConfig,
      widgets: layouts.map(layout => {
        const existingWidget = layoutConfig.widgets.find(w => w.id === layout.i);
        return {
          ...existingWidget!,
          x: layout.x,
          y: layout.y,
          w: layout.w,
          h: layout.h
        };
      })
    };
    setLayoutConfig(newConfig);
  };

  // Save current layout
  const saveCurrentLayout = () => {
    saveLayoutConfig(layoutConfig);
  };

  // Reset to default layout
  const resetLayout = () => {
    const resetConfig = {
      ...defaultLayout,
      columns: layoutConfig.columns
    };
    saveLayoutConfig(resetConfig);
  };

  return {
    layoutConfig,
    isLoading,
    isSaving,
    updateColumnCount,
    updateWidgetLayout,
    saveCurrentLayout,
    resetLayout
  };
};