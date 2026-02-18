import { CASLValidator, validateStrategy } from '../CASLValidator';
import { CASLStrategy } from '../../../../../shared/types/casl';

describe('CASLValidator', () => {
  describe('Valid strategies', () => {
    it('should validate a simple valid strategy', () => {
      const strategy: CASLStrategy = {
        name: 'SimpleBot',
        rules: [
          {
            name: 'Attack when close',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: 3 },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a strategy with multiple rules', () => {
      const strategy: CASLStrategy = {
        name: 'ComplexBot',
        rules: [
          {
            name: 'Rule 1',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 30 },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
          {
            name: 'Rule 2',
            conditionGroup: {
              conditions: [
                { field: 'self.health', operator: '<', value: 20 },
              ],
              operators: [],
            },
            action: 'BLOCK',
          },
        ],
        defaultAction: 'APPROACH',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate all valid fields', () => {
      const fields: Array<'enemy.health' | 'enemy.attackCooldown' | 'self.health' | 'self.attackCooldown' | 'distance'> = [
        'enemy.health',
        'enemy.attackCooldown',
        'self.health',
        'self.attackCooldown',
        'distance',
      ];

      fields.forEach((field) => {
        const strategy: CASLStrategy = {
          name: 'TestBot',
          rules: [
            {
              name: 'Test',
              conditionGroup: {
                conditions: [{ field, operator: '<', value: 50 }],
                operators: [],
              },
              action: 'ATTACK',
            },
          ],
          defaultAction: 'IDLE',
        };

        const result = validateStrategy(strategy);
        expect(result.valid).toBe(true);
      });
    });

    it('should validate all valid operators', () => {
      const operators: Array<'<' | '>' | '<=' | '>=' | '==' | '!='> = ['<', '>', '<=', '>=', '==', '!='];

      operators.forEach((operator) => {
        const strategy: CASLStrategy = {
          name: 'TestBot',
          rules: [
            {
              name: 'Test',
              conditionGroup: {
                conditions: [{ field: 'distance', operator, value: 5 }],
                operators: [],
              },
              action: 'ATTACK',
            },
          ],
          defaultAction: 'IDLE',
        };

        const result = validateStrategy(strategy);
        expect(result.valid).toBe(true);
      });
    });

    it('should validate all valid actions', () => {
      const actions: Array<'ATTACK' | 'BLOCK' | 'APPROACH' | 'RETREAT' | 'IDLE'> = [
        'ATTACK',
        'BLOCK',
        'APPROACH',
        'RETREAT',
        'IDLE',
      ];

      actions.forEach((action) => {
        const strategy: CASLStrategy = {
          name: 'TestBot',
          rules: [
            {
              name: 'Test',
              conditionGroup: {
                conditions: [{ field: 'distance', operator: '<', value: 5 }],
                operators: [],
              },
              action,
            },
          ],
          defaultAction: 'IDLE',
        };

        const result = validateStrategy(strategy);
        expect(result.valid).toBe(true);
      });
    });

    it('should validate AND/OR logic', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 30 },
                { field: 'distance', operator: '<', value: 3 },
                { field: 'self.attackCooldown', operator: '==', value: 0 },
              ],
              operators: ['AND', 'AND'],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid strategy name', () => {
    it('should reject empty strategy name', () => {
      const strategy: CASLStrategy = {
        name: '',
        rules: [],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Strategy name cannot be empty');
    });

    it('should reject strategy name with special characters', () => {
      const strategy: CASLStrategy = {
        name: 'Invalid-Name!',
        rules: [],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid strategy name'))).toBe(true);
    });

    it('should warn about long strategy name', () => {
      const strategy: CASLStrategy = {
        name: 'A'.repeat(51),
        rules: [],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.warnings.some(w => w.includes('very long'))).toBe(true);
    });
  });

  describe('Rule count validation', () => {
    it('should warn when no rules are present', () => {
      const strategy: CASLStrategy = {
        name: 'EmptyBot',
        rules: [],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.warnings).toContain('Strategy has no rules, will always use DEFAULT action');
    });

    it('should reject too many rules', () => {
      const rules = Array.from({ length: 11 }, (_, i) => ({
        name: `Rule ${i}`,
        conditionGroup: {
          conditions: [{ field: 'distance' as const, operator: '<' as const, value: 5 }],
          operators: [],
        },
        action: 'ATTACK' as const,
      }));

      const strategy: CASLStrategy = {
        name: 'TooManyRules',
        rules,
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Too many rules'))).toBe(true);
    });

    it('should accept maximum allowed rules (10)', () => {
      const rules = Array.from({ length: 10 }, (_, i) => ({
        name: `Rule ${i}`,
        conditionGroup: {
          conditions: [{ field: 'distance' as const, operator: '<' as const, value: 5 }],
          operators: [],
        },
        action: 'ATTACK' as const,
      }));

      const strategy: CASLStrategy = {
        name: 'MaxRules',
        rules,
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });
  });

  describe('Condition validation', () => {
    it('should reject rule with no conditions', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('at least one condition'))).toBe(true);
    });

    it('should reject too many conditions', () => {
      const conditions = Array.from({ length: 6 }, () => ({
        field: 'distance' as const,
        operator: '<' as const,
        value: 5,
      }));

      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions,
              operators: ['AND', 'AND', 'AND', 'AND', 'AND'],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Too many conditions'))).toBe(true);
    });

    it('should accept maximum allowed conditions (5)', () => {
      const conditions = Array.from({ length: 5 }, () => ({
        field: 'distance' as const,
        operator: '<' as const,
        value: 5,
      }));

      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions,
              operators: ['AND', 'AND', 'AND', 'AND'],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid field', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'invalid.field' as any, operator: '<', value: 5 },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid field'))).toBe(true);
    });

    it('should reject invalid operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '===' as any, value: 5 },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid operator'))).toBe(true);
    });

    it('should reject non-number value', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: 'invalid' as any },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Value must be a number'))).toBe(true);
    });

    it('should reject NaN value', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: NaN },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('NaN'))).toBe(true);
    });

    it('should reject infinite value', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: Infinity },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('finite'))).toBe(true);
    });

    it('should warn about health value over 100', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 150 },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.warnings.some(w => w.includes('exceeds typical maximum'))).toBe(true);
    });

    it('should warn about negative health value', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'self.health', operator: '<', value: -10 },
              ],
              operators: [],
            },
            action: 'BLOCK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.warnings.some(w => w.includes('0-100'))).toBe(true);
    });
  });

  describe('Logical operator validation', () => {
    it('should reject invalid logical operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: 5 },
                { field: 'self.health', operator: '<', value: 30 },
              ],
              operators: ['XOR' as any],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid logical operator'))).toBe(true);
    });

    it('should reject mismatched operator count', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: 5 },
                { field: 'self.health', operator: '<', value: 30 },
              ],
              operators: ['AND', 'AND'], // Too many operators
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('operator count mismatch'))).toBe(true);
    });
  });

  describe('Action validation', () => {
    it('should reject invalid action in rule', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '<', value: 5 }],
              operators: [],
            },
            action: 'INVALID_ACTION' as any,
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid action'))).toBe(true);
    });

    it('should reject invalid default action', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [],
        defaultAction: 'INVALID_ACTION' as any,
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid action'))).toBe(true);
    });
  });

  describe('Rule name validation', () => {
    it('should reject empty rule name', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: '',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '<', value: 5 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const result = validateStrategy(strategy);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Rule name cannot be empty'))).toBe(true);
    });
  });
});
