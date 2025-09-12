import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock, RefreshCw, Settings, Table, Bell } from 'lucide-react';
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
  const isLive = status === 'Match Finished' || status === 'FT';
  const hasScore = homeScore !== undefined && awayScore !== undefined;

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">{league}</span>
          {isLive && (
            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
              {status}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{homeTeam}</span>
            {hasScore && (
              <span className="text-sm font-bold">{homeScore}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{awayTeam}</span>
            {hasScore && (
              <span className="text-sm font-bold">{awayScore}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 ml-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {date}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {time}
        </div>
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
        <Button variant="ghost" size="sm">
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

  const [activeTab, setActiveTab] = useState("scores");

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
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="scores" className="text-xs">Recent Scores</TabsTrigger>
            <TabsTrigger value="standings" className="text-xs">Standings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scores" className="mt-0">
            {isLoading ? (
              <LoadingSkeleton />
            ) : sportsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent matches</p>
                <p className="text-xs text-muted-foreground">Check back later for updates</p>
              </div>
            ) : (
              <div className="px-1 pb-4">
                {sportsData.map((match) => (
                  <MatchItem
                    key={match.idEvent}
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
          </TabsContent>
          
          <TabsContent value="standings" className="mt-0">
            <div className="p-4 space-y-4">
              {['MLB', 'NBA', 'NFL', 'NHL'].map((league) => (
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