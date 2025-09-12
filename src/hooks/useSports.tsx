import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useApiProxy } from './useApiProxy';
import { useToast } from './use-toast';

interface SportsData {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
  strStatus: string;
  strLeague: string;
  dateEvent: string;
  strTime: string;
  strThumb?: string;
}

interface SportsConfig {
  favoriteTeams: string[];
  preferredLeagues: string[];
}

export const useSports = () => {
  const { user } = useAuth();
  const { makeRequest } = useApiProxy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultConfig = {
    favoriteTeams: ['Arsenal', 'Manchester United', 'Liverpool'],
    preferredLeagues: ['English Premier League', 'UEFA Champions League']
  };

  // Fetch user's sports preferences
  const configQuery = useQuery({
    queryKey: ['sports-config', user?.id],
    queryFn: async () => {
      if (!user) return defaultConfig;
      
      const { data, error } = await supabase
        .from('user_widgets')
        .select('configuration')
        .eq('user_id', user.id)
        .eq('widget_type', 'sports')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching sports config:', error);
        return defaultConfig;
      }
      
      const config = data?.[0]?.configuration as unknown as SportsConfig | null;
      return config || defaultConfig;
    },
    enabled: !!user,
  });

  // Fetch live sports data from TheSportsDB
  const fetchSportsData = async (): Promise<SportsData[]> => {
    try {
      // Get recent events from Premier League (ID: 4328)
      const response = await makeRequest({
        service: 'thesportsdb',
        endpoint: '/eventspastleague.php',
        params: {
          id: '4328' // Premier League ID
        }
      });

      if (response.success && response.data?.events) {
        return response.data.events.slice(0, 5); // Get latest 5 events
      }
    } catch (error) {
      console.error('Error fetching sports data:', error);
    }
    
    return [];
  };

  const sportsQuery = useQuery({
    queryKey: ['sports-data'],
    queryFn: fetchSportsData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Data is fresh for 30 seconds
  });

  // Update sports configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: SportsConfig) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_widgets')
        .upsert({
          user_id: user.id,
          widget_type: 'sports',
          configuration: newConfig as any
        });
      
      if (error) throw error;
      return newConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports-config', user?.id] });
      toast({
        title: "Settings updated",
        description: "Sports widget settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add favorite team
  const addFavoriteTeam = (teamName: string) => {
    const currentConfig = configQuery.data || defaultConfig;
    if (!currentConfig.favoriteTeams.includes(teamName)) {
      const newConfig = {
        ...currentConfig,
        favoriteTeams: [...currentConfig.favoriteTeams, teamName]
      };
      updateConfigMutation.mutate(newConfig);
    }
  };

  // Remove favorite team
  const removeFavoriteTeam = (teamName: string) => {
    const currentConfig = configQuery.data || defaultConfig;
    const newConfig = {
      ...currentConfig,
      favoriteTeams: currentConfig.favoriteTeams.filter(team => team !== teamName)
    };
    updateConfigMutation.mutate(newConfig);
  };

  return {
    sportsData: sportsQuery.data || [],
    isLoading: sportsQuery.isLoading,
    error: sportsQuery.error,
    config: configQuery.data || defaultConfig,
    addFavoriteTeam,
    removeFavoriteTeam,
    updateConfig: updateConfigMutation.mutate,
    isUpdatingConfig: updateConfigMutation.isPending,
    refetch: sportsQuery.refetch
  };
};