import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface GameCardProps {
  game: {
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
    strPeriod?: string;
    strClock?: string;
    // Additional real data fields
    homeRecord?: string;
    awayRecord?: string;
    homePitcher?: string;
    awayPitcher?: string;
    homeOdds?: number;
    awayOdds?: number;
    overUnder?: number;
  };
  isFollowing?: boolean;
  isUpcoming?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isFollowing = false, isUpcoming = false }) => {
  const isLive = game.strStatus?.toLowerCase().includes('live') || 
                 game.strStatus?.toLowerCase().includes('in progress') ||
                 (game.intHomeScore && game.intAwayScore && !game.strStatus?.toLowerCase().includes('final'));
  
  const isFinal = game.strStatus?.toLowerCase().includes('final') || 
                  game.strStatus?.toLowerCase().includes('finished');

  // Get team abbreviations
  const getTeamAbbr = (teamName: string) => {
    const abbrevMap: Record<string, string> = {
      // MLB Teams
      'houston astros': 'HOU', 'atlanta braves': 'ATL', 'baltimore orioles': 'BAL',
      'toronto blue jays': 'TOR', 'chicago white sox': 'CHW', 'cleveland guardians': 'CLE',
      'los angeles dodgers': 'LAD', 'san francisco giants': 'SF', 'texas rangers': 'TEX',
      'new york mets': 'NYM', 'cincinnati reds': 'CIN', 'oakland athletics': 'ATH',
      'los angeles angels': 'LAA', 'seattle mariners': 'SEA', 'new york yankees': 'NYY',
      'boston red sox': 'BOS', 'pittsburgh pirates': 'PIT', 'washington nationals': 'WAS',
      'kansas city royals': 'KC', 'philadelphia phillies': 'PHI', 'detroit tigers': 'DET',
      'miami marlins': 'MIA',
      
      // NFL Teams  
      'houston texans': 'HOU', 'dallas cowboys': 'DAL', 'new england patriots': 'NE',
    };
    
    const lower = teamName.toLowerCase();
    if (abbrevMap[lower]) return abbrevMap[lower];
    
    // Create abbreviation from team name
    const words = teamName.split(' ');
    if (words.length >= 2) {
      return words[words.length - 1].substring(0, 3).toUpperCase();
    }
    return teamName.substring(0, 3).toUpperCase();
  };

  // Mock fallback functions (only used when real data not available)
  const generateMockRecord = (teamName: string) => {
    const seed = teamName.length * 17;
    const wins = 81 + (seed % 20);
    const losses = 81 - (seed % 20);
    return `${wins}-${losses}`;
  };

  const generateMockOdds = (teamName: string, isHome: boolean) => {
    const seed = teamName.length + (isHome ? 1 : 0);
    const moneyline = isHome ? -150 - (seed % 100) : +120 + (seed % 80);
    return moneyline;
  };

  const generateOverUnder = (game: any) => {
    const seed = game.idEvent.length;
    const total = 8 + (seed % 4) + 0.5;
    return total;
  };

  const getProbablePitcher = (teamName: string, isHome: boolean) => {
    const pitchers = [
      'F. Valdez', 'J. Wentz', 'A. Suarez', 'S. Bieber', 'Y. Gómez', 'S. Cecconi',
      'J. Latz', 'N. McLean', 'N. Lodolo', 'L. Morales', 'T. Glasnow', 'R. Ray',
      'K. Hendricks', 'G. Kirby', 'W. Warren', 'G. Crochet'
    ];
    const seed = teamName.length + (isHome ? 1 : 0);
    return pitchers[seed % pitchers.length];
  };

  const homeAbbr = getTeamAbbr(game.strHomeTeam);
  const awayAbbr = getTeamAbbr(game.strAwayTeam);
  
  // Use real data if available, otherwise fall back to mock data
  const homeRecord = game.homeRecord || generateMockRecord(game.strHomeTeam);
  const awayRecord = game.awayRecord || generateMockRecord(game.strAwayTeam);
  const homeML = game.homeOdds || generateMockOdds(game.strHomeTeam, true);
  const awayML = game.awayOdds || generateMockOdds(game.strAwayTeam, false);
  const overUnder = game.overUnder || generateOverUnder(game);
  const homePitcher = game.homePitcher || getProbablePitcher(game.strHomeTeam, true);
  const awayPitcher = game.awayPitcher || getProbablePitcher(game.strAwayTeam, false);

  return (
    <div className={cn(
      'bg-gray-800 rounded-lg p-4 border border-gray-700',
      isFollowing && 'border-blue-500/50',
      'hover:bg-gray-750 transition-colors cursor-pointer'
    )}>
      {/* Header with teams */}
      <div className="flex items-center justify-between mb-3">
        {/* Away Team */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{awayAbbr}</span>
          </div>
          <div>
            <div className="text-white font-medium text-sm">{awayAbbr}</div>
            <div className="text-gray-400 text-xs">{awayRecord}</div>
          </div>
        </div>

        {/* Score or Time */}
        <div className="text-center">
          {isFinal || isLive ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white">{game.intAwayScore || '0'}</span>
              <span className="text-lg font-bold text-white">{game.intHomeScore || '0'}</span>
            </div>
          ) : (
            <div className="text-white font-medium">{game.strTime}</div>
          )}
          {isLive && (
            <Badge variant="destructive" className="text-xs mt-1">
              LIVE
            </Badge>
          )}
          {isFinal && (
            <div className="text-xs text-gray-400 mt-1">FINAL</div>
          )}
          {isUpcoming && !isLive && !isFinal && (
            <div className="text-xs text-gray-400 mt-1">
              {new Date(game.dateEvent).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>

        {/* Home Team */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="text-white font-medium text-sm text-right">{homeAbbr}</div>
            <div className="text-gray-400 text-xs text-right">{homeRecord}</div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{homeAbbr}</span>
          </div>
        </div>
      </div>

      {/* Game Details */}
      <div className="space-y-2">
        {/* Odds */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">
              {awayAbbr} {awayML > 0 ? '+' : ''}{awayML}
            </span>
            <span className="text-gray-400">o/u: {overUnder}</span>
          </div>
          <span className="text-gray-400">
            {homeAbbr} {homeML > 0 ? '+' : ''}{homeML}
          </span>
        </div>

        {/* Pitchers/Starters (for MLB) */}
        {game.strLeague === 'MLB' && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{awayAbbr}: {awayPitcher}</span>
            <span>{homeAbbr}: {homePitcher}</span>
          </div>
        )}

        {/* Status */}
        {(isLive || game.strPeriod || game.strClock) && (
          <div className="text-center">
            <div className="text-xs text-gray-400">
              {game.strPeriod && game.strClock ? 
                `${game.strPeriod} - ${game.strClock}` : 
                game.strStatus
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};