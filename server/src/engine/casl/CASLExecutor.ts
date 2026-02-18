import {
  CASLStrategy,
  CASLRule,
  CASLCondition,
  CASLConditionGroup,
  ExecutionContext,
} from '../../../../shared/types/casl';
import { ActionType } from '../../../../shared/types/actions';

/**
 * CASL Executor - Executes CASL strategies during combat
 */
export class CASLExecutor {
  private strategy: CASLStrategy;

  constructor(strategy: CASLStrategy) {
    this.strategy = strategy;
  }

  /**
   * Execute the strategy given the current game state
   * Returns the action to perform
   */
  execute(context: ExecutionContext): ActionType {
    // Evaluate rules in priority order (top to bottom)
    for (const rule of this.strategy.rules) {
      if (this.evaluateRule(rule, context)) {
        return rule.action;
      }
    }

    // No rules matched, use default action
    return this.strategy.defaultAction;
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(rule: CASLRule, context: ExecutionContext): boolean {
    return this.evaluateConditionGroup(rule.conditionGroup, context);
  }

  /**
   * Evaluate a condition group with AND/OR logic
   */
  private evaluateConditionGroup(
    group: CASLConditionGroup,
    context: ExecutionContext
  ): boolean {
    if (group.conditions.length === 0) {
      return false;
    }

    // Start with the first condition
    let result = this.evaluateCondition(group.conditions[0], context);

    // Apply logical operators
    for (let i = 0; i < group.operators.length; i++) {
      const operator = group.operators[i];
      const nextCondition = group.conditions[i + 1];
      const nextResult = this.evaluateCondition(nextCondition, context);

      if (operator === 'AND') {
        result = result && nextResult;
      } else if (operator === 'OR') {
        result = result || nextResult;
      }
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: CASLCondition,
    context: ExecutionContext
  ): boolean {
    const actualValue = this.getFieldValue(condition.field, context);
    const expectedValue = condition.value;

    switch (condition.operator) {
      case '<':
        return actualValue < expectedValue;
      case '>':
        return actualValue > expectedValue;
      case '<=':
        return actualValue <= expectedValue;
      case '>=':
        return actualValue >= expectedValue;
      case '==':
        return actualValue === expectedValue;
      case '!=':
        return actualValue !== expectedValue;
      default:
        return false;
    }
  }

  /**
   * Get the value of a field from the execution context
   */
  private getFieldValue(field: string, context: ExecutionContext): number {
    switch (field) {
      case 'enemy.health':
        return context.enemy.health;
      case 'enemy.attackCooldown':
        return context.enemy.attackCooldown;
      case 'self.health':
        return context.self.health;
      case 'self.attackCooldown':
        return context.self.attackCooldown;
      case 'distance':
        return context.distance;
      default:
        return 0;
    }
  }
}

/**
 * Convenience function to execute a strategy
 */
export function executeStrategy(
  strategy: CASLStrategy,
  context: ExecutionContext
): ActionType {
  const executor = new CASLExecutor(strategy);
  return executor.execute(context);
}
