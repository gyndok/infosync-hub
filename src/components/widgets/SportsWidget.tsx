import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock, RefreshCw, Settings, Table, Bell, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSports } from '@/hooks/useSports';

const MatchItem: React.FC<{
  homeTeam: string;
  awayTeam: string;
  homeScore?: string;
  awayScore?: string;
  status: string;
  date: string;
  time: string;
  league: string;
}> = ({ homeTeam, awayTeam, homeScore, awayScore, status, date, time, league }) => {
  const isLive = status === 'Match Finished' || status === 'FT' || status.toLowerCase().includes('live');
  const hasScore = homeScore !== undefined && awayScore !== undefined;
  
  // Get team abbreviations (standard 3-letter sports codes)
  const getTeamAbbr = (teamName: string) => {
    const abbrevMap: Record<string, string> = {
      // MLB Teams
      'houston astros': 'HOU',
      'atlanta braves': 'ATL',
      'new york yankees': 'NYY',
      'new york mets': 'NYM',
      'boston red sox': 'BOS',
      'los angeles dodgers': 'LAD',
      'los angeles angels': 'LAA',
      'chicago cubs': 'CHC',
      'chicago white sox': 'CWS',
      'philadelphia phillies': 'PHI',
      'san francisco giants': 'SF',
      'texas rangers': 'TEX',
      'seattle mariners': 'SEA',
      'miami marlins': 'MIA',
      'washington nationals': 'WSH',
      'baltimore orioles': 'BAL',
      'toronto blue jays': 'TOR',
      'tampa bay rays': 'TB',
      'detroit tigers': 'DET',
      'cleveland guardians': 'CLE',
      'minnesota twins': 'MIN',
      'kansas city royals': 'KC',
      'oakland athletics': 'OAK',
      'milwaukee brewers': 'MIL',
      'colorado rockies': 'COL',
      'arizona diamondbacks': 'ARI',
      'san diego padres': 'SD',
      'st. louis cardinals': 'STL',
      'pittsburgh pirates': 'PIT',
      'cincinnati reds': 'CIN',
      
      // NFL Teams
      'houston texans': 'HOU',
      'atlanta falcons': 'ATL',
      'new york jets': 'NYJ',
      'new york giants': 'NYG',
      'new england patriots': 'NE',
      'dallas cowboys': 'DAL',
      'chicago bears': 'CHI',
      'philadelphia eagles': 'PHI',
      'los angeles rams': 'LAR',
      'los angeles chargers': 'LAC',
      'san francisco 49ers': 'SF',
      'seattle seahawks': 'SEA',
      'miami dolphins': 'MIA',
      'washington commanders': 'WSH',
      'baltimore ravens': 'BAL',
      'buffalo bills': 'BUF',
      'tampa bay buccaneers': 'TB',
      'detroit lions': 'DET',
      'cleveland browns': 'CLE',
      'minnesota vikings': 'MIN',
      'kansas city chiefs': 'KC',
      'las vegas raiders': 'LV',
      'green bay packers': 'GB',
      'denver broncos': 'DEN',
      'arizona cardinals': 'ARI',
      'carolina panthers': 'CAR',
      'new orleans saints': 'NO',
      'tennessee titans': 'TEN',
      'indianapolis colts': 'IND',
      'jacksonville jaguars': 'JAX',
      'pittsburgh steelers': 'PIT',
      'cincinnati bengals': 'CIN',
      
      // NBA Teams
      'houston rockets': 'HOU',
      'atlanta hawks': 'ATL',
      'new york knicks': 'NYK',
      'brooklyn nets': 'BKN',
      'boston celtics': 'BOS',
      'los angeles lakers': 'LAL',
      'los angeles clippers': 'LAC',
      'chicago bulls': 'CHI',
      'philadelphia 76ers': 'PHI',
      'golden state warriors': 'GSW',
      'sacramento kings': 'SAC',
      'phoenix suns': 'PHX',
      'denver nuggets': 'DEN',
      'utah jazz': 'UTA',
      'portland trail blazers': 'POR',
      'seattle supersonics': 'SEA',
      'miami heat': 'MIA',
      'orlando magic': 'ORL',
      'washington wizards': 'WSH',
      'charlotte hornets': 'CHA',
      'detroit pistons': 'DET',
      'cleveland cavaliers': 'CLE',
      'milwaukee bucks': 'MIL',
      'minnesota timberwolves': 'MIN',
      'new orleans pelicans': 'NO',
      'san antonio spurs': 'SA',
      'memphis grizzlies': 'MEM',
      'dallas mavericks': 'DAL',
      'oklahoma city thunder': 'OKC',
      'toronto raptors': 'TOR',
      'indiana pacers': 'IND',
      
      // NHL Teams
      'tampa bay lightning': 'TB',
      'florida panthers': 'FLA',
      'boston bruins': 'BOS',
      'new york rangers': 'NYR',
      'new york islanders': 'NYI',
      'new jersey devils': 'NJ',
      'philadelphia flyers': 'PHI',
      'pittsburgh penguins': 'PIT',
      'washington capitals': 'WSH',
      'carolina hurricanes': 'CAR',
      'toronto maple leafs': 'TOR',
      'montreal canadiens': 'MTL',
      'ottawa senators': 'OTT',
      'buffalo sabres': 'BUF',
      'detroit red wings': 'DET',
      'chicago blackhawks': 'CHI',
      'nashville predators': 'NSH',
      'dallas stars': 'DAL',
      'st. louis blues': 'STL',
      'minnesota wild': 'MIN',
      'winnipeg jets': 'WPG',
      'colorado avalanche': 'COL',
      'arizona coyotes': 'ARI',
      'vegas golden knights': 'VGK',
      'los angeles kings': 'LAK',
      'san jose sharks': 'SJ',
      'anaheim ducks': 'ANA',
      'seattle kraken': 'SEA',
      'vancouver canucks': 'VAN',
      'calgary flames': 'CGY',
      'edmonton oilers': 'EDM'
    };
    
    const lower = teamName.toLowerCase();
    return abbrevMap[lower] || teamName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3);
  };

  return (
    <div className="bg-card border rounded-lg p-3 mb-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{league}</Badge>
          {isLive && (
            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
              LIVE
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {date} • {time}
        </div>
      </div>
      
      <div className="space-y-1">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {getTeamAbbr(awayTeam)[0]}
              </span>
            </div>
            <span className="text-sm font-medium">{getTeamAbbr(awayTeam)}</span>
          </div>
          <span className="text-lg font-bold">
            {hasScore ? awayScore : '-'}
          </span>
        </div>
        
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-secondary-foreground">
                {getTeamAbbr(homeTeam)[0]}
              </span>
            </div>
            <span className="text-sm font-medium">{getTeamAbbr(homeTeam)}</span>
          </div>
          <span className="text-lg font-bold">
            {hasScore ? homeScore : '-'}
          </span>
        </div>
      </div>
      
      {/* Game Status */}
      <div className="mt-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>
    </div>
  );
};

const StandingsTable: React.FC<{
  league: string;
  standings: any[];
  isLoading: boolean;
}> = ({ league, standings, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No standings available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground mb-2 flex justify-between">
        <span>Team</span>
        <span>Rank</span>
      </div>
      {standings.slice(0, 8).map((team, index) => (
        <div key={team.idTeam || index} className="flex justify-between items-center py-1 text-sm hover:bg-muted/50 rounded px-2">
          <span className="truncate">{team.strTeam}</span>
          <Badge variant="outline" className="text-xs">
            #{team.intRank || index + 1}
          </Badge>
        </div>
      ))}
    </div>
  );
};

const SportsSettingsDialog: React.FC<{
  favoriteTeams: string[];
  enableNotifications: boolean;
  onAddTeam: (team: string) => void;
  onRemoveTeam: (team: string) => void;
  onToggleNotifications: (enabled: boolean) => void;
  isUpdating: boolean;
}> = ({ favoriteTeams, enableNotifications, onAddTeam, onRemoveTeam, onToggleNotifications, isUpdating }) => {
  const [newTeam, setNewTeam] = useState('');
  const [open, setOpen] = useState(false);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeam.trim()) {
      onAddTeam(newTeam.trim());
      setNewTeam('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="widget-action">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sports Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Live Score Notifications</h4>
              <p className="text-xs text-muted-foreground">Get alerts for your favorite teams</p>
            </div>
            <Switch
              checked={enableNotifications}
              onCheckedChange={onToggleNotifications}
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Favorite Teams</h4>
            <div className="space-y-2">
              {favoriteTeams.map((team) => (
                <div key={team} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{team}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTeam(team)}
                    disabled={isUpdating}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTeam} className="flex gap-2 mt-2">
              <Input
                placeholder="Add team name"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newTeam.trim() || isUpdating}>
                Add
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    ))}
  </div>
);

export const SportsWidget: React.FC = () => {
  const {
    sportsData,
    standings,
    isLoading,
    isLoadingStandings,
    config,
    addFavoriteTeam,
    removeFavoriteTeam,
    updateConfig,
    isUpdatingConfig,
    refetch,
    checkLiveScores
  } = useSports();

  const [activeTab, setActiveTab] = useState("favorites");
  const [searchTerm, setSearchTerm] = useState("");

  // Check for live scores periodically
  useEffect(() => {
    const interval = setInterval(checkLiveScores, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkLiveScores]);

  const handleToggleNotifications = (enabled: boolean) => {
    updateConfig({
      ...config,
      enableNotifications: enabled
    });
  };

  // Helper function to match teams
  const matchesTeam = (game: any, searchOrTeam: string) => {
    const homeTeam = game.strHomeTeam.toLowerCase();
    const awayTeam = game.strAwayTeam.toLowerCase();
    const term = searchOrTeam.toLowerCase();
    
    return homeTeam.includes(term) || 
           awayTeam.includes(term) ||
           (term === 'astros' && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term === 'texans' && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term === 'rockets' && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term === 'lightning' && (homeTeam.includes('tampa bay') || awayTeam.includes('tampa bay')));
  };

  // Filter games involving favorite teams (better matching)
  const favoriteTeamGames = sportsData.filter(game => {
    return config.favoriteTeams.some(team => matchesTeam(game, team));
  });

  // Filter games by search term if provided
  const searchFilteredGames = searchTerm 
    ? sportsData.filter(game => matchesTeam(game, searchTerm))
    : [];

  // Helper function to process games (upcoming vs past)
  const processGames = (games: any[]) => {
    const now = new Date();
    const upcoming = games.filter(game => 
      new Date(game.dateEvent) >= now
    ).sort((a, b) => new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime());
    
    const past = games.filter(game => 
      new Date(game.dateEvent) < now
    ).sort((a, b) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime());

    return { upcoming, past };
  };

  // Process favorite games
  const { upcoming: upcomingFavoriteGames, past: pastFavoriteGames } = processGames(favoriteTeamGames);
  const combinedFavoriteGames = [...upcomingFavoriteGames, ...pastFavoriteGames.slice(0, 3)];

  // Process search results
  const { upcoming: upcomingSearchGames, past: pastSearchGames } = processGames(searchFilteredGames);
  const combinedSearchGames = [...upcomingSearchGames, ...pastSearchGames.slice(0, 5)];

  // Other games (non-favorite teams)
  const otherGames = sportsData.filter(game => 
    !config.favoriteTeams.some(team => matchesTeam(game, team))
  ).slice(0, 5); // Limit other games

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Sports
            <Badge variant="secondary" className="bg-success/10 text-success">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="widget-action" onClick={() => refetch()}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <SportsSettingsDialog
              favoriteTeams={config.favoriteTeams}
              enableNotifications={config.enableNotifications || false}
              onAddTeam={addFavoriteTeam}
              onRemoveTeam={removeFavoriteTeam}
              onToggleNotifications={handleToggleNotifications}
              isUpdating={isUpdatingConfig}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        {/* Search Bar */}
        <div className="px-4 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>

        <Tabs value={searchTerm ? "search" : activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="favorites" className="text-xs" disabled={!!searchTerm}>My Teams</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs" disabled={!!searchTerm}>Recent</TabsTrigger>
            <TabsTrigger value="standings" className="text-xs" disabled={!!searchTerm}>Standings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="mt-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <LoadingSkeleton />
              ) : combinedFavoriteGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <Trophy className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">No games for your favorite teams</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {config.favoriteTeams.length === 0 ? 'Add teams in settings' : 'Check back later for updates'}
                  </p>
                  {config.favoriteTeams.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Your Teams:</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {config.favoriteTeams.slice(0, 3).map((team) => (
                          <Badge key={team} variant="outline" className="text-xs">
                            {team.split(' ').pop()}
                          </Badge>
                        ))}
                        {config.favoriteTeams.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{config.favoriteTeams.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-1 pb-4">
                  {upcomingFavoriteGames.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-primary/5 border-l-2 border-primary mb-3">
                        <p className="text-xs font-medium text-primary">Upcoming Games</p>
                      </div>
                      {upcomingFavoriteGames.map((match, idx) => (
                        <MatchItem
                          key={`upcoming-${match.idEvent}-${idx}`}
                          homeTeam={match.strHomeTeam}
                          awayTeam={match.strAwayTeam}
                          homeScore={match.intHomeScore}
                          awayScore={match.intAwayScore}
                          status={match.strStatus}
                          date={match.dateEvent}
                          time={match.strTime || 'TBD'}
                          league={match.strLeague}
                        />
                      ))}
                    </>
                  )}
                  
                  {pastFavoriteGames.length > 0 && (
                    <>
                      <div className="px-3 py-2 bg-muted/30 border-l-2 border-muted mb-3 mt-4">
                        <p className="text-xs font-medium text-muted-foreground">Recent Results</p>
                      </div>
                      {pastFavoriteGames.slice(0, 3).map((match, idx) => (
                        <MatchItem
                          key={`past-${match.idEvent}-${idx}`}
                          homeTeam={match.strHomeTeam}
                          awayTeam={match.strAwayTeam}
                          homeScore={match.intHomeScore}
                          awayScore={match.intAwayScore}
                          status={match.strStatus}
                          date={match.dateEvent}
                          time={match.strTime || 'TBD'}
                          league={match.strLeague}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <LoadingSkeleton />
              ) : otherGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No recent matches</p>
                  <p className="text-xs text-muted-foreground">Check back later for updates</p>
                </div>
              ) : (
                <div className="px-1 pb-4">
                  {otherGames.map((match, idx) => (
                    <MatchItem
                      key={`other-${match.idEvent}-${idx}`}
                      homeTeam={match.strHomeTeam}
                      awayTeam={match.strAwayTeam}
                      homeScore={match.intHomeScore}
                      awayScore={match.intAwayScore}
                      status={match.strStatus}
                      date={match.dateEvent}
                      time={match.strTime || 'TBD'}
                      league={match.strLeague}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="search" className="mt-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <LoadingSkeleton />
              ) : searchTerm && combinedSearchGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <Search className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">No teams found</p>
                  <p className="text-xs text-muted-foreground">
                    Try searching for "{searchTerm}" in a different way
                  </p>
                </div>
              ) : searchTerm ? (
                <div className="px-1 pb-4">
                  <div className="px-3 py-2 bg-primary/5 border-l-2 border-primary mb-3">
                    <p className="text-xs font-medium text-primary">
                      Search Results for "{searchTerm}" ({combinedSearchGames.length})
                    </p>
                  </div>
                  {combinedSearchGames.map((match, idx) => (
                    <MatchItem
                      key={`search-${match.idEvent}-${idx}`}
                      homeTeam={match.strHomeTeam}
                      awayTeam={match.strAwayTeam}
                      homeScore={match.intHomeScore}
                      awayScore={match.intAwayScore}
                      status={match.strStatus}
                      date={match.dateEvent}
                      time={match.strTime || 'TBD'}
                      league={match.strLeague}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </TabsContent>
          
          <TabsContent value="standings" className="mt-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {['MLB', 'NBA', 'NFL', 'NHL', 'NCAAF'].map((league) => (
                <div key={league} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{league}</h4>
                    {config.enableNotifications && (
                      <Bell className="w-3 h-3 text-success" />
                    )}
                  </div>
                  <StandingsTable
                    league={league}
                    standings={standings[league] || []}
                    isLoading={isLoadingStandings}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};