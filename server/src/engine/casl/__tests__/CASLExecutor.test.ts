import { CASLExecutor, executeStrategy } from '../CASLExecutor';
import { CASLStrategy, ExecutionContext } from '../../../../../shared/types/casl';

describe('CASLExecutor', () => {
  describe('Basic execution', () => {
    it('should execute a simple rule', () => {
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

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 2,
      };

      const action = executeStrategy(strategy, context);
      expect(action).toBe('ATTACK');
    });

    it('should use default action when no rules match', () => {
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

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5, // Far away, rule won't match
      };

      const action = executeStrategy(strategy, context);
      expect(action).toBe('IDLE');
    });

    it('should execute first matching rule (priority order)', () => {
      const strategy: CASLStrategy = {
        name: 'PriorityBot',
        rules: [
          {
            name: 'Rule 1',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: 5 },
              ],
              operators: [],
            },
            action: 'ATTACK',
          },
          {
            name: 'Rule 2',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '<', value: 10 },
              ],
              operators: [],
            },
            action: 'APPROACH',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 4, // Matches both rules
      };

      const action = executeStrategy(strategy, context);
      expect(action).toBe('ATTACK'); // First rule should win
    });
  });

  describe('All operators', () => {
    it('should evaluate < operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '<', value: 5 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const contextMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 4,
      };
      expect(executeStrategy(strategy, contextMatch)).toBe('ATTACK');

      const contextNoMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 6,
      };
      expect(executeStrategy(strategy, contextNoMatch)).toBe('IDLE');
    });

    it('should evaluate > operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '>', value: 5 }],
              operators: [],
            },
            action: 'APPROACH',
          },
        ],
        defaultAction: 'IDLE',
      };

      const contextMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 6,
      };
      expect(executeStrategy(strategy, contextMatch)).toBe('APPROACH');

      const contextNoMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 4,
      };
      expect(executeStrategy(strategy, contextNoMatch)).toBe('IDLE');
    });

    it('should evaluate <= operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '<=', value: 5 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const contextEqual: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, contextEqual)).toBe('ATTACK');

      const contextLess: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 4,
      };
      expect(executeStrategy(strategy, contextLess)).toBe('ATTACK');

      const contextGreater: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 6,
      };
      expect(executeStrategy(strategy, contextGreater)).toBe('IDLE');
    });

    it('should evaluate >= operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '>=', value: 5 }],
              operators: [],
            },
            action: 'APPROACH',
          },
        ],
        defaultAction: 'IDLE',
      };

      const contextEqual: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, contextEqual)).toBe('APPROACH');

      const contextGreater: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 6,
      };
      expect(executeStrategy(strategy, contextGreater)).toBe('APPROACH');

      const contextLess: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 4,
      };
      expect(executeStrategy(strategy, contextLess)).toBe('IDLE');
    });

    it('should evaluate == operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'self.attackCooldown', operator: '==', value: 0 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const contextMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, contextMatch)).toBe('ATTACK');

      const contextNoMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 },
        distance: 5,
      };
      expect(executeStrategy(strategy, contextNoMatch)).toBe('IDLE');
    });

    it('should evaluate != operator', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'self.attackCooldown', operator: '!=', value: 0 }],
              operators: [],
            },
            action: 'BLOCK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const contextMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 },
        distance: 5,
      };
      expect(executeStrategy(strategy, contextMatch)).toBe('BLOCK');

      const contextNoMatch: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, contextNoMatch)).toBe('IDLE');
    });
  });

  describe('All fields', () => {
    it('should read enemy.health field', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'enemy.health', operator: '<', value: 50 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 30, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('ATTACK');
    });

    it('should read enemy.attackCooldown field', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'enemy.attackCooldown', operator: '>', value: 0 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 2 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('ATTACK');
    });

    it('should read self.health field', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'self.health', operator: '<', value: 30 }],
              operators: [],
            },
            action: 'RETREAT',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 20, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('RETREAT');
    });

    it('should read self.attackCooldown field', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'self.attackCooldown', operator: '==', value: 0 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('ATTACK');
    });

    it('should read distance field', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [{ field: 'distance', operator: '<', value: 3 }],
              operators: [],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 2,
      };
      expect(executeStrategy(strategy, context)).toBe('ATTACK');
    });
  });

  describe('AND logic', () => {
    it('should evaluate AND logic correctly (all true)', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 50 },
                { field: 'distance', operator: '<', value: 5 },
                { field: 'self.attackCooldown', operator: '==', value: 0 },
              ],
              operators: ['AND', 'AND'],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 30, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 3,
      };
      expect(executeStrategy(strategy, context)).toBe('ATTACK');
    });

    it('should evaluate AND logic correctly (one false)', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 50 },
                { field: 'distance', operator: '<', value: 5 },
                { field: 'self.attackCooldown', operator: '==', value: 0 },
              ],
              operators: ['AND', 'AND'],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 30, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 }, // This makes the third condition false
        distance: 3,
      };
      expect(executeStrategy(strategy, context)).toBe('IDLE');
    });
  });

  describe('OR logic', () => {
    it('should evaluate OR logic correctly (all false)', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 20 },
                { field: 'self.health', operator: '<', value: 20 },
              ],
              operators: ['OR'],
            },
            action: 'RETREAT',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 50, attackCooldown: 0 },
        self: { health: 50, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('IDLE');
    });

    it('should evaluate OR logic correctly (first true)', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 20 },
                { field: 'self.health', operator: '<', value: 20 },
              ],
              operators: ['OR'],
            },
            action: 'RETREAT',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 10, attackCooldown: 0 }, // This is true
        self: { health: 50, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('RETREAT');
    });

    it('should evaluate OR logic correctly (second true)', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 20 },
                { field: 'self.health', operator: '<', value: 20 },
              ],
              operators: ['OR'],
            },
            action: 'RETREAT',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 50, attackCooldown: 0 },
        self: { health: 10, attackCooldown: 0 }, // This is true
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('RETREAT');
    });

    it('should evaluate OR logic correctly (both true)', () => {
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 20 },
                { field: 'self.health', operator: '<', value: 20 },
              ],
              operators: ['OR'],
            },
            action: 'RETREAT',
          },
        ],
        defaultAction: 'IDLE',
      };

      const context: ExecutionContext = {
        enemy: { health: 10, attackCooldown: 0 },
        self: { health: 10, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context)).toBe('RETREAT');
    });
  });

  describe('Mixed AND/OR logic', () => {
    it('should evaluate mixed AND/OR logic correctly', () => {
      // Condition: (A AND B) OR C
      // Logic evaluates left to right: (A AND B) first, then result OR C
      const strategy: CASLStrategy = {
        name: 'TestBot',
        rules: [
          {
            name: 'Test',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 30 },    // A
                { field: 'distance', operator: '<', value: 3 },         // B
                { field: 'self.attackCooldown', operator: '==', value: 0 }, // C
              ],
              operators: ['AND', 'OR'],
            },
            action: 'ATTACK',
          },
        ],
        defaultAction: 'IDLE',
      };

      // Test: A=true, B=true, C=false => (true AND true) OR false = true
      const context1: ExecutionContext = {
        enemy: { health: 20, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 },
        distance: 2,
      };
      expect(executeStrategy(strategy, context1)).toBe('ATTACK');

      // Test: A=true, B=false, C=true => (true AND false) OR true = true
      const context2: ExecutionContext = {
        enemy: { health: 20, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context2)).toBe('ATTACK');

      // Test: A=false, B=false, C=false => (false AND false) OR false = false
      const context3: ExecutionContext = {
        enemy: { health: 50, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context3)).toBe('IDLE');
    });
  });

  describe('Complex strategy execution', () => {
    it('should execute a complete beginner strategy correctly', () => {
      const strategy: CASLStrategy = {
        name: 'BeginnerBot',
        rules: [
          {
            name: 'Finish low health enemy',
            conditionGroup: {
              conditions: [
                { field: 'enemy.health', operator: '<', value: 20 },
                { field: 'distance', operator: '<', value: 3 },
              ],
              operators: ['AND'],
            },
            action: 'ATTACK',
          },
          {
            name: 'Block when in danger',
            conditionGroup: {
              conditions: [
                { field: 'self.health', operator: '<', value: 30 },
                { field: 'enemy.attackCooldown', operator: '==', value: 0 },
              ],
              operators: ['AND'],
            },
            action: 'BLOCK',
          },
          {
            name: 'Approach enemy',
            conditionGroup: {
              conditions: [
                { field: 'distance', operator: '>', value: 5 },
              ],
              operators: [],
            },
            action: 'APPROACH',
          },
        ],
        defaultAction: 'IDLE',
      };

      // Scenario 1: Finish low health enemy
      const context1: ExecutionContext = {
        enemy: { health: 15, attackCooldown: 1 },
        self: { health: 50, attackCooldown: 0 },
        distance: 2,
      };
      expect(executeStrategy(strategy, context1)).toBe('ATTACK');

      // Scenario 2: Block when in danger
      const context2: ExecutionContext = {
        enemy: { health: 80, attackCooldown: 0 },
        self: { health: 25, attackCooldown: 2 },
        distance: 2,
      };
      expect(executeStrategy(strategy, context2)).toBe('BLOCK');

      // Scenario 3: Approach enemy
      const context3: ExecutionContext = {
        enemy: { health: 80, attackCooldown: 2 },
        self: { health: 80, attackCooldown: 1 },
        distance: 7,
      };
      expect(executeStrategy(strategy, context3)).toBe('APPROACH');

      // Scenario 4: Default action
      const context4: ExecutionContext = {
        enemy: { health: 80, attackCooldown: 2 },
        self: { health: 80, attackCooldown: 1 },
        distance: 4,
      };
      expect(executeStrategy(strategy, context4)).toBe('IDLE');
    });
  });

  describe('Performance', () => {
    it('should execute strategy quickly', () => {
      const strategy: CASLStrategy = {
        name: 'PerformanceBot',
        rules: [
          {
            name: 'Rule 1',
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

      const context: ExecutionContext = {
        enemy: { health: 50, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };

      const startTime = performance.now();
      for (let i = 0; i < 10000; i++) {
        executeStrategy(strategy, context);
      }
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 10000;

      // Should be well under 1ms per execution
      expect(avgTime).toBeLessThan(1);
    });
  });
});
