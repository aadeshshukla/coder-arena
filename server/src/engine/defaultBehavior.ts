import { Rule } from '../../../shared/types/rules';
import { ExtendedRule } from './types';

/**
 * Default fallback behavior for fighters with no rules.
 * 
 * Strategy:
 * - Approach if distance > 3
 * - Attack if distance <= 2
 * - Block if health < 20
 */
export function getDefaultRules(): (Rule | ExtendedRule)[] {
  return [
    // Block if low health
    {
      condition: { type: 'SELF_HEALTH_LESS_THAN', value: 20 },
      action: 'BLOCK'
    },
    // Attack if in range
    {
      condition: { type: 'DISTANCE_LESS_THAN', value: 2.5 },
      action: 'ATTACK'
    },
    // Approach if far away
    {
      condition: { type: 'DISTANCE_GREATER_THAN', value: 3 },
      action: 'APPROACH'
    }
  ];
}
