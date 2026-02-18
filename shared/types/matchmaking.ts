import { PublicPlayerData } from './player';

// Matchmaking Queue Events
export interface QueueJoinRequest {
  token: string;
}

export interface QueueJoinedResponse {
  success: boolean;
  position: number;
  error?: string;
}

export interface QueueLeftResponse {
  success: boolean;
}

export interface QueueUpdateEvent {
  queueSize: number;
  position?: number;
}

export interface MatchFoundEvent {
  matchId: string;
  opponent: PublicPlayerData;
}

// Private Room Events
export interface RoomCreateRequest {
  token: string;
}

export interface RoomCreatedResponse {
  success: boolean;
  roomCode: string;
  error?: string;
}

export interface RoomJoinRequest {
  token: string;
  roomCode: string;
}

export interface RoomJoinedResponse {
  success: boolean;
  matchId?: string;
  opponent?: PublicPlayerData;
  error?: string;
}

export interface RoomErrorEvent {
  message: string;
}
