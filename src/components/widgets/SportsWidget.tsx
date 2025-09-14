import React, { useState, useEffect } from "react";
import {
  Trophy,
  RefreshCw,
  Settings,
  X,
  Star,
  Users,
  Target,
  TrendingUp,
  Newspaper,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSports } from "@/hooks/useSports";

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
}> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  date,
  time,
  league,
  period,
  clock,
  homeRecord,
  awayRecord,
  isFavorite,
}) => {
  const isLive =
    status === "Match Finished" ||
    status === "FT" ||
    status.toLowerCase().includes("live") ||
    status.toLowerCase().includes("final");
  const hasScore = homeScore !== undefined && awayScore !== undefined;

  // Get team abbreviations (standard 3-letter sports codes)
  const getTeamAbbr = (teamName: string) => {
    const abbrevMap: Record<string, string> = {
      // MLB Teams
      "houston astros": "HOU",
      "atlanta braves": "ATL",
      "new york yankees": "NYY",
      "new york mets": "NYM",
      "boston red sox": "BOS",
      "los angeles dodgers": "LAD",
      "los angeles angels": "LAA",
      "chicago cubs": "CHC",
      "chicago white sox": "CWS",
      "philadelphia phillies": "PHI",
      "san francisco giants": "SF",
      "texas rangers": "TEX",
      "seattle mariners": "SEA",
      "miami marlins": "MIA",
      "washington nationals": "WSH",
      "baltimore orioles": "BAL",
      "toronto blue jays": "TOR",
      "tampa bay rays": "TB",
      "detroit tigers": "DET",
      "cleveland guardians": "CLE",
      "minnesota twins": "MIN",
      "kansas city royals": "KC",
      "oakland athletics": "OAK",
      "milwaukee brewers": "MIL",
      "colorado rockies": "COL",
      "arizona diamondbacks": "ARI",
      "san diego padres": "SD",
      "st. louis cardinals": "STL",
      "pittsburgh pirates": "PIT",
      "cincinnati reds": "CIN",

      // NFL Teams
      "houston texans": "HOU",
      "atlanta falcons": "ATL",
      "new york jets": "NYJ",
      "new york giants": "NYG",
      "new england patriots": "NE",
      "dallas cowboys": "DAL",
      "chicago bears": "CHI",
      "philadelphia eagles": "PHI",
      "los angeles rams": "LAR",
      "los angeles chargers": "LAC",
      "san francisco 49ers": "SF",
      "seattle seahawks": "SEA",
      "miami dolphins": "MIA",
      "washington commanders": "WSH",
      "baltimore ravens": "BAL",
      "buffalo bills": "BUF",
      "tampa bay buccaneers": "TB",
      "detroit lions": "DET",
      "cleveland browns": "CLE",
      "minnesota vikings": "MIN",
      "kansas city chiefs": "KC",
      "las vegas raiders": "LV",
      "green bay packers": "GB",
      "denver broncos": "DEN",
      "arizona cardinals": "ARI",
      "carolina panthers": "CAR",
      "new orleans saints": "NO",
      "tennessee titans": "TEN",
      "indianapolis colts": "IND",
      "jacksonville jaguars": "JAX",
      "pittsburgh steelers": "PIT",
      "cincinnati bengals": "CIN",

      // NBA Teams
      "houston rockets": "HOU",
      "atlanta hawks": "ATL",
      "new york knicks": "NYK",
      "brooklyn nets": "BKN",
      "boston celtics": "BOS",
      "los angeles lakers": "LAL",
      "los angeles clippers": "LAC",
      "chicago bulls": "CHI",
      "philadelphia 76ers": "PHI",
      "golden state warriors": "GSW",
      "sacramento kings": "SAC",
      "phoenix suns": "PHX",
      "denver nuggets": "DEN",
      "utah jazz": "UTA",
      "portland trail blazers": "POR",
      "seattle supersonics": "SEA",
      "miami heat": "MIA",
      "orlando magic": "ORL",
      "washington wizards": "WSH",
      "charlotte hornets": "CHA",
      "detroit pistons": "DET",
      "cleveland cavaliers": "CLE",
      "milwaukee bucks": "MIL",
      "minnesota timberwolves": "MIN",
      "new orleans pelicans": "NO",
      "san antonio spurs": "SA",
      "memphis grizzlies": "MEM",
      "dallas mavericks": "DAL",
      "oklahoma city thunder": "OKC",
      "toronto raptors": "TOR",
      "indiana pacers": "IND",

      // NHL Teams
      "tampa bay lightning": "TB",
      "florida panthers": "FLA",
      "boston bruins": "BOS",
      "new york rangers": "NYR",
      "new york islanders": "NYI",
      "new jersey devils": "NJ",
      "philadelphia flyers": "PHI",
      "pittsburgh penguins": "PIT",
      "washington capitals": "WSH",
      "carolina hurricanes": "CAR",
      "toronto maple leafs": "TOR",
      "montreal canadiens": "MTL",
      "ottawa senators": "OTT",
      "buffalo sabres": "BUF",
      "detroit red wings": "DET",
      "chicago blackhawks": "CHI",
      "nashville predators": "NSH",
      "dallas stars": "DAL",
      "st. louis blues": "STL",
      "minnesota wild": "MIN",
      "winnipeg jets": "WPG",
      "colorado avalanche": "COL",
      "arizona coyotes": "ARI",
      "vegas golden knights": "VGK",
      "los angeles kings": "LAK",
      "san jose sharks": "SJ",
      "anaheim ducks": "ANA",
      "seattle kraken": "SEA",
      "vancouver canucks": "VAN",
      "calgary flames": "CGY",
      "edmonton oilers": "EDM",
    };

    const lower = teamName.toLowerCase();
    return (
      abbrevMap[lower] ||
      teamName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 3)
    );
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
          {league || "Sports"}
        </span>
      </div>

      {/* Main game content */}
      <div className="flex items-center justify-between p-4">
        {/* Away team */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {getTeamLogo(awayTeam)}
          <div className="text-center">
            <div className="text-white font-medium text-sm">
              {getTeamAbbr(awayTeam)}
            </div>
            {awayRecord && (
              <div className="text-gray-400 text-xs">{awayRecord}</div>
            )}
          </div>
        </div>

        {/* Score/Status section */}
        <div className="flex flex-col items-center space-y-1 px-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-white">
              {hasScore ? awayScore : "0"}
            </span>
            <span className="text-3xl font-bold text-white">
              {hasScore ? homeScore : "0"}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-300">
              {hasScore ? period || status || "Final" : time}
            </div>
            {clock && <div className="text-xs text-gray-400">{clock}</div>}
          </div>
        </div>

        {/* Home team */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          {getTeamLogo(homeTeam)}
          <div className="text-center">
            <div className="text-white font-medium text-sm">
              {getTeamAbbr(homeTeam)}
            </div>
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
}> = ({
  favoriteTeams,
  enableNotifications,
  onAddTeam,
  onRemoveTeam,
  onToggleNotifications,
  isUpdating,
}) => {
  const [newTeam, setNewTeam] = useState("");
  const [open, setOpen] = useState(false);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeam.trim()) {
      onAddTeam(newTeam.trim());
      setNewTeam("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-800"
          data-testid="sports-settings"
        >
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
              <p className="text-xs text-muted-foreground">
                Get alerts for your favorite teams
              </p>
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
                <div
                  key={team}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
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
              <Button
                type="submit"
                size="sm"
                disabled={!newTeam.trim() || isUpdating}
              >
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
    checkLiveScores,
  } = useSports();

  const [activeView, setActiveView] = useState("following");
  const [activeTab, setActiveTab] = useState("today");

  // Check for live scores periodically
  useEffect(() => {
    const interval = setInterval(checkLiveScores, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkLiveScores]);

  const handleToggleNotifications = (enabled: boolean) => {
    updateConfig({
      ...config,
      enableNotifications: enabled,
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
    const homeTeam = game.strHomeTeam?.toLowerCase() || "";
    const awayTeam = game.strAwayTeam?.toLowerCase() || "";
    const term = searchOrTeam.toLowerCase();

    // Direct matches
    if (homeTeam.includes(term) || awayTeam.includes(term)) {
      return true;
    }

    // Houston teams special handling
    const isHoustonGame =
      homeTeam.includes("houston") || awayTeam.includes("houston");
    if (
      isHoustonGame &&
      (term.includes("astros") ||
        term.includes("texans") ||
        term.includes("rockets"))
    ) {
      return true;
    }

    // Texans specific - match with both "houston texans" and "texans"
    if (
      (term.includes("texans") || term === "texans") &&
      (homeTeam.includes("texans") ||
        awayTeam.includes("texans") ||
        homeTeam.includes("houston") ||
        awayTeam.includes("houston"))
    ) {
      return true;
    }

    // Other common team nicknames
    if (
      term.includes("lightning") &&
      (homeTeam.includes("tampa bay") || awayTeam.includes("tampa bay"))
    ) {
      return true;
    }

    return false;
  };

  // Get favorite team games from all time periods
  const favoriteTeamGames = sportsData.filter((game) => {
    return config.favoriteTeams.some((team) => matchesTeam(game, team));
  });

  // Process games by time period
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get live/active games for favorites
  const liveOrActiveFavoriteGames = favoriteTeamGames.filter((game) => {
    const status = game.strStatus?.toLowerCase() || "";
    return (
      status.includes("live") ||
      status.includes("active") ||
      status.includes("in progress") ||
      (game.intHomeScore && game.intAwayScore && !status.includes("final"))
    );
  });

  // Get next upcoming favorite game
  const nextFavoriteGame = favoriteTeamGames
    .filter((game) => {
      const gameDate = new Date(game.dateEvent);
      const gameTime = new Date(`${game.dateEvent} ${game.strTime || "00:00"}`);
      return gameTime > now;
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.dateEvent} ${a.strTime || "00:00"}`);
      const bTime = new Date(`${b.dateEvent} ${b.strTime || "00:00"}`);
      return aTime.getTime() - bTime.getTime();
    })[0];

  // Debug logging for favorite teams
  console.log("Favorite teams:", config.favoriteTeams);
  console.log("All sports data:", sportsData.length, "games");
  console.log("Favorite team games:", favoriteTeamGames.length);
  console.log("Next favorite game:", nextFavoriteGame);

  // Favorite team games organized by time period
  const favoriteYesterdayGames = favoriteTeamGames.filter((game) => {
    const gameDate = new Date(game.dateEvent);
    return gameDate.toDateString() === yesterday.toDateString();
  });

  const favoriteTodayGames = favoriteTeamGames.filter((game) => {
    const gameDate = new Date(game.dateEvent);
    return gameDate.toDateString() === now.toDateString();
  });

  const favoriteUpcomingGames = favoriteTeamGames
    .filter((game) => {
      const gameDate = new Date(game.dateEvent);
      return gameDate > now;
    })
    .slice(0, 6);

  // All games organized by time period (fallback when no favorites)
  const yesterdayGames = sportsData
    .filter((game) => {
      const gameDate = new Date(game.dateEvent);
      return gameDate.toDateString() === yesterday.toDateString();
    })
    .slice(0, 6);

  const todayGames = sportsData
    .filter((game) => {
      const gameDate = new Date(game.dateEvent);
      return gameDate.toDateString() === now.toDateString();
    })
    .slice(0, 6);

  const upcomingGames = sportsData
    .filter((game) => {
      const gameDate = new Date(game.dateEvent);
      return gameDate > now;
    })
    .slice(0, 6);

  // Determine what to show for each tab
  const getGamesForTab = (tab: string) => {
    if (activeView === "following") {
      // For following view, prioritize live games, then upcoming
      if (liveOrActiveFavoriteGames.length > 0) {
        return liveOrActiveFavoriteGames;
      } else if (nextFavoriteGame) {
        return [nextFavoriteGame];
      } else {
        switch (tab) {
          case "yesterday":
            return favoriteYesterdayGames;
          case "today":
            return favoriteTodayGames;
          case "upcoming":
            return favoriteUpcomingGames;
          default:
            return [];
        }
      }
    } else {
      // For games view, show all games
      switch (tab) {
        case "yesterday":
          return favoriteYesterdayGames.length > 0
            ? favoriteYesterdayGames
            : yesterdayGames;
        case "today":
          return favoriteTodayGames.length > 0
            ? favoriteTodayGames
            : todayGames;
        case "upcoming":
          return favoriteUpcomingGames.length > 0
            ? favoriteUpcomingGames
            : upcomingGames;
        default:
          return [];
      }
    }
  };

  const currentGames = getGamesForTab(activeTab);
  const hasFavoriteGames = favoriteTeamGames.length > 0;

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

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case "following":
        return (
          <div className="space-y-3">
            {liveOrActiveFavoriteGames.length > 0 ? (
              <>
                <div className="text-center py-2">
                  <Badge
                    variant="secondary"
                    className="bg-red-600 text-white text-xs"
                  >
                    LIVE GAMES
                  </Badge>
                </div>
                {liveOrActiveFavoriteGames.map((game, index) => {
                  const isFavorite = config.favoriteTeams.some((team) =>
                    matchesTeam(game, team),
                  );
                  return (
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
                      homeRecord={generateMockRecord()}
                      awayRecord={generateMockRecord()}
                      isFavorite={isFavorite}
                    />
                  );
                })}
              </>
            ) : nextFavoriteGame ? (
              <>
                <div className="text-center py-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-600 text-white text-xs"
                  >
                    NEXT GAME
                  </Badge>
                </div>
                <MatchItem
                  key={nextFavoriteGame.idEvent}
                  homeTeam={nextFavoriteGame.strHomeTeam}
                  awayTeam={nextFavoriteGame.strAwayTeam}
                  homeScore={nextFavoriteGame.intHomeScore}
                  awayScore={nextFavoriteGame.intAwayScore}
                  status={nextFavoriteGame.strStatus}
                  date={nextFavoriteGame.dateEvent}
                  time={nextFavoriteGame.strTime}
                  league={nextFavoriteGame.strLeague}
                  period={nextFavoriteGame.strStatus}
                  clock={nextFavoriteGame.strTime}
                  homeRecord={generateMockRecord()}
                  awayRecord={generateMockRecord()}
                  isFavorite={true}
                />
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">
                    Next game:{" "}
                    {new Date(nextFavoriteGame.dateEvent).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      },
                    )}{" "}
                    at {nextFavoriteGame.strTime || "TBD"}
                  </p>
                </div>
              </>
            ) : config.favoriteTeams.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No favorite teams added</p>
                <p className="text-gray-500 text-sm">
                  Add favorite teams in settings to see live games and upcoming
                  matches
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">
                  No live games for your favorite teams
                </p>
                <p className="text-gray-500 text-sm">
                  Check the Games tab for all available matches
                </p>
              </div>
            )}
          </div>
        );

      case "games":
        return (
          <div className="space-y-3">
            {currentGames.length > 0 ? (
              currentGames.slice(0, 6).map((game, index) => {
                const isFavorite = config.favoriteTeams.some((team) =>
                  matchesTeam(game, team),
                );
                return (
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
                    homeRecord={generateMockRecord()}
                    awayRecord={generateMockRecord()}
                    isFavorite={isFavorite}
                  />
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {activeTab === "yesterday" && "No games yesterday"}
                  {activeTab === "today" && "No games today"}
                  {activeTab === "upcoming" && "No upcoming games"}
                </p>
              </div>
            )}
          </div>
        );

      case "teams":
        return (
          <div className="space-y-3">
            <div className="text-center py-4">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Favorite Teams</p>
              {config.favoriteTeams.length > 0 ? (
                <div className="space-y-2">
                  {config.favoriteTeams.map((team, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center border border-slate-500">
                          <span className="text-white font-bold text-xs">
                            {team
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 3)}
                          </span>
                        </div>
                        <span className="text-white font-medium">{team}</span>
                      </div>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Add teams in settings to track their games
                </p>
              )}
            </div>
          </div>
        );

      case "standings":
        return (
          <div className="space-y-3">
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Standings</p>
              <p className="text-gray-500 text-sm">
                League standings coming soon
              </p>
            </div>
          </div>
        );

      default:
        return renderContent();
    }
  };

  return (
    <div className="h-full bg-gray-900 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Sports</span>
            {liveOrActiveFavoriteGames.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-green-600 text-white text-xs"
              >
                Live
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-white hover:bg-gray-800"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pt-4">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-4">
          {[
            { key: "following", label: "Following", icon: Star },
            { key: "games", label: "Games", icon: Grid3X3 },
            { key: "teams", label: "Teams", icon: Users },
            { key: "standings", label: "Standings", icon: TrendingUp },
          ].map((nav) => {
            const IconComponent = nav.icon;
            return (
              <button
                key={nav.key}
                onClick={() => setActiveView(nav.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs font-medium transition-colors",
                  activeView === nav.key
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-300",
                )}
              >
                <IconComponent className="w-3 h-3" />
                {nav.label}
              </button>
            );
          })}
        </div>

        {/* Time Period Tabs (only show for games view) */}
        {activeView === "games" && (
          <div className="flex space-x-6 border-b border-gray-700/50">
            {[
              { key: "yesterday", label: "Yesterday" },
              { key: "today", label: "Today" },
              { key: "upcoming", label: "Upcoming" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "text-white border-white"
                    : "text-gray-400 border-transparent hover:text-gray-300",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {isLoading ? <LoadingSkeleton /> : renderContent()}
      </div>
    </div>
  );
};
