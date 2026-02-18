import { parseCode } from '../CASLParser';
import { validateStrategy } from '../CASLValidator';
import { executeStrategy } from '../CASLExecutor';
import { ExecutionContext } from '../../../../../shared/types/casl';

describe('CASL Integration Tests', () => {
  describe('End-to-end workflow', () => {
    it('should parse, validate, and execute a complete strategy', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Attack when close and ready" {
            WHEN distance < 3
             AND self.attackCooldown == 0
            DO ATTACK
          }
          
          RULE "Block when low health" {
            WHEN self.health < 30
            DO BLOCK
          }
          
          DEFAULT APPROACH
        }
      `;

      // Step 1: Parse
      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);
      expect(parseResult.strategy).toBeDefined();

      // Step 2: Validate
      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);

      // Step 3: Execute in different scenarios
      const strategy = parseResult.strategy!;

      // Scenario 1: Close and ready -> should ATTACK
      const context1: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 2,
      };
      expect(executeStrategy(strategy, context1)).toBe('ATTACK');

      // Scenario 2: Low health -> should BLOCK
      const context2: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 25, attackCooldown: 2 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context2)).toBe('BLOCK');

      // Scenario 3: Nothing matches -> should use DEFAULT
      const context3: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 },
        distance: 5,
      };
      expect(executeStrategy(strategy, context3)).toBe('APPROACH');
    });

    it('should handle parsing errors gracefully', () => {
      const invalidCode = `
        STRATEGY BadBot {
          RULE "Invalid" {
            WHEN invalid syntax here
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const parseResult = parseCode(invalidCode);
      expect(parseResult.success).toBe(false);
      expect(parseResult.errors.length).toBeGreaterThan(0);
    });

    it('should handle validation errors gracefully', () => {
      const parseResult = parseCode(`
        STRATEGY InvalidBot {
          RULE "Too many conditions" {
            WHEN distance < 3
             AND enemy.health < 50
             AND self.health > 50
             AND self.attackCooldown == 0
             AND enemy.attackCooldown > 0
             AND distance > 1
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `);

      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors.some(e => e.includes('Too many conditions'))).toBe(true);
    });
  });

  describe('Real-world example strategies', () => {
    it('should handle BeginnerBot strategy', () => {
      const code = `
        STRATEGY BeginnerBot {
          RULE "Finish low health enemy" {
            WHEN enemy.health < 20
             AND distance < 3
            DO ATTACK
          }
          
          RULE "Block when in danger" {
            WHEN self.health < 30
             AND enemy.attackCooldown == 0
            DO BLOCK
          }
          
          RULE "Approach enemy" {
            WHEN distance > 5
            DO APPROACH
          }
          
          DEFAULT IDLE
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);

      // Test execution
      const context: ExecutionContext = {
        enemy: { health: 15, attackCooldown: 2 },
        self: { health: 100, attackCooldown: 0 },
        distance: 2,
      };
      expect(executeStrategy(parseResult.strategy!, context)).toBe('ATTACK');
    });

    it('should handle AggressiveRushdown strategy', () => {
      const code = `
        STRATEGY AggressiveRushdown {
          RULE "Perfect strike opportunity" {
            WHEN enemy.health < 40
             AND self.attackCooldown == 0
             AND distance < 3
            DO ATTACK
          }
          
          RULE "Attack when ready" {
            WHEN self.attackCooldown == 0
             AND distance < 4
            DO ATTACK
          }
          
          RULE "Emergency block" {
            WHEN self.health < 15
            DO BLOCK
          }
          
          RULE "Chase enemy" {
            WHEN distance > 3
            DO APPROACH
          }
          
          RULE "In face pressure" {
            WHEN distance < 2
            DO ATTACK
          }
          
          DEFAULT APPROACH
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
    });

    it('should handle DefensiveTurtle strategy', () => {
      const code = `
        STRATEGY DefensiveTurtle {
          RULE "Block when threatened" {
            WHEN self.health < 50
             OR enemy.attackCooldown == 0
            DO BLOCK
          }
          
          RULE "Retreat when damaged" {
            WHEN self.health < 30
             AND distance < 5
            DO RETREAT
          }
          
          RULE "Safe counterattack" {
            WHEN enemy.health < 25
             AND self.attackCooldown == 0
             AND distance < 3
            DO ATTACK
          }
          
          RULE "Maintain distance" {
            WHEN distance < 3
             AND self.health < 70
            DO RETREAT
          }
          
          RULE "Careful approach" {
            WHEN distance > 7
             AND enemy.attackCooldown > 0
            DO APPROACH
          }
          
          DEFAULT BLOCK
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);

      // Test defensive behavior
      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 2 },
        distance: 2,
      };
      expect(executeStrategy(parseResult.strategy!, context)).toBe('BLOCK');
    });

    it('should handle BalancedFighter strategy', () => {
      const code = `
        STRATEGY BalancedFighter {
          RULE "Aggressive finish" {
            WHEN enemy.health < 30
             AND self.attackCooldown == 0
             AND distance < 3
            DO ATTACK
          }
          
          RULE "Defensive block" {
            WHEN self.health < 40
             AND enemy.attackCooldown == 0
             AND distance < 4
            DO BLOCK
          }
          
          RULE "Kite when low" {
            WHEN self.health < 25
             AND distance < 4
            DO RETREAT
          }
          
          RULE "Optimal attack" {
            WHEN self.attackCooldown == 0
             AND distance < 3
             AND enemy.attackCooldown > 0
            DO ATTACK
          }
          
          RULE "Close distance" {
            WHEN distance > 5
            DO APPROACH
          }
          
          DEFAULT APPROACH
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle strategy with only DEFAULT action', () => {
      const code = `
        STRATEGY MinimalBot {
          DEFAULT IDLE
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.warnings.some(w => w.includes('no rules'))).toBe(true);

      const context: ExecutionContext = {
        enemy: { health: 100, attackCooldown: 0 },
        self: { health: 100, attackCooldown: 0 },
        distance: 5,
      };
      expect(executeStrategy(parseResult.strategy!, context)).toBe('IDLE');
    });

    it('should handle strategy with maximum rules and conditions', () => {
      // Create a strategy with 10 rules, each with 5 conditions
      const rules = Array.from({ length: 10 }, (_, i) => `
        RULE "Rule ${i + 1}" {
          WHEN distance < ${i + 1}
           AND enemy.health < ${(i + 1) * 10}
           AND self.health > ${i * 10}
           AND self.attackCooldown == 0
           AND enemy.attackCooldown > 0
          DO ATTACK
        }
      `).join('\n');

      const code = `
        STRATEGY MaxBot {
          ${rules}
          DEFAULT IDLE
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
    });

    it('should handle all field types in one strategy', () => {
      const code = `
        STRATEGY AllFieldsBot {
          RULE "Check enemy health" {
            WHEN enemy.health < 50
            DO ATTACK
          }
          
          RULE "Check enemy cooldown" {
            WHEN enemy.attackCooldown > 0
            DO ATTACK
          }
          
          RULE "Check self health" {
            WHEN self.health < 30
            DO BLOCK
          }
          
          RULE "Check self cooldown" {
            WHEN self.attackCooldown == 0
            DO ATTACK
          }
          
          RULE "Check distance" {
            WHEN distance > 5
            DO APPROACH
          }
          
          DEFAULT IDLE
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
    });

    it('should handle all operators in one strategy', () => {
      const code = `
        STRATEGY AllOperatorsBot {
          RULE "Less than" {
            WHEN distance < 5
            DO ATTACK
          }
          
          RULE "Greater than" {
            WHEN distance > 5
            DO APPROACH
          }
          
          RULE "Less than or equal" {
            WHEN enemy.health <= 50
            DO ATTACK
          }
          
          RULE "Greater than or equal" {
            WHEN self.health >= 50
            DO ATTACK
          }
          
          RULE "Equal to" {
            WHEN self.attackCooldown == 0
            DO ATTACK
          }
          
          RULE "Not equal to" {
            WHEN self.attackCooldown != 0
            DO BLOCK
          }
          
          DEFAULT IDLE
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
    });

    it('should handle all actions in one strategy', () => {
      const code = `
        STRATEGY AllActionsBot {
          RULE "Attack" {
            WHEN distance < 2
            DO ATTACK
          }
          
          RULE "Block" {
            WHEN self.health < 20
            DO BLOCK
          }
          
          RULE "Approach" {
            WHEN distance > 8
            DO APPROACH
          }
          
          RULE "Retreat" {
            WHEN self.health < 30
             AND distance < 4
            DO RETREAT
          }
          
          RULE "Idle" {
            WHEN distance >= 5
             AND distance <= 7
            DO IDLE
          }
          
          DEFAULT APPROACH
        }
      `;

      const parseResult = parseCode(code);
      expect(parseResult.success).toBe(true);

      const validationResult = validateStrategy(parseResult.strategy!);
      expect(validationResult.valid).toBe(true);
    });
  });
});
