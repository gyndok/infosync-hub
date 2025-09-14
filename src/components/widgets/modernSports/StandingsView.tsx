import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSports } from '@/hooks/useSports';

interface StandingsViewProps {
  selectedLeague: 'MLB' | 'NBA' | 'NFL' | 'NCAAF';
}

interface StandingTeam {
  rank: number;
  team: string;
  abbr: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
  streak: string;
  last10: string;
  division?: string;
  conference?: string;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ selectedLeague }) => {
  const { standings, isLoadingStandings } = useSports();
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'pct' | 'wins' | 'losses'>('pct');

  // Mock standings data based on league
  const getMockStandings = (league: string): StandingTeam[] => {
    const standingsData = {
      MLB: {
        'AL East': [
          { rank: 1, team: 'New York Yankees', abbr: 'NYY', wins: 83, losses: 65, pct: 0.561, gb: '-', streak: 'W2', last10: '6-4' },
          { rank: 2, team: 'Toronto Blue Jays', abbr: 'TOR', wins: 86, losses: 62, pct: 0.581, gb: '2.0', streak: 'L1', last10: '7-3' },
          { rank: 3, team: 'Boston Red Sox', abbr: 'BOS', wins: 81, losses: 68, pct: 0.544, gb: '5.5', streak: 'W1', last10: '5-5' },
          { rank: 4, team: 'Baltimore Orioles', abbr: 'BAL', wins: 69, losses: 79, pct: 0.466, gb: '14.0', streak: 'L2', last10: '4-6' },
        ],
        'AL Central': [
          { rank: 1, team: 'Cleveland Guardians', abbr: 'CLE', wins: 77, losses: 71, pct: 0.520, gb: '-', streak: 'W3', last10: '8-2' },
          { rank: 2, team: 'Minnesota Twins', abbr: 'MIN', wins: 74, losses: 74, pct: 0.500, gb: '3.0', streak: 'L1', last10: '6-4' },
          { rank: 3, team: 'Detroit Tigers', abbr: 'DET', wins: 84, losses: 65, pct: 0.564, gb: '7.5', streak: 'W4', last10: '7-3' },
          { rank: 4, team: 'Chicago White Sox', abbr: 'CHW', wins: 57, losses: 92, pct: 0.383, gb: '20.5', streak: 'L5', last10: '2-8' },
        ],
        'AL West': [
          { rank: 1, team: 'Houston Astros', abbr: 'HOU', wins: 81, losses: 68, pct: 0.544, gb: '-', streak: 'W1', last10: '6-4' },
          { rank: 2, team: 'Texas Rangers', abbr: 'TEX', wins: 79, losses: 70, pct: 0.530, gb: '2.0', streak: 'L2', last10: '5-5' },
          { rank: 3, team: 'Seattle Mariners', abbr: 'SEA', wins: 81, losses: 68, pct: 0.544, gb: '0.5', streak: 'W2', last10: '7-3' },
          { rank: 4, team: 'Los Angeles Angels', abbr: 'LAA', wins: 69, losses: 80, pct: 0.463, gb: '12.0', streak: 'L1', last10: '4-6' },
        ]
      },
      NFL: {
        'AFC South': [
          { rank: 1, team: 'Houston Texans', abbr: 'HOU', wins: 3, losses: 1, pct: 0.750, gb: '-', streak: 'W2', last10: '3-1' },
          { rank: 2, team: 'Indianapolis Colts', abbr: 'IND', wins: 2, losses: 2, pct: 0.500, gb: '1.0', streak: 'L1', last10: '2-2' },
          { rank: 3, team: 'Jacksonville Jaguars', abbr: 'JAX', wins: 1, losses: 3, pct: 0.250, gb: '2.0', streak: 'L2', last10: '1-3' },
          { rank: 4, team: 'Tennessee Titans', abbr: 'TEN', wins: 0, losses: 4, pct: 0.000, gb: '3.0', streak: 'L4', last10: '0-4' },
        ]
      },
      NBA: {
        'Western Conference': [
          { rank: 1, team: 'Golden State Warriors', abbr: 'GSW', wins: 44, losses: 38, pct: 0.537, gb: '-', streak: 'W1', last10: '6-4' },
          { rank: 2, team: 'Los Angeles Lakers', abbr: 'LAL', wins: 43, losses: 39, pct: 0.524, gb: '1.0', streak: 'L2', last10: '5-5' },
          { rank: 15, team: 'Houston Rockets', abbr: 'HOU', wins: 22, losses: 60, pct: 0.268, gb: '22.0', streak: 'L8', last10: '1-9' },
        ]
      },
      NCAAF: {
        'Big 12': [
          { rank: 1, team: 'Texas Longhorns', abbr: 'TEX', wins: 4, losses: 0, pct: 1.000, gb: '-', streak: 'W4', last10: '4-0' },
          { rank: 2, team: 'Oklahoma Sooners', abbr: 'OU', wins: 3, losses: 1, pct: 0.750, gb: '1.0', streak: 'W2', last10: '3-1' },
        ]
      }
    };

    const leagueData = standingsData[league] || {};
    const allTeams: StandingTeam[] = [];
    
    Object.entries(leagueData).forEach(([division, teams]) => {
      (teams as StandingTeam[]).forEach(team => {
        allTeams.push({ ...team, division, conference: division });
      });
    });

    return allTeams.sort((a, b) => b.pct - a.pct);
  };

  const mockStandings = getMockStandings(selectedLeague);
  const divisions = [...new Set(mockStandings.map(team => team.division))];

  const filteredStandings = selectedDivision === 'all' 
    ? mockStandings 
    : mockStandings.filter(team => team.division === selectedDivision);

  const sortedStandings = [...filteredStandings].sort((a, b) => {
    switch (sortBy) {
      case 'wins':
        return b.wins - a.wins;
      case 'losses':
        return a.losses - b.losses;
      case 'pct':
      default:
        return b.pct - a.pct;
    }
  });

  if (isLoadingStandings) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{selectedLeague} Standings</h2>
          <p className="text-gray-400 text-sm">Current season standings and records</p>
        </div>
      </div>

      {/* Division/Conference Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedDivision('all')}
          variant={selectedDivision === 'all' ? 'default' : 'outline'}
          size="sm"
          className={selectedDivision === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          All
        </Button>
        {divisions.map((division) => (
          <Button
            key={division}
            onClick={() => setSelectedDivision(division)}
            variant={selectedDivision === division ? 'default' : 'outline'}
            size="sm"
            className={selectedDivision === division ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {division}
          </Button>
        ))}
      </div>

      {/* Standings Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-700 text-xs font-medium text-gray-300 uppercase tracking-wider">
          <div className="col-span-2">Team</div>
          <button
            onClick={() => setSortBy('wins')}
            className={cn('text-left hover:text-white', sortBy === 'wins' && 'text-white')}
          >
            W
          </button>
          <button
            onClick={() => setSortBy('losses')}
            className={cn('text-left hover:text-white', sortBy === 'losses' && 'text-white')}
          >
            L
          </button>
          <button
            onClick={() => setSortBy('pct')}
            className={cn('text-left hover:text-white', sortBy === 'pct' && 'text-white')}
          >
            PCT
          </button>
          <div>GB</div>
          <div>L10</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {sortedStandings.map((team, index) => (
            <div
              key={`${team.team}-${index}`}
              className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-750 transition-colors"
            >
              <div className="col-span-2 flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm font-medium w-6">{index + 1}</span>
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{team.abbr}</span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{team.team}</div>
                  {team.division && (
                    <div className="text-gray-400 text-xs">{team.division}</div>
                  )}
                </div>
              </div>
              <div className="text-white font-medium">{team.wins}</div>
              <div className="text-white font-medium">{team.losses}</div>
              <div className="text-white font-medium">{team.pct.toFixed(3)}</div>
              <div className="text-gray-400">{team.gb}</div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">{team.last10}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    team.streak.startsWith('W') && 'bg-green-600/20 text-green-400',
                    team.streak.startsWith('L') && 'bg-red-600/20 text-red-400'
                  )}
                >
                  {team.streak}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>W: Wins, L: Losses, PCT: Win Percentage, GB: Games Behind, L10: Last 10 Games</div>
        <div>Streak: Current winning (W) or losing (L) streak</div>
      </div>

      {/* Empty State */}
      {sortedStandings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h3 className="text-gray-400 text-lg font-medium mb-2">No standings available</h3>
          <p className="text-gray-500 text-sm">Standings will appear when the season begins</p>
        </div>
      )}
    </div>
  );
};