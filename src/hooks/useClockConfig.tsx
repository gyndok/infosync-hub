import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SavedTimeZoneConfig {
  id: string;
  city: string;
  timezone: string;
  isCustom?: boolean;
  customId?: string;
}

export interface ClockSettings {
  selectedTimezones: SavedTimeZoneConfig[];
}

const defaultClockSettings: ClockSettings = {
  selectedTimezones: [
    { id: 'local', city: 'Local Time', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { id: 'ny', city: 'New York', timezone: 'America/New_York' },
    { id: 'london', city: 'London', timezone: 'Europe/London' },
    { id: 'tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { id: 'sydney', city: 'Sydney', timezone: 'Australia/Sydney' },
  ]
};

export const useClockConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clockSettings, setClockSettings] = useState<ClockSettings>(defaultClockSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load clock configuration
  useEffect(() => {
    const loadClockConfig = async () => {
      if (!user) {
        setClockSettings(defaultClockSettings);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('clock_settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading clock config:', error);
          setClockSettings(defaultClockSettings);
        } else if (data && (data as any).clock_settings) {
          const settings = (data as any).clock_settings as ClockSettings;
          setClockSettings(settings);
        } else {
          setClockSettings(defaultClockSettings);
        }
      } catch (error) {
        console.error('Error loading clock config:', error);
        setClockSettings(defaultClockSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadClockConfig();
  }, [user]);

  // Save clock configuration
  const saveClockConfig = async (newSettings: ClockSettings) => {
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
          .update({ clock_settings: newSettings as any })
          .eq('user_id', user.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('user_preferences')
          .insert({ 
            user_id: user.id, 
            clock_settings: newSettings as any,
            dashboard_layout: { columns: 2, widgets: [] } as any
          });
        if (insertErr) throw insertErr;
      }

      setClockSettings(newSettings);
      console.log('Clock settings saved successfully');
    } catch (error: any) {
      console.error('Error saving clock settings:', error);
      toast({
        title: "Error saving clock settings",
        description: error?.message || "Failed to save your clock settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    clockSettings,
    isLoading,
    isSaving,
    saveClockConfig,
  };
};