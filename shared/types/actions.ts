export type ActionType = 'APPROACH' | 'RETREAT' | 'ATTACK' | 'BLOCK' | 'IDLE';

export interface Action {
  type: ActionType;
}
