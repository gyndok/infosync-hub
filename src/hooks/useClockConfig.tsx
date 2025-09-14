import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import logger from '@/lib/logger';

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
      // Use upsert approach with proper type handling
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          clock_settings: newSettings,
        } as any, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setClockSettings(newSettings);
      logger.debug('Clock settings saved successfully');
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