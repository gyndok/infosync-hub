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
  const debug = import.meta.env.DEV;

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

  // ESPN API endpoints for US sports (keeping for non-MLB)
  const espnEndpoints = {
    NBA: '/apis/site/v2/sports/basketball/nba/scoreboard', 
    NFL: '/apis/site/v2/sports/football/nfl/scoreboard',
    NHL: '/apis/site/v2/sports/hockey/nhl/scoreboard',
    NCAAF: '/apis/site/v2/sports/football/college-football/scoreboard'
  };

  // MLB API endpoint
  const mlbApiBase = 'https://statsapi.mlb.com/api/v1';

  // Transform MLB API data to our format
  const transformMlbGame = (game: any): SportsData | null => {
    try {
      const homeTeam = game.teams?.home;
      const awayTeam = game.teams?.away;
      
      if (!homeTeam || !awayTeam) {
        console.warn(`Missing team data for MLB game:`, game.gamePk);
        return null;
      }

      // Extract pitcher information
      const homePitcher = homeTeam.probablePitcher?.fullName || null;
      const awayPitcher = awayTeam.probablePitcher?.fullName || null;
      
      // Extract records
      const homeRecord = homeTeam.leagueRecord ? `${homeTeam.leagueRecord.wins}-${homeTeam.leagueRecord.losses}` : null;
      const awayRecord = awayTeam.leagueRecord ? `${awayTeam.leagueRecord.wins}-${awayTeam.leagueRecord.losses}` : null;
      
      // Game status and scores
      const isLive = game.status?.statusCode === 'I' || game.status?.detailedState?.includes('In Progress');
      const isFinal = game.status?.statusCode === 'F' || game.status?.detailedState?.includes('Final');
      
      let strPeriod = '';
      let strClock = '';
      
      if (isLive && game.liveData?.linescore) {
        const inning = game.liveData.linescore.currentInning;
        const inningHalf = game.liveData.linescore.inningHalf;
        strPeriod = `${inning}${inning === 1 ? 'st' : inning === 2 ? 'nd' : inning === 3 ? 'rd' : 'th'}`;
        strClock = inningHalf === 'Top' ? 'Top' : 'Bot';
      }
      
      return {
        idEvent: game.gamePk.toString(),
        strEvent: `${awayTeam.team.name} vs ${homeTeam.team.name}`,
        strHomeTeam: homeTeam.team.name,
        strAwayTeam: awayTeam.team.name,
        intHomeScore: homeTeam.score?.toString() || '0',
        intAwayScore: awayTeam.score?.toString() || '0',
        strStatus: game.status?.detailedState || 'Scheduled',
        strLeague: 'MLB',
        dateEvent: game.gameDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        strTime: game.gameDate ? new Date(game.gameDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : 'TBD',
        strThumb: `https://www.mlbstatic.com/team-logos/${homeTeam.team.id}.svg`,
        strPeriod,
        strClock,
        homeRecord,
        awayRecord,
        homePitcher,
        awayPitcher,
        homeOdds: null, // MLB API doesn't provide betting odds
        awayOdds: null,
        overUnder: null
      };
    } catch (error) {
      console.error('Error transforming MLB game:', error, game);
      return null;
    }
  };

  // Transform ESPN data to our format
  const transformEspnEvent = (event: any, league: string): SportsData | null => {
    // Debug NFL events specifically
    if (league === 'NFL') {
      console.log(`NFL Transform Debug - Event ID: ${event.id}, Competitions:`, !!event.competitions, event.competitions?.length);
    }
    
    const competition = event.competitions?.[0];
    if (!competition) {
      if (league === 'NFL') console.warn(`NFL Transform - No competition data for event:`, event.id);
      return null;
    }
    
    const homeTeam = competition.competitors?.find((c: any) => c.homeAway === 'home');
    const awayTeam = competition.competitors?.find((c: any) => c.homeAway === 'away');
    const status = event.status || competition.status;
    
    if (!homeTeam || !awayTeam) {
      if (league === 'NFL') {
        console.warn(`NFL Transform - Missing team data for event:`, event.id, { 
          homeTeam: !!homeTeam, 
          awayTeam: !!awayTeam, 
          competitors: competition.competitors?.length,
          competitorTypes: competition.competitors?.map((c: any) => c.homeAway)
        });
      }
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
    let homeRecord = null;
    let awayRecord = null;
    let homePitcher = null;
    let awayPitcher = null;
    
    // Get team records with proper formatting for each sport
    if (homeTeam.records && homeTeam.records.length > 0) {
      const record = homeTeam.records[0];
      if (league === 'NFL') {
        homeRecord = `${record.wins}-${record.losses}${record.ties ? `-${record.ties}` : ''}`;
      } else {
        homeRecord = record.summary || `${record.wins}-${record.losses}`;
      }
    }
    if (awayTeam.records && awayTeam.records.length > 0) {
      const record = awayTeam.records[0];
      if (league === 'NFL') {
        awayRecord = `${record.wins}-${record.losses}${record.ties ? `-${record.ties}` : ''}`;
      } else {
        awayRecord = record.summary || `${record.wins}-${record.losses}`;
      }
    }
    
    // Extract sport-specific player information
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
    } else if (league === 'NFL') {
      // Get quarterback or key player info for NFL
      if (homeTeam.leaders && homeTeam.leaders.length > 0) {
        const passingLeader = homeTeam.leaders.find((l: any) => l.name === 'passingYards' || l.shortDisplayName === 'PASS YDS');
        if (passingLeader && passingLeader.leaders && passingLeader.leaders[0]) {
          homePitcher = passingLeader.leaders[0].athlete?.displayName || passingLeader.leaders[0].displayName;
        }
      }
      if (awayTeam.leaders && awayTeam.leaders.length > 0) {
        const passingLeader = awayTeam.leaders.find((l: any) => l.name === 'passingYards' || l.shortDisplayName === 'PASS YDS');
        if (passingLeader && passingLeader.leaders && passingLeader.leaders[0]) {
          awayPitcher = passingLeader.leaders[0].athlete?.displayName || passingLeader.leaders[0].displayName;
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

  // Fetch live sports data from multiple APIs
  const fetchSportsData = async (): Promise<SportsData[]> => {
    const allEvents: SportsData[] = [];
    
    try {
      // Fetch MLB data from MLB Stats API
      try {
        const today = new Date().toISOString().split('T')[0];
        const mlbResponse = await makeRequest({
          service: 'mlb',
          endpoint: `/schedule/games/?sportId=1&date=${today}&hydrate=team(leaders(showOnPreview(leaderCategories=[homeRuns,runsBattedIn,battingAverage],statGroup=[pitching,hitting]))),linescore,probablePitcher`,
          params: {}
        });

        console.log('MLB API response:', mlbResponse.success, mlbResponse.data?.dates?.[0]?.games?.length || 0);
        
        if (mlbResponse.success && mlbResponse.data?.dates?.[0]?.games) {
          const mlbGames = mlbResponse.data.dates[0].games
            .map((game: any) => transformMlbGame(game))
            .filter((game): game is SportsData => game !== null);
          
          console.log('MLB processed games:', mlbGames.length);
          allEvents.push(...mlbGames);
        }
      } catch (error) {
        console.error('Error fetching MLB data:', error);
      }

      // Fetch data from ESPN for other sports
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
                .filter((event): event is SportsData => event !== null && !!event?.strHomeTeam && !!event?.strAwayTeam);
              
              // Debug NFL transformations specifically
              if (league === 'NFL') {
                console.log(`NFL Debug - Raw events processed: ${events.length}`);
                console.log(`NFL Debug - Transformed events: ${transformedEvents.length}`);
                console.log(`NFL Debug - Sample transformed event:`, transformedEvents[0]);
                
                // Check what's being filtered out
                const allTransformed = events.slice(0, 15).map((event: any) => transformEspnEvent(event, league));
                const nullEvents = allTransformed.filter(e => e === null).length;
                const missingTeamEvents = allTransformed.filter(e => e !== null && (!e?.strHomeTeam || !e?.strAwayTeam)).length;
                console.log(`NFL Debug - Null events: ${nullEvents}, Missing team data: ${missingTeamEvents}`);
              }
              
              console.log(`${league} processed events:`, transformedEvents.length);
              allEvents.push(...transformedEvents);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${league} data:`, error);
        }
      }
      
      // Debug: Log some sample events to see team names
      if (debug) console.log('Sample sports events:', allEvents.slice(0, 5));
      
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