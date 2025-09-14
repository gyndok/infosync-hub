import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { GameCard } from './GameCard';
import { useSports } from '@/hooks/useSports';

interface GamesViewProps {
  selectedLeague: 'MLB' | 'NBA' | 'NFL' | 'NCAAF';
}

export const GamesView: React.FC<GamesViewProps> = ({ selectedLeague }) => {
  const { sportsData, config, isLoading } = useSports();
  
  // Filter games by selected league
  const leagueGames = sportsData.filter(game => game.strLeague === selectedLeague);
  
  // Detailed debugging for NFL games specifically
  if (selectedLeague === 'NFL') {
    console.log(`NFL Debug - Total sports data: ${sportsData.length}`);
    console.log(`NFL Debug - All NFL games:`, sportsData.filter(g => g.strLeague === 'NFL').map(g => ({ 
      teams: `${g.strAwayTeam} vs ${g.strHomeTeam}`, 
      date: g.dateEvent,
      status: g.strStatus,
      id: g.idEvent
    })));
    console.log(`NFL Debug - League games filtered: ${leagueGames.length}`);
    
    // Check if there are games with different date formats
    const allNFLGames = sportsData.filter(g => g.strLeague === 'NFL');
    console.log(`NFL Debug - Sample raw NFL game:`, allNFLGames[0]);
  }
  
  // Helper function to match teams with favorites
  const matchesTeam = (game: any, searchOrTeam: string) => {
    const homeTeam = game.strHomeTeam?.toLowerCase() || '';
    const awayTeam = game.strAwayTeam?.toLowerCase() || '';
    const term = searchOrTeam.toLowerCase();
    
    return homeTeam.includes(term) || awayTeam.includes(term) ||
           (term.includes('texans') && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term.includes('astros') && (homeTeam.includes('houston') || awayTeam.includes('houston'))) ||
           (term.includes('rockets') && (homeTeam.includes('houston') || awayTeam.includes('houston')));
  };

  // Get games for favorite teams
  const favoriteTeamGames = leagueGames.filter(game => {
    return config.favoriteTeams.some(team => matchesTeam(game, team));
  });

  // Get live/active games for favorites
  const liveOrActiveFavoriteGames = favoriteTeamGames.filter(game => {
    const status = game.strStatus?.toLowerCase() || '';
    return status.includes('live') || status.includes('active') || status.includes('in progress') || 
           (game.intHomeScore && game.intAwayScore && !status.includes('final'));
  });

  // Get next upcoming favorite game
  const now = new Date();
  const nextFavoriteGame = favoriteTeamGames
    .filter(game => {
      const gameDate = new Date(game.dateEvent);
      const gameTime = new Date(`${game.dateEvent} ${game.strTime || '00:00'}`);
      return gameTime > now;
    })
    .sort((a, b) => {
      const aTime = new Date(`${a.dateEvent} ${a.strTime || '00:00'}`);
      const bTime = new Date(`${b.dateEvent} ${b.strTime || '00:00'}`);
      return aTime.getTime() - bTime.getTime();
    })[0];

  // Get recent and today's games (last 7 days + today)
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  console.log(`Date Debug - Today: ${today.toDateString()}, Seven days ago: ${sevenDaysAgo.toDateString()}`);
  console.log(`Date Debug - NFL Game date: ${leagueGames[0]?.dateEvent}, Parsed: ${new Date(leagueGames[0]?.dateEvent).toDateString()}`);
  
  const recentGames = leagueGames.filter(game => {
    const gameDate = new Date(game.dateEvent);
    return gameDate >= sevenDaysAgo && gameDate <= today;
  }).slice(0, 12);

  // Get upcoming games
  const upcomingGames = leagueGames.filter(game => {
    const gameDate = new Date(game.dateEvent);
    return gameDate > today;
  }).slice(0, 6);
  
  console.log(`Date Debug - Recent games count: ${recentGames.length}, Upcoming games count: ${upcomingGames.length}`);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const shouldShowFollowing = liveOrActiveFavoriteGames.length > 0 || nextFavoriteGame;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Following Section */}
      {shouldShowFollowing && (
        <div className="p-4">
          <h2 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">
            Following
          </h2>
          <div className="flex overflow-x-auto space-x-3 pb-4">
            {liveOrActiveFavoriteGames.length > 0 ? (
              liveOrActiveFavoriteGames.map((game) => (
                <div key={game.idEvent} className="flex-shrink-0 w-80">
                  <GameCard game={game} isFollowing={true} />
                </div>
              ))
            ) : nextFavoriteGame ? (
              <div key={nextFavoriteGame.idEvent} className="flex-shrink-0 w-80">
                <GameCard game={nextFavoriteGame} isFollowing={true} isUpcoming={true} />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <div className="p-4">
          <h2 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">
            Recent Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentGames.map((game) => (
              <GameCard key={game.idEvent} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingGames.length > 0 && (
        <div className="p-4">
          <h2 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">
            Upcoming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingGames.map((game) => (
              <GameCard key={game.idEvent} game={game} isUpcoming={true} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recentGames.length === 0 && upcomingGames.length === 0 && !shouldShowFollowing && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">🏆</div>
            <h3 className="text-gray-400 text-lg font-medium mb-2">No games scheduled</h3>
            <p className="text-gray-500 text-sm">Check back later for upcoming {selectedLeague} games</p>
          </div>
        </div>
      )}
    </div>
  );
};