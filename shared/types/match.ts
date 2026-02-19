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

export type CodeLanguage = 'CASL' | 'JS';

// Match Preparation Events
export interface CodeSubmitRequest {
  matchId: string;
  code: string;
  language?: CodeLanguage;
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

// Battle Arena Events
export interface Position {
  x: number;
  y: number;
}

export interface FighterState {
  playerId: string;
  username: string;
  health: number;
  maxHealth: number;
  position: Position;
  attacking: boolean;
  blocking: boolean;
  attackCooldown: number;
  lastAction: string;
}

export interface MatchEvent {
  type: 'ATTACK' | 'BLOCK' | 'DAMAGE' | 'MISS';
  attacker?: string;
  target?: string;
  damage?: number;
  position?: Position;
}

export interface BattleMatchState {
  matchId: string;
  tick: number;
  phase: 'BATTLE' | 'FINISHED';
  duration: number; // ms since start
  fighterA: FighterState;
  fighterB: FighterState;
  lastEvent?: MatchEvent;
  spectatorCount: number;
}

export interface MatchResults {
  matchId: string;
  winner: 'A' | 'B' | 'DRAW';
  winnerPlayer?: PublicPlayerData;
  loserPlayer?: PublicPlayerData;
  finalHealthA: number;
  finalHealthB: number;
  tickCount: number;
  duration: number;
  statsA: CombatStats;
  statsB: CombatStats;
}

export interface CombatStats {
  attacksLanded: number;
  blocksUsed: number;
  damageDealt: number;
  damageTaken: number;
  finalPosition: Position;
}
