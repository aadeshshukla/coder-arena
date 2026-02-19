import { ActionType } from '../../../../shared/types/actions';

export interface ParsedAction {
  name: string;
  actions: ActionType[];
  conditions?: Record<string, unknown>;
}

// Keywords in function bodies that map to ActionType values
const ACTION_KEYWORDS: Array<{ pattern: RegExp; action: ActionType }> = [
  { pattern: /\battack\s*\(/, action: 'ATTACK' },
  { pattern: /\bmoveForward\s*\(|\bapproach\s*\(/, action: 'APPROACH' },
  { pattern: /\bmoveBackward\s*\(|\bretreat\s*\(/, action: 'RETREAT' },
  { pattern: /\bdefend\s*\(|\bblock\s*\(/, action: 'BLOCK' },
];

// Patterns forbidden for safety
const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\beval\s*\(/, message: 'Use of eval() is not allowed' },
  { pattern: /\bFunction\s*\(/, message: 'Use of Function() constructor is not allowed' },
  { pattern: /\bsetTimeout\s*\(/, message: 'Use of setTimeout() is not allowed' },
  { pattern: /\bsetInterval\s*\(/, message: 'Use of setInterval() is not allowed' },
  { pattern: /\bprocess\b/, message: 'Access to process is not allowed' },
  { pattern: /\brequire\s*\(/, message: 'Use of require() is not allowed' },
  { pattern: /\bimport\b/, message: 'Use of import is not allowed' },
  { pattern: /\b__dirname\b|\b__filename\b/, message: 'Access to Node.js path globals is not allowed' },
  { pattern: /\bglobal\b/, message: 'Access to global is not allowed' },
  { pattern: /\bBuffer\b/, message: 'Access to Buffer is not allowed' },
  { pattern: /while\s*\(\s*true\s*\)/, message: 'Infinite loops are not allowed' },
  { pattern: /for\s*\(\s*;\s*;\s*\)/, message: 'Infinite loops are not allowed' },
];

/**
 * Parses player-submitted action button code into a structured ParsedAction.
 */
export class ActionButtonParser {
  /**
   * Parse a code snippet and return a ParsedAction.
   * The code should contain a single named function.
   */
  static parse(code: string): ParsedAction {
    const functionName = ActionButtonParser.extractFunctionName(code);
    const name = ActionButtonParser.humanizeName(functionName || 'custom');
    const actions = ActionButtonParser.extractActions(code);

    return { name, actions };
  }

  /**
   * Extract the first function name found in the code.
   */
  static extractFunctionName(code: string): string {
    const match = code.match(/function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/);
    return match ? match[1] : '';
  }

  /**
   * Convert a camelCase identifier to a "Title Case" display name.
   * e.g. "customAttack" → "Custom Attack"
   */
  static humanizeName(functionName: string): string {
    if (!functionName) return 'Custom Action';
    // Insert space before each upper-case letter and capitalise first letter
    const spaced = functionName.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  /**
   * Scan the code body for recognised action calls and return the
   * ordered list of ActionType values found.
   */
  static extractActions(code: string): ActionType[] {
    const found: ActionType[] = [];
    for (const { pattern, action } of ACTION_KEYWORDS) {
      if (pattern.test(code) && !found.includes(action)) {
        found.push(action);
      }
    }
    // Default to ATTACK if nothing recognised
    return found.length > 0 ? found : ['ATTACK'];
  }

  /**
   * Validate submitted code for safety.
   * Returns { valid: true } or { valid: false, errors: string[] }.
   */
  static validateCode(code: string): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    for (const { pattern, message } of FORBIDDEN_PATTERNS) {
      if (pattern.test(code)) {
        errors.push(message);
      }
    }

    if (!ActionButtonParser.extractFunctionName(code)) {
      errors.push('Code must define a named function');
    }

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
  }
}
