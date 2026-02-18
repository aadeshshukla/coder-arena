import { PublicPlayerData } from './player';

export interface SpectatorJoinRequest {
  matchId: string;
}

export interface SpectatorLeaveRequest {
  matchId: string;
}

export interface MatchSummary {
  matchId: string;
  playerA: PublicPlayerData;
  playerB: PublicPlayerData;
  tick: number;
  duration: number; // ms since start
  spectatorCount: number;
  healthA: number;
  healthB: number;
  maxHealth: number;
}

export interface MatchListResponse {
  matches: MatchSummary[];
}

export interface SpectatorSpeedRequest {
  matchId: string;
  speed: 1 | 2 | 4;
}
