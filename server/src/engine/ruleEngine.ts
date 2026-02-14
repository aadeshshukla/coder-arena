import { ActionType } from '../../../shared/types/actions';
import { Rule } from '../../../shared/types/rules';
import { Fighter, ExtendedRule } from './types';

/**
 * Calculate Euclidean distance between two fighters
 */
export function calculateDistance(fighter: Fighter, opponent: Fighter): number {
  const dx = fighter.position.x - opponent.position.x;
  const dy = fighter.position.y - opponent.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Evaluate a single rule condition against fighter states
 * Supports: self_health, enemy_health, distance, self_attackCooldown, enemy_attackCooldown
 */
function evaluateCondition(rule: Rule | ExtendedRule, fighter: Fighter, opponent: Fighter): boolean {
  const distance = calculateDistance(fighter, opponent);
  
  switch (rule.condition.type) {
    // Self health conditions
    case 'SELF_HEALTH_LESS_THAN':
      return fighter.health < rule.condition.value;
    case 'SELF_HEALTH_GREATER_THAN':
      return fighter.health > rule.condition.value;
    
    // Enemy health conditions
    case 'ENEMY_HEALTH_LESS_THAN':
      return opponent.health < rule.condition.value;
    case 'ENEMY_HEALTH_GREATER_THAN':
      return opponent.health > rule.condition.value;
    
    // Distance conditions
    case 'DISTANCE_LESS_THAN':
      return distance < rule.condition.value;
    case 'DISTANCE_GREATER_THAN':
      return distance > rule.condition.value;
    
    // Self attack cooldown conditions
    case 'SELF_ATTACK_COOLDOWN_EQUAL':
      return fighter.attackCooldown === rule.condition.value;
    case 'SELF_ATTACK_COOLDOWN_GREATER_THAN':
      return fighter.attackCooldown > rule.condition.value;
    
    // Enemy attack cooldown conditions
    case 'ENEMY_ATTACK_COOLDOWN_EQUAL':
      return opponent.attackCooldown === rule.condition.value;
    case 'ENEMY_ATTACK_COOLDOWN_GREATER_THAN':
      return opponent.attackCooldown > rule.condition.value;
    
    default:
      return false;
  }
}

/**
 * Given a fighter state, opponent state, and list of Rule objects,
 * return exactly ONE ActionType.
 * 
 * Rules are evaluated top-to-bottom priority.
 * The first valid condition triggers.
 * If no rule matches → return IDLE.
 */
export function evaluateRules(rules: (Rule | ExtendedRule)[], fighter: Fighter, opponent: Fighter): ActionType {
  for (const rule of rules) {
    if (evaluateCondition(rule, fighter, opponent)) {
      return rule.action;
    }
  }
  return 'IDLE';
}
