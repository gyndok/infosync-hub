import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useApiProxy } from './useApiProxy';
import { useToast } from '@/hooks/use-toast';

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
  enableNotifications: boolean;
}

interface LeagueStanding {
  idTeam: string;
  strTeam: string;
  intRank: string;
  intPlayed: string;
  intWin: string;
  intLoss: string;
  intGoalsFor?: string;
  intGoalsAgainst?: string;
  intGoalDifference?: string;
  intPoints?: string;
}

export const useSports = () => {
  const { user } = useAuth();
  const { makeRequest } = useApiProxy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultConfig = {
    favoriteTeams: ['Astros', 'Texans', 'Rockets', 'Lightning'],
    preferredLeagues: ['MLB', 'NBA', 'NFL', 'NHL', 'NCAAF'],
    enableNotifications: true
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

  // US Sports League IDs for TheSportsDB
  const usLeagueIds = {
    MLB: '4424',
    NBA: '4387', 
    NFL: '4391',
    NHL: '4380',
    NCAAF: '4417' // NCAA Football
  };

  // Fetch live sports data from multiple US leagues
  const fetchSportsData = async (): Promise<SportsData[]> => {
    const allEvents: SportsData[] = [];
    
    try {
      // Fetch recent events from all major US sports
      for (const [league, leagueId] of Object.entries(usLeagueIds)) {
        const response = await makeRequest({
          service: 'thesportsdb',
          endpoint: '/eventspastleague.php',
          params: {
            id: leagueId
          }
        });

        if (response.success && response.data?.events) {
          const events = response.data.events.slice(0, 5).map((event: any) => ({
            ...event,
            strLeague: league // Add league abbreviation
          }));
          allEvents.push(...events);
        }
      }

      // Also fetch upcoming events for each league
      for (const [league, leagueId] of Object.entries(usLeagueIds)) {
        const upcomingResponse = await makeRequest({
          service: 'thesportsdb',
          endpoint: '/eventsnextleague.php',
          params: {
            id: leagueId
          }
        });

        if (upcomingResponse.success && upcomingResponse.data?.events) {
          const upcomingEvents = upcomingResponse.data.events.slice(0, 10).map((event: any) => ({
            ...event,
            strLeague: league // Add league abbreviation
          }));
          allEvents.push(...upcomingEvents);
        }
      }
      
      // Debug: Log some sample events to see team names
      console.log('Sample sports events:', allEvents.slice(0, 5));
      
      // Sort by date (upcoming first, then recent) and return latest 20 events
      return allEvents
        .sort((a, b) => new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime())
        .slice(0, 20);
    } catch (error) {
      console.error('Error fetching sports data:', error);
    }
    
    return [];
  };

  // Fetch league standings
  const fetchStandings = async (league: string): Promise<LeagueStanding[]> => {
    try {
      const leagueId = usLeagueIds[league as keyof typeof usLeagueIds];
      if (!leagueId) return [];

      const response = await makeRequest({
        service: 'thesportsdb',
        endpoint: '/lookuptable.php',
        params: {
          l: leagueId,
          s: '2024-2025' // Current season
        }
      });

      if (response.success && response.data?.table) {
        return response.data.table.slice(0, 10); // Top 10 teams
      }
    } catch (error) {
      console.error(`Error fetching ${league} standings:`, error);
    }
    
    return [];
  };

  const standingsQuery = useQuery({
    queryKey: ['sports-standings', configQuery.data?.preferredLeagues],
    queryFn: async () => {
      const standings: Record<string, LeagueStanding[]> = {};
      const leagues = configQuery.data?.preferredLeagues || defaultConfig.preferredLeagues;
      
      for (const league of leagues) {
        standings[league] = await fetchStandings(league);
      }
      
      return standings;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    enabled: !!configQuery.data,
  });

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

  // Check for live score notifications
  const checkLiveScores = () => {
    const favoriteTeams = configQuery.data?.favoriteTeams || defaultConfig.favoriteTeams;
    const liveGames = sportsQuery.data?.filter(game => 
      game.strStatus.toLowerCase().includes('live') ||
      game.strStatus.toLowerCase().includes('in progress')
    ) || [];
    
    const favoriteGamesLive = liveGames.filter(game =>
      favoriteTeams.some(team => 
        game.strHomeTeam.includes(team) || game.strAwayTeam.includes(team)
      )
    );
    
    if (favoriteGamesLive.length > 0 && configQuery.data?.enableNotifications) {
      favoriteGamesLive.forEach(game => {
        toast({
          title: "🏈 Live Game Alert!",
          description: `${game.strHomeTeam} vs ${game.strAwayTeam} is live!`,
        });
      });
    }
  };

  return {
    sportsData: sportsQuery.data || [],
    standings: standingsQuery.data || {},
    isLoading: sportsQuery.isLoading,
    isLoadingStandings: standingsQuery.isLoading,
    error: sportsQuery.error,
    config: configQuery.data || defaultConfig,
    addFavoriteTeam,
    removeFavoriteTeam,
    updateConfig: updateConfigMutation.mutate,
    isUpdatingConfig: updateConfigMutation.isPending,
    refetch: sportsQuery.refetch,
    checkLiveScores
  };
};