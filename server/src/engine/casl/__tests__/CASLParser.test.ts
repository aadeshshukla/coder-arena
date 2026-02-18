import { CASLParser, parseCode } from '../CASLParser';

describe('CASLParser', () => {
  describe('Basic parsing', () => {
    it('should parse a simple valid strategy', () => {
      const code = `
        STRATEGY SimpleBot {
          RULE "Attack when close" {
            WHEN distance < 3
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      
      expect(result.success).toBe(true);
      expect(result.strategy).toBeDefined();
      expect(result.strategy!.name).toBe('SimpleBot');
      expect(result.strategy!.rules).toHaveLength(1);
      expect(result.strategy!.defaultAction).toBe('IDLE');
    });

    it('should parse strategy with multiple rules', () => {
      const code = `
        STRATEGY AggressiveBot {
          RULE "Attack low health enemy" {
            WHEN enemy.health < 30
            DO ATTACK
          }
          
          RULE "Block when low health" {
            WHEN self.health < 20
            DO BLOCK
          }
          
          RULE "Retreat when damaged" {
            WHEN self.health < 50
            DO RETREAT
          }
          
          DEFAULT APPROACH
        }
      `;

      const result = parseCode(code);
      
      expect(result.success).toBe(true);
      expect(result.strategy).toBeDefined();
      expect(result.strategy!.rules).toHaveLength(3);
      expect(result.strategy!.rules[0].name).toBe('Attack low health enemy');
      expect(result.strategy!.rules[1].name).toBe('Block when low health');
      expect(result.strategy!.rules[2].name).toBe('Retreat when damaged');
    });

    it('should parse conditions with AND logic', () => {
      const code = `
        STRATEGY ComboBot {
          RULE "Perfect strike" {
            WHEN enemy.health < 30
             AND distance < 3
             AND self.attackCooldown == 0
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions).toHaveLength(3);
      expect(result.strategy!.rules[0].conditionGroup.operators).toEqual(['AND', 'AND']);
    });

    it('should parse conditions with OR logic', () => {
      const code = `
        STRATEGY DefensiveBot {
          RULE "Block when threatened" {
            WHEN self.health < 20
             OR enemy.attackCooldown == 0
            DO BLOCK
          }
          DEFAULT APPROACH
        }
      `;

      const result = parseCode(code);
      
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions).toHaveLength(2);
      expect(result.strategy!.rules[0].conditionGroup.operators).toEqual(['OR']);
    });

    it('should parse conditions with mixed AND/OR logic', () => {
      const code = `
        STRATEGY MixedBot {
          RULE "Complex rule" {
            WHEN self.health < 30
             AND enemy.health > 50
             OR distance < 2
            DO RETREAT
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions).toHaveLength(3);
      expect(result.strategy!.rules[0].conditionGroup.operators).toEqual(['AND', 'OR']);
    });
  });

  describe('All operators', () => {
    it('should parse less than operator', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance < 5
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].operator).toBe('<');
    });

    it('should parse greater than operator', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance > 5
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].operator).toBe('>');
    });

    it('should parse less than or equal operator', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance <= 5
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].operator).toBe('<=');
    });

    it('should parse greater than or equal operator', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance >= 5
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].operator).toBe('>=');
    });

    it('should parse equality operator', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN self.attackCooldown == 0
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].operator).toBe('==');
    });

    it('should parse inequality operator', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN self.attackCooldown != 0
            DO BLOCK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].operator).toBe('!=');
    });
  });

  describe('All fields', () => {
    it('should parse enemy.health field', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN enemy.health < 50
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].field).toBe('enemy.health');
    });

    it('should parse enemy.attackCooldown field', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN enemy.attackCooldown > 0
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].field).toBe('enemy.attackCooldown');
    });

    it('should parse self.health field', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN self.health < 30
            DO RETREAT
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].field).toBe('self.health');
    });

    it('should parse self.attackCooldown field', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN self.attackCooldown == 0
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].field).toBe('self.attackCooldown');
    });

    it('should parse distance field', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance < 5
            DO APPROACH
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].field).toBe('distance');
    });
  });

  describe('All actions', () => {
    const actions: Array<'ATTACK' | 'BLOCK' | 'APPROACH' | 'RETREAT' | 'IDLE'> = [
      'ATTACK',
      'BLOCK',
      'APPROACH',
      'RETREAT',
      'IDLE',
    ];

    actions.forEach((action) => {
      it(`should parse ${action} action`, () => {
        const code = `
          STRATEGY TestBot {
            RULE "Test" {
              WHEN distance < 5
              DO ${action}
            }
            DEFAULT IDLE
          }
        `;

        const result = parseCode(code);
        expect(result.success).toBe(true);
        expect(result.strategy!.rules[0].action).toBe(action);
      });
    });
  });

  describe('Error handling', () => {
    it('should report missing STRATEGY declaration', () => {
      const code = `
        RULE "Test" {
          WHEN distance < 5
          DO ATTACK
        }
        DEFAULT IDLE
      `;

      const result = parseCode(code);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing STRATEGY declaration');
    });

    it('should report missing DEFAULT action', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance < 5
            DO ATTACK
          }
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing DEFAULT action');
    });

    it('should report missing WHEN clause', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should report missing DO clause', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance < 5
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should report invalid condition syntax', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN invalid condition here
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Comments and whitespace', () => {
    it('should handle single-line comments', () => {
      const code = `
        // This is a comment
        STRATEGY TestBot {
          // Another comment
          RULE "Test" {
            WHEN distance < 5 // inline comment
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
    });

    it('should handle multi-line comments', () => {
      const code = `
        /* Multi-line
           comment here */
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance < 5
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
    });

    it('should handle extra whitespace', () => {
      const code = `
        STRATEGY    TestBot    {
          RULE    "Test"    {
            WHEN    distance    <    5
            DO    ATTACK
          }
          DEFAULT    IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
    });
  });

  describe('Complex examples', () => {
    it('should parse a complete beginner strategy', () => {
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

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules).toHaveLength(3);
    });

    it('should parse an advanced strategy', () => {
      const code = `
        STRATEGY AdvancedBot {
          RULE "Aggressive finish" {
            WHEN enemy.health < 30
             AND self.attackCooldown == 0
             AND distance < 3
            DO ATTACK
          }
          
          RULE "Defensive block" {
            WHEN self.health < 20
             OR enemy.attackCooldown == 0
             AND distance < 3
            DO BLOCK
          }
          
          RULE "Kite enemy" {
            WHEN self.health < 40
             AND distance < 4
            DO RETREAT
          }
          
          RULE "Close distance" {
            WHEN distance > 6
            DO APPROACH
          }
          
          RULE "Ready to attack" {
            WHEN self.attackCooldown == 0
             AND distance < 4
            DO ATTACK
          }
          
          DEFAULT APPROACH
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules).toHaveLength(5);
    });
  });

  describe('Decimal values', () => {
    it('should parse decimal values in conditions', () => {
      const code = `
        STRATEGY TestBot {
          RULE "Test" {
            WHEN distance < 2.5
            DO ATTACK
          }
          DEFAULT IDLE
        }
      `;

      const result = parseCode(code);
      expect(result.success).toBe(true);
      expect(result.strategy!.rules[0].conditionGroup.conditions[0].value).toBe(2.5);
    });
  });
});
