import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Copy, Trash2, Plus } from 'lucide-react';

interface Pick {
  id: string;
  gameId: string;
  type: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  stake: number;
  notes?: string;
  timestamp: Date;
}

interface PicksViewProps {
  selectedLeague: 'MLB' | 'NBA' | 'NFL' | 'NCAAF';
}

export const PicksView: React.FC<PicksViewProps> = ({ selectedLeague }) => {
  const [picks, setPicks] = useState<Pick[]>([
    {
      id: '1',
      gameId: 'hou-atl',
      type: 'moneyline',
      selection: 'HOU +133',
      odds: 133,
      stake: 50,
      notes: 'Strong pitching matchup',
      timestamp: new Date()
    },
    {
      id: '2', 
      gameId: 'tex-nym',
      type: 'total',
      selection: 'Over 8.5',
      odds: -110,
      stake: 25,
      timestamp: new Date()
    }
  ]);

  const [newPickAmount, setNewPickAmount] = useState<string>('');

  const totalStake = picks.reduce((sum, pick) => sum + pick.stake, 0);
  const potentialPayout = picks.reduce((sum, pick) => {
    const decimal = pick.odds > 0 ? (pick.odds / 100) + 1 : (100 / Math.abs(pick.odds)) + 1;
    return sum + (pick.stake * decimal);
  }, 0);

  const copyParlay = () => {
    const parlayText = picks.map(pick => 
      `${pick.selection} (${pick.odds > 0 ? '+' : ''}${pick.odds})`
    ).join(' | ');
    
    navigator.clipboard.writeText(`Parlay: ${parlayText} | Stake: $${totalStake} | Potential: $${potentialPayout.toFixed(2)}`);
  };

  const removePick = (id: string) => {
    setPicks(picks.filter(pick => pick.id !== id));
  };

  const addPick = () => {
    const newPick: Pick = {
      id: Date.now().toString(),
      gameId: 'example',
      type: 'moneyline',
      selection: 'Example +120',
      odds: 120,
      stake: parseFloat(newPickAmount) || 10,
      timestamp: new Date()
    };
    setPicks([...picks, newPick]);
    setNewPickAmount('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Picks</h2>
          <p className="text-gray-400 text-sm">Your curated betting slip</p>
        </div>
        <Button onClick={addPick} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Pick
        </Button>
      </div>

      {/* Parlay Summary */}
      {picks.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">Current Parlay</h3>
            <Button
              onClick={copyParlay}
              variant="secondary"
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white/80 text-xs uppercase tracking-wide">Legs</div>
              <div className="text-white text-lg font-bold">{picks.length}</div>
            </div>
            <div>
              <div className="text-white/80 text-xs uppercase tracking-wide">Stake</div>
              <div className="text-white text-lg font-bold">${totalStake}</div>
            </div>
            <div>
              <div className="text-white/80 text-xs uppercase tracking-wide">Potential</div>
              <div className="text-white text-lg font-bold">${potentialPayout.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Picks */}
      <div className="space-y-3">
        {picks.map((pick) => (
          <div key={pick.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">{pick.selection}</span>
                  <span className={cn(
                    'text-sm px-2 py-1 rounded',
                    pick.type === 'moneyline' && 'bg-green-600/20 text-green-400',
                    pick.type === 'spread' && 'bg-blue-600/20 text-blue-400', 
                    pick.type === 'total' && 'bg-purple-600/20 text-purple-400'
                  )}>
                    {pick.type}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Stake: ${pick.stake}</span>
                  <span>Odds: {pick.odds > 0 ? '+' : ''}{pick.odds}</span>
                  <span>To Win: ${((pick.stake * (pick.odds > 0 ? pick.odds / 100 : 100 / Math.abs(pick.odds)))).toFixed(2)}</span>
                </div>
                
                {pick.notes && (
                  <div className="text-gray-500 text-sm mt-1">{pick.notes}</div>
                )}
              </div>
              
              <Button
                onClick={() => removePick(pick.id)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Pick Form */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-medium text-white mb-3">Quick Add Pick</h3>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Stake amount"
            value={newPickAmount}
            onChange={(e) => setNewPickAmount(e.target.value)}
            className="bg-gray-700 border-gray-600"
          />
          <Button onClick={addPick} className="bg-blue-600 hover:bg-blue-700">
            Add
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {picks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">🎯</div>
          <h3 className="text-gray-400 text-lg font-medium mb-2">No picks yet</h3>
          <p className="text-gray-500 text-sm mb-4">Add games to your betting slip to get started</p>
          <Button onClick={addPick} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Pick
          </Button>
        </div>
      )}
    </div>
  );
};