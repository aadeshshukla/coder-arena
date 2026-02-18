import { ActionType } from './actions';

// Field types that can be used in conditions
export type CASLField = 
  | 'enemy.health'
  | 'enemy.attackCooldown'
  | 'self.health'
  | 'self.attackCooldown'
  | 'distance';

// Comparison operators
export type CASLOperator = '<' | '>' | '<=' | '>=' | '==' | '!=';

// Logical operators for combining conditions
export type LogicalOperator = 'AND' | 'OR';

// A single condition (e.g., "enemy.health < 30")
export interface CASLCondition {
  field: CASLField;
  operator: CASLOperator;
  value: number;
}

// A compound condition with logical operators
export interface CASLConditionGroup {
  conditions: CASLCondition[];
  operators: LogicalOperator[]; // operators[i] combines conditions[i] and conditions[i+1]
}

// A rule with a name, condition group, and action
export interface CASLRule {
  name: string;
  conditionGroup: CASLConditionGroup;
  action: ActionType;
}

// A complete CASL strategy
export interface CASLStrategy {
  name: string;
  rules: CASLRule[];
  defaultAction: ActionType;
}

// Parse result
export interface ParseResult {
  success: boolean;
  strategy?: CASLStrategy;
  errors: string[];
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Execution context - the current game state
export interface ExecutionContext {
  enemy: {
    health: number;
    attackCooldown: number;
  };
  self: {
    health: number;
    attackCooldown: number;
  };
  distance: number;
}
