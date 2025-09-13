import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CustomCity {
  id: string;
  city_name: string;
  timezone: string;
  created_at: string;
}

export const useCustomCities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customCities, setCustomCities] = useState<CustomCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load custom cities
  useEffect(() => {
    const loadCustomCities = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_custom_cities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading custom cities:', error);
          toast({
            title: "Error loading custom cities",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setCustomCities(data || []);
        }
      } catch (error: any) {
        console.error('Error loading custom cities:', error);
        toast({
          title: "Error loading custom cities",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomCities();
  }, [user, toast]);

  // Add custom city
  const addCustomCity = async (cityName: string, timezone: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add custom cities.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_custom_cities')
        .insert({
          user_id: user.id,
          city_name: cityName,
          timezone: timezone,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "City already exists",
            description: `${cityName} is already in your custom cities.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error adding city",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }

      setCustomCities(prev => [...prev, data]);
      toast({
        title: "City added",
        description: `${cityName} has been added to your world clock.`,
      });
      return true;
    } catch (error: any) {
      console.error('Error adding custom city:', error);
      toast({
        title: "Error adding city",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove custom city
  const removeCustomCity = async (cityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_custom_cities')
        .delete()
        .eq('id', cityId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error removing city",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setCustomCities(prev => prev.filter(city => city.id !== cityId));
      toast({
        title: "City removed",
        description: "City has been removed from your world clock.",
      });
      return true;
    } catch (error: any) {
      console.error('Error removing custom city:', error);
      toast({
        title: "Error removing city",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    customCities,
    isLoading,
    addCustomCity,
    removeCustomCity,
  };
};