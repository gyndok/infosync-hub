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
  strPeriod?: string; // Inning, Quarter, Period, etc.
  strClock?: string; // Game clock if available
  // Additional real data fields
  homeRecord?: string;
  awayRecord?: string;
  homePitcher?: string;
  awayPitcher?: string;
  homeOdds?: number;
  awayOdds?: number;
  overUnder?: number;
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

  const LOCAL_STORAGE_KEY = 'sports-config';

  // Fetch user's sports preferences (supports anon via localStorage)
  const configQuery = useQuery({
    queryKey: ['sports-config', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = raw ? (JSON.parse(raw) as SportsConfig) : null;
          return parsed || defaultConfig;
        } catch {
          return defaultConfig;
        }
      }
      
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
    staleTime: 5 * 60 * 1000,
  });

  // ESPN API endpoints for US sports
  const espnEndpoints = {
    MLB: '/apis/site/v2/sports/baseball/mlb/scoreboard',
    NBA: '/apis/site/v2/sports/basketball/nba/scoreboard', 
    NFL: '/apis/site/v2/sports/football/nfl/scoreboard',
    NHL: '/apis/site/v2/sports/hockey/nhl/scoreboard',
    NCAAF: '/apis/site/v2/sports/football/college-football/scoreboard'
  };

  // Transform ESPN data to our format
  const transformEspnEvent = (event: any, league: string): SportsData | null => {
    const competition = event.competitions?.[0];
    if (!competition) {
      console.warn(`No competition data for event:`, event.id);
      return null;
    }
    
    const homeTeam = competition.competitors?.find((c: any) => c.homeAway === 'home');
    const awayTeam = competition.competitors?.find((c: any) => c.homeAway === 'away');
    const status = event.status || competition.status;
    
    if (!homeTeam || !awayTeam) {
      console.warn(`Missing team data for event:`, event.id, { homeTeam: !!homeTeam, awayTeam: !!awayTeam });
      return null;
    }
    
    // Extract period/inning information based on sport type
    let strPeriod = '';
    let strClock = '';
    
    if (status?.period && status?.displayClock) {
      strClock = status.displayClock;
      
      // Format period based on sport
      switch (league) {
        case 'MLB':
          if (status.period <= 9) {
            strPeriod = `${status.period === 1 ? '1st' : status.period === 2 ? '2nd' : status.period === 3 ? '3rd' : `${status.period}th`}`;
          } else {
            strPeriod = `${status.period}th`;
          }
          break;
        case 'NBA':
        case 'NCAAB':
          if (status.period <= 4) {
            strPeriod = `${status.period === 1 ? '1st' : status.period === 2 ? '2nd' : status.period === 3 ? '3rd' : '4th'} Qtr`;
          } else {
            strPeriod = `OT${status.period > 5 ? ` ${status.period - 4}` : ''}`;
          }
          break;
        case 'NFL':
        case 'NCAAF':
          if (status.period <= 4) {
            strPeriod = `${status.period === 1 ? '1st' : status.period === 2 ? '2nd' : status.period === 3 ? '3rd' : '4th'} Qtr`;
          } else {
            strPeriod = 'OT';
          }
          break;
        case 'NHL':
          if (status.period <= 3) {
            strPeriod = `${status.period === 1 ? '1st' : status.period === 2 ? '2nd' : '3rd'} Period`;
          } else {
            strPeriod = 'OT';
          }
          break;
        default:
          strPeriod = `Period ${status.period}`;
      }
    }
    
    const homeTeamName = homeTeam.team?.displayName || homeTeam.team?.name || 'Home';
    const awayTeamName = awayTeam.team?.displayName || awayTeam.team?.name || 'Away';
    
    // Extract additional real data where available
    const homeRecord = homeTeam.records?.[0]?.summary || homeTeam.team?.record?.summary || null;
    const awayRecord = awayTeam.records?.[0]?.summary || awayTeam.team?.record?.summary || null;
    
    // Extract pitcher information for MLB
    let homePitcher = null;
    let awayPitcher = null;
    if (league === 'MLB') {
      // Try multiple paths for pitcher data
      homePitcher = competition.situation?.pitcher?.athlete?.displayName || 
                   competition.situation?.pitcher?.displayName ||
                   homeTeam.probables?.[0]?.athlete?.displayName ||
                   homeTeam.probables?.[0]?.displayName ||
                   competition.competitors?.find((c: any) => c.homeAway === 'home')?.probables?.[0]?.athlete?.displayName;
      
      awayPitcher = awayTeam.probables?.[0]?.athlete?.displayName ||
                   awayTeam.probables?.[0]?.displayName ||
                   competition.competitors?.find((c: any) => c.homeAway === 'away')?.probables?.[0]?.athlete?.displayName;
      
       // Debug logging for pitcher data
       if (!homePitcher || !awayPitcher) {
         console.log(`Missing pitcher data for ${event.id}:`, {
           homePitcher,
           awayPitcher,
           homeTeamProbables: homeTeam.probables,
           awayTeamProbables: awayTeam.probables,
           competitionSituation: competition.situation,
           competitionNotes: competition.notes,
           eventName: event.name
         });
         
         // Try to extract from notes if available
         if (competition.notes && competition.notes.length > 0) {
           const pitcherNote = competition.notes.find((note: any) => 
             note.headline?.toLowerCase().includes('probable') || 
             note.headline?.toLowerCase().includes('pitcher') ||
             note.headline?.toLowerCase().includes('starting')
           );
           if (pitcherNote) {
             console.log('Found pitcher note:', pitcherNote);
           }
         }
       }
    }
    
    // Extract betting odds if available
    let homeOdds = null;
    let awayOdds = null;
    let overUnder = null;
    if (competition.odds && competition.odds.length > 0) {
      const odds = competition.odds[0];
      homeOdds = odds.homeTeamOdds?.moneyLine;
      awayOdds = odds.awayTeamOdds?.moneyLine;
      overUnder = odds.overUnder;
    }
    
    return {
      idEvent: event.id,
      strEvent: `${awayTeamName} vs ${homeTeamName}`,
      strHomeTeam: homeTeamName,
      strAwayTeam: awayTeamName,
      intHomeScore: homeTeam.score?.toString() || '0',
      intAwayScore: awayTeam.score?.toString() || '0',
      strStatus: status?.type?.description || status?.type?.name || status?.name || 'Scheduled',
      strLeague: league,
      dateEvent: event.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      strTime: event.date ? new Date(event.date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }) : 'TBD',
      strThumb: homeTeam.team?.logo || awayTeam.team?.logo,
      strPeriod,
      strClock,
      // Additional real data
      homeRecord,
      awayRecord,
      homePitcher,
      awayPitcher,
      homeOdds,
      awayOdds,
      overUnder
    };
  };

  // Fetch live sports data from ESPN
  const fetchSportsData = async (): Promise<SportsData[]> => {
    const allEvents: SportsData[] = [];
    
    try {
      // Fetch data from ESPN for all major US sports
      for (const [league, endpoint] of Object.entries(espnEndpoints)) {
        try {
          const response = await makeRequest({
            service: 'espn',
            endpoint: endpoint,
            params: {}
          });

          console.log(`${league} API response:`, response.success, response.data?.events?.length || 0);
          
          if (response.success && response.data) {
            let events = [];
            
            // Handle different response structures
            if (response.data.events && Array.isArray(response.data.events)) {
              events = response.data.events;
            } else if (response.data.scoreboard && response.data.scoreboard.events) {
              events = response.data.scoreboard.events;
            } else if (response.data.leagues && response.data.leagues[0]?.events) {
              events = response.data.leagues[0].events;
            }
            
            if (events.length > 0) {
              const transformedEvents = events.slice(0, 15)
                .map((event: any) => transformEspnEvent(event, league))
                .filter((event): event is SportsData => event !== null && !!event?.strHomeTeam && !!event?.strAwayTeam); // Filter out malformed events
              
              console.log(`${league} processed events:`, transformedEvents.length);
              allEvents.push(...transformedEvents);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${league} data:`, error);
          // Continue with other leagues even if one fails
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

  // Fetch league standings from ESPN
  const fetchStandings = async (league: string): Promise<LeagueStanding[]> => {
    try {
      // ESPN standings endpoints
      const standingsEndpoints: Record<string, string> = {
        MLB: '/apis/v2/sports/baseball/mlb/standings',
        NBA: '/apis/v2/sports/basketball/nba/standings',
        NFL: '/apis/v2/sports/football/nfl/standings',
        NHL: '/apis/v2/sports/hockey/nhl/standings'
      };

      const endpoint = standingsEndpoints[league];
      if (!endpoint) return [];

      const response = await makeRequest({
        service: 'espn',
        endpoint: endpoint,
        params: {}
      });

      if (response.success && response.data?.children) {
        const standings: LeagueStanding[] = [];
        
        // ESPN returns divisions/conferences, extract teams
        response.data.children.forEach((division: any) => {
          if (division.standings?.entries) {
            division.standings.entries.slice(0, 8).forEach((entry: any, index: number) => {
              standings.push({
                idTeam: entry.team?.id || '',
                strTeam: entry.team?.displayName || entry.team?.name || '',
                intRank: (standings.length + 1).toString(),
                intPlayed: entry.stats?.find((s: any) => s.name === 'gamesPlayed')?.value || '0',
                intWin: entry.stats?.find((s: any) => s.name === 'wins')?.value || '0',
                intLoss: entry.stats?.find((s: any) => s.name === 'losses')?.value || '0',
                intPoints: entry.stats?.find((s: any) => s.name === 'points')?.value
              });
            });
          }
        });
        
        return standings.slice(0, 10);
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
      if (!user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
        return newConfig;
      }
      
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
      queryClient.invalidateQueries({ queryKey: ['sports-config', user?.id ?? 'anon'] });
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
      favoriteTeams.some(team => {
        const t = team.toLowerCase();
        return game.strHomeTeam.toLowerCase().includes(t) || game.strAwayTeam.toLowerCase().includes(t);
      })
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