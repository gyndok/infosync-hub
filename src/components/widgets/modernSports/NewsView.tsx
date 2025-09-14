import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, Clock, Filter } from 'lucide-react';

interface NewsViewProps {
  selectedLeague: 'MLB' | 'NBA' | 'NFL' | 'NCAAF';
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  url: string;
  league: string;
  teams?: string[];
  summary?: string;
}

export const NewsView: React.FC<NewsViewProps> = ({ selectedLeague }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  // Mock news data
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Astros Close to Clinching AL West Division Title',
      source: 'ESPN',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      url: '#',
      league: 'MLB',
      teams: ['Houston Astros'],
      summary: 'With their recent winning streak, the Astros are just two games away from securing their division title.'
    },
    {
      id: '2',
      title: 'Texans QB Announces Return from Injury',
      source: 'The Athletic',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      url: '#',
      league: 'NFL',
      teams: ['Houston Texans'],
      summary: 'Starting quarterback expected to return for next week\'s crucial division matchup.'
    },
    {
      id: '3',
      title: 'Rockets Sign Former All-Star to One-Year Deal',
      source: 'NBA.com',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      url: '#',
      league: 'NBA',
      teams: ['Houston Rockets'],
      summary: 'The veteran player brings championship experience to the young Rockets roster.'
    },
    {
      id: '4',
      title: 'Texas Longhorns Remain Undefeated After Big Win',
      source: 'Sports Illustrated',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      url: '#',
      league: 'NCAAF',
      teams: ['Texas Longhorns'],
      summary: 'Dominant performance keeps the Longhorns at the top of the conference standings.'
    },
    {
      id: '5',
      title: 'MLB Playoff Picture Takes Shape in Final Weeks',
      source: 'MLB.com',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      url: '#',
      league: 'MLB',
      teams: [],
      summary: 'Several teams are fighting for the remaining wild card spots as the regular season winds down.'
    },
    {
      id: '6',
      title: 'NFL Trade Deadline Approaching: Key Players to Watch',
      source: 'NFL Network',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      url: '#',
      league: 'NFL',
      teams: [],
      summary: 'Teams are evaluating their rosters as the trade deadline approaches next month.'
    }
  ];

  // Filter news by league and search term
  const filteredNews = mockNews.filter(item => {
    const matchesLeague = item.league === selectedLeague;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teams?.some(team => team.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTeam = selectedTeam === 'all' || 
      item.teams?.some(team => team.toLowerCase().includes(selectedTeam.toLowerCase()));
    
    return matchesLeague && matchesSearch && matchesTeam;
  });

  // Get unique teams for filter
  const teams = [...new Set(mockNews
    .filter(item => item.league === selectedLeague)
    .flatMap(item => item.teams || [])
  )];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{selectedLeague} News</h2>
          <p className="text-gray-400 text-sm">Latest news and updates</p>
        </div>
        <Button variant="outline" size="sm" className="text-gray-400 border-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedTeam('all')}
            variant={selectedTeam === 'all' ? 'default' : 'outline'}
            size="sm"
            className={selectedTeam === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-400 border-gray-600'}
          >
            All Teams
          </Button>
          {teams.map((team) => (
            <Button
              key={team}
              onClick={() => setSelectedTeam(team)}
              variant={selectedTeam === team ? 'default' : 'outline'}
              size="sm"
              className={selectedTeam === team ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-400 border-gray-600'}
            >
              {team.split(' ').pop()} {/* Show just team name */}
            </Button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/50">
                  {item.source}
                </Badge>
                {item.teams && item.teams.length > 0 && (
                  <Badge variant="outline" className="text-gray-400 border-gray-600">
                    {item.teams[0].split(' ').pop()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(item.publishedAt)}</span>
              </div>
            </div>
            
            <h3 className="text-white font-medium text-lg mb-2 group-hover:text-blue-400 transition-colors leading-tight">
              {item.title}
            </h3>
            
            {item.summary && (
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                {item.summary}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {item.teams && item.teams.map((team, index) => (
                  <span key={index} className="text-gray-500 text-xs">
                    {team}
                  </span>
                ))}
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </article>
        ))}
      </div>

      {/* Load More */}
      {filteredNews.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="text-gray-400 border-gray-600 hover:bg-gray-800">
            Load More Stories
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">📰</div>
          <h3 className="text-gray-400 text-lg font-medium mb-2">No news found</h3>
          <p className="text-gray-500 text-sm">
            {searchTerm || selectedTeam !== 'all' 
              ? 'Try adjusting your search or filters'
              : `No recent ${selectedLeague} news available`
            }
          </p>
        </div>
      )}
    </div>
  );
};