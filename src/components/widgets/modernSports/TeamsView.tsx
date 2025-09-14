import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Plus, Heart } from 'lucide-react';
import { useSports } from '@/hooks/useSports';

interface TeamsViewProps {
  selectedLeague: 'MLB' | 'NBA' | 'NFL' | 'NCAAF';
}

export const TeamsView: React.FC<TeamsViewProps> = ({ selectedLeague }) => {
  const { config, addFavoriteTeam, removeFavoriteTeam } = useSports();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock team data based on league
  const getTeamsForLeague = (league: string) => {
    const teams = {
      MLB: [
        { id: 'hou', name: 'Houston Astros', abbr: 'HOU', record: '81-68', standing: '1st AL West', logo: '🔸' },
        { id: 'atl', name: 'Atlanta Braves', abbr: 'ATL', record: '65-83', standing: '4th NL East', logo: '🔴' },
        { id: 'bal', name: 'Baltimore Orioles', abbr: 'BAL', record: '69-79', standing: '3rd AL East', logo: '🟠' },
        { id: 'tor', name: 'Toronto Blue Jays', abbr: 'TOR', record: '86-62', standing: '2nd AL East', logo: '🔵' },
        { id: 'chw', name: 'Chicago White Sox', abbr: 'CHW', record: '57-92', standing: '5th AL Central', logo: '⚫' },
        { id: 'cle', name: 'Cleveland Guardians', abbr: 'CLE', record: '77-71', standing: '2nd AL Central', logo: '🔴' },
        { id: 'lad', name: 'Los Angeles Dodgers', abbr: 'LAD', record: '83-65', standing: '1st NL West', logo: '🔵' },
        { id: 'sf', name: 'San Francisco Giants', abbr: 'SF', record: '75-73', standing: '3rd NL West', logo: '🟠' },
        { id: 'tex', name: 'Texas Rangers', abbr: 'TEX', record: '79-70', standing: '2nd AL West', logo: '🔵' },
        { id: 'nym', name: 'New York Mets', abbr: 'NYM', record: '76-73', standing: '2nd NL East', logo: '🔵' },
        { id: 'cin', name: 'Cincinnati Reds', abbr: 'CIN', record: '74-74', standing: '3rd NL Central', logo: '🔴' },
        { id: 'ath', name: 'Oakland Athletics', abbr: 'ATH', record: '69-80', standing: '4th AL West', logo: '🟢' },
        { id: 'laa', name: 'Los Angeles Angels', abbr: 'LAA', record: '69-80', standing: '4th AL West', logo: '🔴' },
        { id: 'sea', name: 'Seattle Mariners', abbr: 'SEA', record: '81-68', standing: '3rd AL West', logo: '🔵' },
        { id: 'nyy', name: 'New York Yankees', abbr: 'NYY', record: '83-65', standing: '1st AL East', logo: '🔵' },
        { id: 'bos', name: 'Boston Red Sox', abbr: 'BOS', record: '81-68', standing: '3rd AL East', logo: '🔴' }
      ],
      NBA: [
        { id: 'hou', name: 'Houston Rockets', abbr: 'HOU', record: '22-60', standing: '15th West', logo: '🔴' },
        { id: 'gs', name: 'Golden State Warriors', abbr: 'GSW', record: '44-38', standing: '6th West', logo: '🟡' },
        { id: 'lal', name: 'Los Angeles Lakers', abbr: 'LAL', record: '43-39', standing: '7th West', logo: '🟣' },
        { id: 'bos', name: 'Boston Celtics', abbr: 'BOS', record: '57-25', standing: '2nd East', logo: '🟢' }
      ],
      NFL: [
        { id: 'hou', name: 'Houston Texans', abbr: 'HOU', record: '3-1', standing: '1st AFC South', logo: '🔴' },
        { id: 'dal', name: 'Dallas Cowboys', abbr: 'DAL', record: '2-2', standing: '2nd NFC East', logo: '⭐' },
        { id: 'ne', name: 'New England Patriots', abbr: 'NE', record: '1-3', standing: '4th AFC East', logo: '🔵' }
      ],
      NCAAF: [
        { id: 'tex', name: 'Texas Longhorns', abbr: 'TEX', record: '4-0', standing: '1st Big 12', logo: '🤘' },
        { id: 'bama', name: 'Alabama Crimson Tide', abbr: 'BAMA', record: '4-0', standing: '1st SEC', logo: '🔴' }
      ]
    };
    
    return teams[league] || [];
  };

  const teams = getTeamsForLeague(selectedLeague);
  
  // Filter teams based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.abbr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavoriteTeam = (teamName: string) => {
    if (config.favoriteTeams.includes(teamName)) {
      removeFavoriteTeam(teamName);
    } else {
      addFavoriteTeam(teamName);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{selectedLeague} Teams</h2>
          <p className="text-gray-400 text-sm">Follow teams to get personalized updates</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Following Teams */}
      {config.favoriteTeams.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-400" />
            Following ({config.favoriteTeams.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.favoriteTeams.map((teamName) => {
              const team = teams.find(t => 
                t.name.toLowerCase().includes(teamName.toLowerCase()) ||
                teamName.toLowerCase().includes(t.name.toLowerCase()) ||
                teamName.toLowerCase().includes(t.abbr.toLowerCase())
              );
              
              return (
                <div key={teamName} className="bg-gray-800 rounded-lg p-4 border border-blue-500/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl">{team?.logo || '⭐'}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{team?.name || teamName}</div>
                        <div className="text-gray-400 text-sm">{team?.record || 'N/A'} • {team?.standing || 'Following'}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleFavoriteTeam(teamName)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Teams */}
      <div>
        <h3 className="text-lg font-semibold mb-3">All Teams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTeams.map((team) => {
            const isFollowing = config.favoriteTeams.some(fav => 
              fav.toLowerCase().includes(team.name.toLowerCase()) ||
              team.name.toLowerCase().includes(fav.toLowerCase()) ||
              fav.toLowerCase().includes(team.abbr.toLowerCase())
            );

            return (
              <div
                key={team.id}
                className={cn(
                  'bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer',
                  isFollowing && 'border-blue-500/50'
                )}
                onClick={() => toggleFavoriteTeam(team.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{team.logo}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{team.name}</div>
                      <div className="text-gray-400 text-sm">{team.record} • {team.standing}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isFollowing && (
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/50">
                        Following
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'text-gray-400 hover:text-white',
                        isFollowing && 'text-red-400 hover:text-red-300'
                      )}
                    >
                      {isFollowing ? (
                        <Heart className="w-4 h-4 fill-current" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">🔍</div>
          <h3 className="text-gray-400 text-lg font-medium mb-2">No teams found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};