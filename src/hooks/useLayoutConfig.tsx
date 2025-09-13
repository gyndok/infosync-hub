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
  { id: 'clock', type: 'clock', x: 0, y: 0, w: 2, h: 2, minH: 2, maxH: 3, minW: 2, maxW: 3 },
  { id: 'news', type: 'news', x: 0, y: 2, w: 1, h: 4, minH: 3, maxH: 6 },
  { id: 'weather', type: 'weather', x: 1, y: 2, w: 1, h: 4, minH: 3, maxH: 6 },
  { id: 'indices', type: 'indices', x: 0, y: 6, w: 1, h: 3, minH: 2, maxH: 4 },
  { id: 'watchlist', type: 'watchlist', x: 1, y: 6, w: 1, h: 3, minH: 3, maxH: 5 },
  { id: 'crypto', type: 'crypto', x: 0, y: 9, w: 1, h: 3, minH: 3, maxH: 5 },
  { id: 'sports', type: 'sports', x: 1, y: 9, w: 1, h: 3, minH: 3, maxH: 5 },
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
          .from('user_preferences')
          .select('dashboard_layout, clock_settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading layout config:', error);
          setLayoutConfig(defaultLayout);
        } else if (data && (data as any).dashboard_layout) {
          const config = (data as any).dashboard_layout as unknown as LayoutConfig;
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

          // Ensure clock widget exists for users with older saved layouts and spans full width
          let finalConfig = validatedConfig;
          const existingClock = validatedConfig.widgets.find(w => w.type === 'clock' || w.id === 'clock');
          if (!existingClock) {
            const nextY = validatedConfig.widgets.reduce((max, w) => Math.max(max, (w.y || 0) + (w.h || 1)), 0);
            finalConfig = {
              ...validatedConfig,
              widgets: [
                { id: 'clock', type: 'clock', x: 0, y: 0, w: validatedConfig.columns, h: 2, minH: 2, maxH: 3, minW: 2, maxW: 3 },
                ...validatedConfig.widgets.map(w => ({ ...w, y: w.y + 2 }))
              ]
            };
          } else if (existingClock.w < validatedConfig.columns) {
            // Update existing clock to span full width if it doesn't already
            finalConfig = {
              ...validatedConfig,
              widgets: validatedConfig.widgets.map(w => 
                w.id === 'clock' || w.type === 'clock' 
                  ? { ...w, w: validatedConfig.columns, x: 0, minW: 2, maxW: 3 }
                  : w
              )
            };
          }

          setLayoutConfig(finalConfig);
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
      // Ensure a preferences row exists; update if found, otherwise insert
      const { data: existing, error: fetchErr } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (existing) {
        const { error: updateErr } = await supabase
          .from('user_preferences')
          .update({ dashboard_layout: newConfig as any })
          .eq('user_id', user.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, dashboard_layout: newConfig as any });
        if (insertErr) throw insertErr;
      }

      setLayoutConfig(newConfig);
      toast({
        title: "Layout saved",
        description: "Your dashboard layout has been saved.",
      });
    } catch (error: any) {
      console.error('Error saving layout:', error);
      toast({
        title: "Error saving layout",
        description: error?.message || "Failed to save your dashboard layout.",
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
        w: widget.type === 'clock' || widget.id === 'clock' ? columns : Math.min(widget.w, columns),
        x: Math.min(widget.x, columns - 1)
      }))
    };
    saveLayoutConfig(newConfig);
  };

  // Update widget layout (local only)
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

  // Save widget layout immediately from RGL callback
  const saveLayoutFromLayouts = (layouts: any[]) => {
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
    saveLayoutConfig(newConfig);
  };

  // Manual save current layout
  const saveCurrentLayout = () => {
    saveLayoutConfig(layoutConfig);
  };

  // Reset to default layout
  const resetLayout = () => {
    const resetConfig = {
      ...defaultLayout,
      columns: layoutConfig.columns
    };
    // Update UI immediately regardless of save outcome
    setLayoutConfig(resetConfig);
    // Persist in background
    saveLayoutConfig(resetConfig);
  };
  return {
    layoutConfig,
    isLoading,
    isSaving,
    updateColumnCount,
    updateWidgetLayout,
    saveLayoutFromLayouts,
    saveCurrentLayout,
    resetLayout
  };
};