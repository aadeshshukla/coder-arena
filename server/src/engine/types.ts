import { Fighter as BaseFighter, GameState as BaseGameState } from '../../../shared/types/gameState';
import { ActionType } from '../../../shared/types/actions';
import { Rule as BaseRule, Condition as BaseCondition, ConditionType as BaseConditionType } from '../../../shared/types/rules';

/**
 * Extended fighter interface with engine-specific fields
 * (attackCooldown and lastAction) that are not in shared types
 */
export interface Fighter extends BaseFighter {
  attackCooldown: number;
  lastAction: ActionType;
}

/**
 * Extended match state with full fighter information
 */
export interface MatchState extends Omit<BaseGameState, 'fighterA' | 'fighterB'> {
  fighterA: Fighter;
  fighterB: Fighter;
}

/**
 * Extended condition types for engine-specific conditions
 */
export type ExtendedConditionType = BaseConditionType 
  | 'SELF_HEALTH_LESS_THAN'
  | 'SELF_HEALTH_GREATER_THAN'
  | 'SELF_ATTACK_COOLDOWN_EQUAL'
  | 'SELF_ATTACK_COOLDOWN_GREATER_THAN'
  | 'ENEMY_ATTACK_COOLDOWN_EQUAL'
  | 'ENEMY_ATTACK_COOLDOWN_GREATER_THAN';

/**
 * Extended condition interface
 */
export interface ExtendedCondition {
  type: ExtendedConditionType;
  value: number;
}

/**
 * Extended rule interface for engine use
 */
export interface ExtendedRule {
  condition: ExtendedCondition;
  action: ActionType;
}
