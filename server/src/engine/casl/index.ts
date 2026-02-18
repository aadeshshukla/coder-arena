/**
 * CASL Language Engine
 * 
 * A complete implementation of the Coder Arena Strategy Language (CASL),
 * providing parsing, validation, and execution capabilities for fighter AI.
 * 
 * @module casl
 */

// Parser
export { CASLParser, parseCode } from './CASLParser';

// Validator
export { CASLValidator, validateStrategy } from './CASLValidator';

// Executor
export { CASLExecutor, executeStrategy } from './CASLExecutor';

// Types (re-export from shared)
export type {
  CASLField,
  CASLOperator,
  LogicalOperator,
  CASLCondition,
  CASLConditionGroup,
  CASLRule,
  CASLStrategy,
  ParseResult,
  ValidationResult,
  ExecutionContext,
} from '../../../../shared/types/casl';

export type { ActionType } from '../../../../shared/types/actions';
