import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Settings, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useSports } from '@/hooks/useSports';

// Sports Widget - Dark themed design matching modern sports apps

const MatchItem: React.FC<{
  homeTeam: string;
  awayTeam: string;
  homeScore?: string;
  awayScore?: string;
  status: string;
  date: string;
  time: string;
  league: string;
  period?: string;
  clock?: string;
  homeRecord?: string;
  awayRecord?: string;
  isFavorite?: boolean;
}> = ({ homeTeam, awayTeam, homeScore, awayScore, status, date, time, league, period, clock, homeRecord, awayRecord, isFavorite }) => {
  const isLive = status === 'Match Finished' || status === 'FT' || status.toLowerCase().includes('live') || status.toLowerCase().includes('final');
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

  // Team logo placeholders with colors
  const getTeamLogo = (teamName: string) => {
    const abbr = getTeamAbbr(teamName);
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center border-2 border-slate-500">
        <span className="text-white font-bold text-sm">{abbr}</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 relative">
      {/* Favorite star indicator */}
      {isFavorite && (
        <div className="absolute top-3 left-3 z-10">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}
      
      {/* League badge */}
      <div className="text-center py-2 border-b border-gray-700/50">
        <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
          {league || 'Sports'}
        </span>
      </div>
      
      {/* Main game content */}
      <div className="flex items-center justify-between p-4">
        {/* Away team */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {getTeamLogo(awayTeam)}
          <div className="text-center">
            <div className="text-white font-medium text-sm">{getTeamAbbr(awayTeam)}</div>
            {awayRecord && (
              <div className="text-gray-400 text-xs">{awayRecord}</div>
            )}
          </div>
        </div>
        
        {/* Score/Status section */}
        <div className="flex flex-col items-center space-y-1 px-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-white">
              {hasScore ? awayScore : '0'}
            </span>
            <span className="text-3xl font-bold text-white">
              {hasScore ? homeScore : '0'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-300">
              {hasScore ? (period || status || 'Final') : time}
            </div>
            {clock && (
              <div className="text-xs text-gray-400">{clock}</div>
            )}
          </div>
        </div>
        
        {/* Home team */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {getTeamLogo(homeTeam)}
          <div className="text-center">
            <div className="text-white font-medium text-sm">{getTeamAbbr(homeTeam)}</div>
            {homeRecord && (
              <div className="text-gray-400 text-xs">{homeRecord}</div>
            )}
          </div>
        </div>
      </div>
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
        <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
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

interface SportsWidgetProps {
  onRemove?: () => void;
}

export const SportsWidget: React.FC<SportsWidgetProps> = ({ onRemove }) => {
  const {
    sportsData,
    isLoading,
    config,
    addFavoriteTeam,
    removeFavoriteTeam,
    updateConfig,
    isUpdatingConfig,
    refetch,
    checkLiveScores
  } = useSports();

  const [activeTab, setActiveTab] = useState("today");

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

  // Generate mock records for teams
  const generateMockRecord = () => {
    const wins = Math.floor(Math.random() * 15) + 5;
    const losses = Math.floor(Math.random() * 10) + 2;
    const ties = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
    return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
  };

  // Helper function to match teams with favorites
  const matchesTeam = (game: any, searchOrTeam: string) => {
    const homeTeam = game.strHomeTeam.toLowerCase();
    const awayTeam = game.strAwayTeam.toLowerCase();
    const term = searchOrTeam.toLowerCase();
    
    return homeTeam.includes(term) || 
           awayTeam.includes(term) ||
           (term === 'astros' && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term === 'texans' && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term === 'rockets' && (homeTeam.includes('houston') || awayTeam.includes('houston')));
  };

  // Process games by time period
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterdayGames = sportsData.filter(game => {
    const gameDate = new Date(game.dateEvent);
    return gameDate.toDateString() === yesterday.toDateString();
  }).slice(0, 6);

  const todayGames = sportsData.filter(game => {
    const gameDate = new Date(game.dateEvent);
    return gameDate.toDateString() === now.toDateString();
  }).slice(0, 6);

  const upcomingGames = sportsData.filter(game => {
    const gameDate = new Date(game.dateEvent);
    return gameDate > now;
  }).slice(0, 6);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-16 mx-auto mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div className="h-3 bg-gray-700 rounded w-8"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-8 bg-gray-700 rounded w-8"></div>
              <div className="h-8 bg-gray-700 rounded w-8"></div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div className="h-3 bg-gray-700 rounded w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-gray-900 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Sports</span>
            <Badge variant="secondary" className="bg-green-600 text-white text-xs">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-white hover:bg-gray-800">
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
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove} className="text-white hover:bg-gray-800">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex space-x-6 border-b border-gray-700/50">
          {[
            { key: "yesterday", label: "Yesterday" },
            { key: "today", label: "Today" },
            { key: "upcoming", label: "Upcoming" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.key
                  ? "text-white border-white"
                  : "text-gray-400 border-transparent hover:text-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-3">
            {activeTab === "yesterday" && (
              <>
                {yesterdayGames.length > 0 ? (
                  yesterdayGames.map((game, index) => (
                    <MatchItem
                      key={game.idEvent || index}
                      homeTeam={game.strHomeTeam}
                      awayTeam={game.strAwayTeam}
                      homeScore={game.intHomeScore}
                      awayScore={game.intAwayScore}
                      status={game.strStatus}
                      date={game.dateEvent}
                      time={game.strTime}
                      league={game.strLeague}
                      period={game.strStatus}
                      clock={game.strTime}
                      isFavorite={config.favoriteTeams.some(team => matchesTeam(game, team))}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No games yesterday</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "today" && (
              <>
                {todayGames.length > 0 ? (
                  todayGames.map((game, index) => (
                    <MatchItem
                      key={game.idEvent || index}
                      homeTeam={game.strHomeTeam}
                      awayTeam={game.strAwayTeam}
                      homeScore={game.intHomeScore}
                      awayScore={game.intAwayScore}
                      status={game.strStatus}
                      date={game.dateEvent}
                      time={game.strTime}
                      league={game.strLeague}
                      period={game.strStatus}
                      clock={game.strTime}
                      isFavorite={config.favoriteTeams.some(team => matchesTeam(game, team))}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No games today</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "upcoming" && (
              <>
                {upcomingGames.length > 0 ? (
                  upcomingGames.map((game, index) => (
                    <MatchItem
                      key={game.idEvent || index}
                      homeTeam={game.strHomeTeam}
                      awayTeam={game.strAwayTeam}
                      status={game.strStatus}
                      date={game.dateEvent}
                      time={game.strTime}
                      league={game.strLeague}
                      homeRecord={generateMockRecord()}
                      awayRecord={generateMockRecord()}
                      isFavorite={config.favoriteTeams.some(team => matchesTeam(game, team))}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No upcoming games</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};