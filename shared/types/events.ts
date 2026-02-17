import { PublicPlayerData } from './player';

// Auth Events
export interface AuthLoginRequest {
  username: string;
}

export interface AuthLoginResponse {
  success: boolean;
  token?: string;
  player?: PublicPlayerData;
  error?: string;
}

export interface AuthValidateRequest {
  token: string;
}

export interface AuthValidateResponse {
  success: boolean;
  player?: PublicPlayerData;
  error?: string;
}

// Lobby Events
export interface LobbyState {
  players: PublicPlayerData[];
  playerCount: number;
}

export interface LobbyJoinRequest {
  token: string;
}

export interface LobbyLeaveRequest {
  playerId: string;
}
