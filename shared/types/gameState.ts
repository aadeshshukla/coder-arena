export interface Position {
  x: number;
  y: number;
}

export interface Fighter {
  health: number;
  maxHealth: number;
  position: Position;
  cooldowns: number;
  blocking: boolean;
  attacking: boolean;
}

export interface GameState {
  fighterA: Fighter;
  fighterB: Fighter;
  tick: number;
}
