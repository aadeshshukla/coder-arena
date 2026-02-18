import { create } from 'zustand';
import { PublicPlayerData } from '../../../shared/types/player';

interface MatchmakingState {
  isInQueue: boolean;
  queuePosition: number;
  queueSize: number;
  roomCode: string;
  matchId: string;
  opponent: PublicPlayerData | null;
  
  setInQueue: (inQueue: boolean) => void;
  setQueuePosition: (position: number) => void;
  setQueueSize: (size: number) => void;
  setRoomCode: (code: string) => void;
  setMatchId: (id: string) => void;
  setOpponent: (opponent: PublicPlayerData | null) => void;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  isInQueue: false,
  queuePosition: 0,
  queueSize: 0,
  roomCode: '',
  matchId: '',
  opponent: null,
  
  setInQueue: (inQueue) => set({ isInQueue: inQueue }),
  setQueuePosition: (position) => set({ queuePosition: position }),
  setQueueSize: (size) => set({ queueSize: size }),
  setRoomCode: (code) => set({ roomCode: code }),
  setMatchId: (id) => set({ matchId: id }),
  setOpponent: (opponent) => set({ opponent }),
  reset: () => set({
    isInQueue: false,
    queuePosition: 0,
    queueSize: 0,
    roomCode: '',
    matchId: '',
    opponent: null
  })
}));
