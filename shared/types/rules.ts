import { ActionType } from './actions';

export type ConditionType = 
  | 'ENEMY_HEALTH_LESS_THAN'
  | 'ENEMY_HEALTH_GREATER_THAN'
  | 'DISTANCE_LESS_THAN'
  | 'DISTANCE_GREATER_THAN';

export interface Condition {
  type: ConditionType;
  value: number;
}

export interface Rule {
  condition: Condition;
  action: ActionType;
}
