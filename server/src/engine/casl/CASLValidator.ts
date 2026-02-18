import {
  CASLStrategy,
  CASLField,
  CASLOperator,
  ValidationResult,
} from '../../../../shared/types/casl';
import { ActionType } from '../../../../shared/types/actions';

/**
 * CASL Validator - Validates parsed CASL strategies
 */
export class CASLValidator {
  private static readonly VALID_FIELDS: CASLField[] = [
    'enemy.health',
    'enemy.attackCooldown',
    'self.health',
    'self.attackCooldown',
    'distance',
  ];

  private static readonly VALID_OPERATORS: CASLOperator[] = [
    '<',
    '>',
    '<=',
    '>=',
    '==',
    '!=',
  ];

  private static readonly VALID_ACTIONS: ActionType[] = [
    'ATTACK',
    'BLOCK',
    'APPROACH',
    'RETREAT',
    'IDLE',
  ];

  private static readonly MAX_RULES = 10;
  private static readonly MAX_CONDITIONS_PER_RULE = 5;

  private errors: string[];
  private warnings: string[];

  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate a parsed CASL strategy
   */
  validate(strategy: CASLStrategy): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Validate strategy name
    this.validateStrategyName(strategy.name);

    // Validate number of rules
    this.validateRuleCount(strategy.rules.length);

    // Validate each rule
    strategy.rules.forEach((rule, index) => {
      this.validateRule(rule, index);
    });

    // Validate default action
    this.validateAction(strategy.defaultAction, 'DEFAULT');

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate strategy name
   */
  private validateStrategyName(name: string): void {
    if (!name || name.trim().length === 0) {
      this.errors.push('Strategy name cannot be empty');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      this.errors.push(
        `Invalid strategy name "${name}": must contain only letters, numbers, and underscores`
      );
    }

    if (name.length > 50) {
      this.warnings.push(
        `Strategy name "${name}" is very long (${name.length} characters)`
      );
    }
  }

  /**
   * Validate rule count
   */
  private validateRuleCount(count: number): void {
    if (count === 0) {
      this.warnings.push('Strategy has no rules, will always use DEFAULT action');
    }

    if (count > CASLValidator.MAX_RULES) {
      this.errors.push(
        `Too many rules: ${count} (maximum is ${CASLValidator.MAX_RULES})`
      );
    }
  }

  /**
   * Validate a single rule
   */
  private validateRule(rule: any, index: number): void {
    const rulePrefix = `Rule ${index + 1} ("${rule.name}")`;

    // Validate rule name
    if (!rule.name || rule.name.trim().length === 0) {
      this.errors.push(`${rulePrefix}: Rule name cannot be empty`);
    }

    // Validate condition count
    const conditionCount = rule.conditionGroup.conditions.length;
    if (conditionCount === 0) {
      this.errors.push(`${rulePrefix}: Must have at least one condition`);
      return;
    }

    if (conditionCount > CASLValidator.MAX_CONDITIONS_PER_RULE) {
      this.errors.push(
        `${rulePrefix}: Too many conditions: ${conditionCount} (maximum is ${CASLValidator.MAX_CONDITIONS_PER_RULE})`
      );
    }

    // Validate conditions
    rule.conditionGroup.conditions.forEach((condition: any, condIndex: number) => {
      this.validateCondition(condition, `${rulePrefix}, condition ${condIndex + 1}`);
    });

    // Validate logical operators count
    const operatorCount = rule.conditionGroup.operators.length;
    if (operatorCount !== conditionCount - 1) {
      this.errors.push(
        `${rulePrefix}: Logical operator count mismatch (expected ${conditionCount - 1}, got ${operatorCount})`
      );
    }

    // Validate logical operators
    rule.conditionGroup.operators.forEach((op: string, opIndex: number) => {
      if (op !== 'AND' && op !== 'OR') {
        this.errors.push(
          `${rulePrefix}: Invalid logical operator "${op}" (must be AND or OR)`
        );
      }
    });

    // Validate action
    this.validateAction(rule.action, rulePrefix);
  }

  /**
   * Validate a single condition
   */
  private validateCondition(condition: any, prefix: string): void {
    // Validate field
    if (!CASLValidator.VALID_FIELDS.includes(condition.field)) {
      this.errors.push(
        `${prefix}: Invalid field "${condition.field}" (valid fields: ${CASLValidator.VALID_FIELDS.join(', ')})`
      );
    }

    // Validate operator
    if (!CASLValidator.VALID_OPERATORS.includes(condition.operator)) {
      this.errors.push(
        `${prefix}: Invalid operator "${condition.operator}" (valid operators: ${CASLValidator.VALID_OPERATORS.join(', ')})`
      );
    }

    // Validate value
    if (typeof condition.value !== 'number') {
      this.errors.push(`${prefix}: Value must be a number`);
    } else if (isNaN(condition.value)) {
      this.errors.push(`${prefix}: Value is NaN`);
    } else if (!isFinite(condition.value)) {
      this.errors.push(`${prefix}: Value must be finite`);
    }

    // Warn about potentially invalid value ranges
    if (condition.field === 'enemy.health' || condition.field === 'self.health') {
      if (condition.value < 0) {
        this.warnings.push(`${prefix}: Health values are typically 0-100`);
      } else if (condition.value > 100) {
        this.warnings.push(`${prefix}: Health value ${condition.value} exceeds typical maximum of 100`);
      }
    }

    if (condition.field === 'enemy.attackCooldown' || condition.field === 'self.attackCooldown') {
      if (condition.value < 0) {
        this.warnings.push(`${prefix}: Attack cooldown cannot be negative`);
      } else if (condition.value > 3) {
        this.warnings.push(`${prefix}: Attack cooldown value ${condition.value} exceeds typical maximum of 3`);
      }
    }

    if (condition.field === 'distance') {
      if (condition.value < 0) {
        this.warnings.push(`${prefix}: Distance cannot be negative`);
      } else if (condition.value > 10) {
        this.warnings.push(`${prefix}: Distance value ${condition.value} exceeds typical maximum of 10`);
      }
    }
  }

  /**
   * Validate an action
   */
  private validateAction(action: any, prefix: string): void {
    if (!CASLValidator.VALID_ACTIONS.includes(action)) {
      this.errors.push(
        `${prefix}: Invalid action "${action}" (valid actions: ${CASLValidator.VALID_ACTIONS.join(', ')})`
      );
    }
  }
}

/**
 * Convenience function to validate a strategy
 */
export function validateStrategy(strategy: CASLStrategy): ValidationResult {
  const validator = new CASLValidator();
  return validator.validate(strategy);
}
