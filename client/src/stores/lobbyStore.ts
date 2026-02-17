import { create } from 'zustand';
import { PublicPlayerData } from '../../../shared/types/player';

interface LobbyState {
  players: PublicPlayerData[];
  playerCount: number;
  setPlayers: (players: PublicPlayerData[]) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  players: [],
  playerCount: 0,
  setPlayers: (players) => set({ players, playerCount: players.length })
}));
