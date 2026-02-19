import * as acorn from 'acorn';
import type { Program, ClassDeclaration, MethodDefinition } from 'acorn';

export interface JSValidationResult {
  valid: boolean;
  errors: Array<{ message: string; line?: number }>;
}

// Patterns forbidden for security reasons
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
];

/**
 * Validates player-submitted JavaScript code before battle execution
 */
export class JSValidator {
  /**
   * Validate JavaScript code
   */
  validate(code: string): JSValidationResult {
    const errors: Array<{ message: string; line?: number }> = [];

    // Check for forbidden patterns (text-level checks)
    for (const { pattern, message } of FORBIDDEN_PATTERNS) {
      if (pattern.test(code)) {
        errors.push({ message });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Parse the code to check for syntax errors and validate structure via AST
    let ast: Program;
    try {
      ast = acorn.parse(code, { ecmaVersion: 2020 }) as Program;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err && 'loc' in err) {
        const parseErr = err as { message: string; loc?: { line?: number } };
        errors.push({
          message: `Syntax error: ${parseErr.message}`,
          line: parseErr.loc?.line
        });
      } else {
        errors.push({ message: 'Syntax error in code' });
      }
      return { valid: false, errors };
    }

    // Use AST to verify a Fighter class with execute() method exists
    const fighterClass = ast.body.find(
      (node): node is ClassDeclaration =>
        node.type === 'ClassDeclaration' &&
        node.id?.name === 'Fighter'
    );

    if (!fighterClass) {
      errors.push({ message: 'Code must define a class named Fighter' });
    } else {
      const hasExecute = fighterClass.body.body.some(
        (member): member is MethodDefinition =>
          member.type === 'MethodDefinition' &&
          member.kind === 'method' &&
          member.key.type === 'Identifier' &&
          (member.key as { name: string }).name === 'execute'
      );
      if (!hasExecute) {
        errors.push({ message: 'Fighter class must have an execute() method' });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
