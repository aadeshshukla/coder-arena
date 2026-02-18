import {
  CASLStrategy,
  CASLRule,
  CASLCondition,
  CASLConditionGroup,
  CASLField,
  CASLOperator,
  LogicalOperator,
  ParseResult,
} from '../../../../shared/types/casl';
import { ActionType } from '../../../../shared/types/actions';

/**
 * CASL Parser - Parses CASL code text into structured rules
 */
export class CASLParser {
  private code: string;
  private errors: string[];

  constructor(code: string) {
    this.code = code;
    this.errors = [];
  }

  /**
   * Parse CASL code and return a ParseResult
   */
  parse(): ParseResult {
    this.errors = [];

    try {
      // Remove comments and normalize whitespace
      const cleanedCode = this.cleanCode(this.code);

      // Extract strategy name
      const strategyName = this.extractStrategyName(cleanedCode);
      if (!strategyName) {
        this.errors.push('Missing STRATEGY declaration');
        return { success: false, errors: this.errors };
      }

      // Extract rules
      const rules = this.extractRules(cleanedCode);

      // Extract default action
      const defaultAction = this.extractDefaultAction(cleanedCode);
      if (!defaultAction) {
        this.errors.push('Missing DEFAULT action');
        return { success: false, errors: this.errors };
      }

      const strategy: CASLStrategy = {
        name: strategyName,
        rules,
        defaultAction,
      };

      return {
        success: this.errors.length === 0,
        strategy: this.errors.length === 0 ? strategy : undefined,
        errors: this.errors,
      };
    } catch (error) {
      this.errors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, errors: this.errors };
    }
  }

  /**
   * Remove comments and normalize whitespace
   */
  private cleanCode(code: string): string {
    // Remove single-line comments
    let cleaned = code.replace(/\/\/[^\n]*/g, '');
    // Remove multi-line comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return cleaned;
  }

  /**
   * Extract strategy name from STRATEGY declaration
   */
  private extractStrategyName(code: string): string | null {
    const strategyMatch = code.match(/STRATEGY\s+(\w+)\s*\{/);
    if (!strategyMatch) {
      return null;
    }
    return strategyMatch[1];
  }

  /**
   * Extract all rules from the code
   */
  private extractRules(code: string): CASLRule[] {
    const rules: CASLRule[] = [];
    
    // Match RULE blocks: RULE "name" { ... }
    const ruleRegex = /RULE\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    let match;

    while ((match = ruleRegex.exec(code)) !== null) {
      const ruleName = match[1];
      const ruleBody = match[2];

      try {
        const rule = this.parseRule(ruleName, ruleBody);
        rules.push(rule);
      } catch (error) {
        this.errors.push(`Error parsing rule "${ruleName}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return rules;
  }

  /**
   * Parse a single rule
   */
  private parseRule(name: string, body: string): CASLRule {
    // Extract WHEN conditions
    const whenMatch = body.match(/WHEN\s+([\s\S]*?)\s+DO\s+/);
    if (!whenMatch) {
      throw new Error('Missing WHEN or DO clause');
    }

    const conditionsText = whenMatch[1];
    const conditionGroup = this.parseConditions(conditionsText);

    // Extract DO action
    const doMatch = body.match(/DO\s+(\w+)/);
    if (!doMatch) {
      throw new Error('Missing action after DO');
    }

    const action = doMatch[1] as ActionType;

    return {
      name,
      conditionGroup,
      action,
    };
  }

  /**
   * Parse condition text with AND/OR logic
   */
  private parseConditions(text: string): CASLConditionGroup {
    const conditions: CASLCondition[] = [];
    const operators: LogicalOperator[] = [];

    // Split by AND/OR but preserve them
    const parts = text.split(/\s+(AND|OR)\s+/);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      if (part === 'AND' || part === 'OR') {
        operators.push(part as LogicalOperator);
      } else if (part) {
        // Parse condition
        const condition = this.parseCondition(part);
        conditions.push(condition);
      }
    }

    return { conditions, operators };
  }

  /**
   * Parse a single condition (e.g., "enemy.health < 30")
   */
  private parseCondition(text: string): CASLCondition {
    // Match: field operator value
    const conditionRegex = /^([\w.]+)\s*(<=|>=|==|!=|<|>)\s*(\d+(?:\.\d+)?)$/;
    const match = text.trim().match(conditionRegex);

    if (!match) {
      throw new Error(`Invalid condition syntax: "${text}"`);
    }

    const field = match[1] as CASLField;
    const operator = match[2] as CASLOperator;
    const value = parseFloat(match[3]);

    return { field, operator, value };
  }

  /**
   * Extract default action
   */
  private extractDefaultAction(code: string): ActionType | null {
    const defaultMatch = code.match(/DEFAULT\s+(\w+)/);
    if (!defaultMatch) {
      return null;
    }
    return defaultMatch[1] as ActionType;
  }
}

/**
 * Convenience function to parse CASL code
 */
export function parseCode(code: string): ParseResult {
  const parser = new CASLParser(code);
  return parser.parse();
}
