import { PublicPlayerData } from './player';
import { ActionButton } from './actions';

export enum MatchState {
  BATTLE = 'BATTLE',
  FINISHED = 'FINISHED'
}

export interface MatchData {
  id: string;
  state: MatchState;
  playerA: PublicPlayerData;
  playerB: PublicPlayerData;
  createdAt: number;
}

export type CodeLanguage = 'JS';

// Match Events
export interface MatchLeaveRequest {
  matchId: string;
}

export interface MatchStartEvent {
  matchId: string;
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
  actionsA?: ActionButton[];  // Player A's available actions
  actionsB?: ActionButton[];  // Player B's available actions
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

export interface BattleActionAvailableEvent {
  action: ActionButton;
}

export interface BattleCooldownEvent {
  actionId: string;
  cooldownRemaining: number; // ms remaining
}
