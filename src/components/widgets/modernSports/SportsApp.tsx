import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GamesView } from './GamesView';
import { PicksView } from './PicksView';
import { TeamsView } from './TeamsView';
import { StandingsView } from './StandingsView';
import { NewsView } from './NewsView';
import { useSports } from '@/hooks/useSports';
import { Gamepad2, Star, Users, Trophy, Newspaper } from 'lucide-react';

interface SportsAppProps {
  onRemove?: () => void;
}

export const SportsApp: React.FC<SportsAppProps> = ({ onRemove }) => {
  const [selectedLeague, setSelectedLeague] = useState<'MLB' | 'NBA' | 'NFL' | 'NCAAF'>('MLB');
  const [activeTab, setActiveTab] = useState<'games' | 'picks' | 'teams' | 'standings' | 'news'>('games');
  
  const { config } = useSports();

  const leagues = [
    { id: 'MLB' as const, name: 'MLB', icon: '⚾' },
    { id: 'NBA' as const, name: 'NBA', icon: '🏀' },
    { id: 'NFL' as const, name: 'NFL', icon: '🏈' },
    { id: 'NCAAF' as const, name: 'NCAA Football', icon: '🏟️' },
  ];

  const bottomNavItems = [
    { id: 'games' as const, name: 'Games', icon: Gamepad2 },
    { id: 'picks' as const, name: 'Picks', icon: Star },
    { id: 'teams' as const, name: 'Teams', icon: Users },
    { id: 'standings' as const, name: 'Standings', icon: Trophy },
    { id: 'news' as const, name: 'News', icon: Newspaper },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'games':
        return <GamesView selectedLeague={selectedLeague} />;
      case 'picks':
        return <PicksView selectedLeague={selectedLeague} />;
      case 'teams':
        return <TeamsView selectedLeague={selectedLeague} />;
      case 'standings':
        return <StandingsView selectedLeague={selectedLeague} />;
      case 'news':
        return <NewsView selectedLeague={selectedLeague} />;
      default:
        return <GamesView selectedLeague={selectedLeague} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white w-full h-full flex flex-col">
      {/* Top Navigation - League Pills */}
      <div className="flex items-center justify-between p-4 bg-blue-600">
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <span className="text-xs">⭐</span>
          </div>
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                'flex items-center space-x-2',
                selectedLeague === league.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-blue-700 text-blue-100 hover:bg-blue-800'
              )}
            >
              <span>{league.icon}</span>
              <span>{league.name}</span>
            </button>
          ))}
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-white/60 hover:text-white text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Page Title */}
      <div className="px-4 py-3 bg-gray-800">
        <h1 className="text-xl font-bold">
          {selectedLeague} {activeTab === 'games' ? 'games' : activeTab}
        </h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-gray-300 font-medium">Today</span>
              <button className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <button className="text-blue-400 hover:text-blue-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="flex bg-gray-800 border-t border-gray-700">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors',
              activeTab === item.id
                ? 'text-blue-400 bg-gray-700'
                : 'text-gray-400 hover:text-gray-300'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span>{item.name}</span>
            {activeTab === item.id && (
              <div className="w-full h-0.5 bg-blue-400 mt-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};