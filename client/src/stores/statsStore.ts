import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MatchHistoryEntry {
  matchId: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  damageDealt: number;
  damageTaken: number;
  duration: number;
  timestamp: number;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  totalMatches: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  longestWinStreak: number;
  currentWinStreak: number;
  matchHistory: MatchHistoryEntry[];
}

interface StatsStore {
  stats: PlayerStats;
  recordMatchResult: (result: MatchHistoryEntry) => void;
  getWinRate: () => number;
  resetStats: () => void;
}

const initialStats: PlayerStats = {
  wins: 0,
  losses: 0,
  draws: 0,
  totalMatches: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  matchHistory: []
};

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      
      recordMatchResult: (result) => {
        set((state) => {
          const newStats = { ...state.stats };
          
          // Update counts
          if (result.result === 'win') {
            newStats.wins++;
            newStats.currentWinStreak++;
            if (newStats.currentWinStreak > newStats.longestWinStreak) {
              newStats.longestWinStreak = newStats.currentWinStreak;
            }
          } else if (result.result === 'loss') {
            newStats.losses++;
            newStats.currentWinStreak = 0;
          } else {
            newStats.draws++;
          }
          
          newStats.totalMatches++;
          newStats.totalDamageDealt += result.damageDealt;
          newStats.totalDamageTaken += result.damageTaken;
          
          // Add to history (keep last 50)
          newStats.matchHistory = [result, ...newStats.matchHistory].slice(0, 50);
          
          return { stats: newStats };
        });
      },
      
      getWinRate: () => {
        const { stats } = get();
        if (stats.totalMatches === 0) return 0;
        return Math.round((stats.wins / stats.totalMatches) * 100);
      },
      
      resetStats: () => {
        set({ stats: initialStats });
      }
    }),
    {
      name: 'coder-arena-stats',
      version: 1
    }
  )
);
