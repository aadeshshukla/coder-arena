import { PublicPlayerData } from './player';

export enum MatchState {
  PREPARATION = 'PREPARATION',
  BATTLE = 'BATTLE',
  FINISHED = 'FINISHED'
}

export interface MatchData {
  id: string;
  state: MatchState;
  playerA: PublicPlayerData;
  playerB: PublicPlayerData;
  codeA?: string;
  codeB?: string;
  readyA: boolean;
  readyB: boolean;
  countdown: number;
  createdAt: number;
}

// Match Preparation Events
export interface CodeSubmitRequest {
  matchId: string;
  code: string;
}

export interface CodeValidatedResponse {
  success: boolean;
  errors?: Array<{ message: string; line?: number }>;
}

export interface PlayerReadyRequest {
  matchId: string;
}

export interface MatchLeaveRequest {
  matchId: string;
}

export interface MatchPrepareEvent {
  matchId: string;
  opponent: PublicPlayerData;
  countdown: number;
}

export interface MatchCountdownEvent {
  secondsRemaining: number;
}

export interface MatchStartEvent {
  matchId: string;
}

export interface OpponentReadyEvent {
  ready: boolean;
}

// Test Arena Events
export interface MatchTestRequest {
  code: string;
}

export interface MatchTestResult {
  winner: 'player' | 'dummy';
  playerFinalHealth: number;
  dummyFinalHealth: number;
  ticks: number;
}
