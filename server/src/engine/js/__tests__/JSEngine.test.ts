import { JSExecutor, JSGameState } from '../JSExecutor';
import { JSValidator } from '../JSValidator';

const defaultState: JSGameState = {
  distance: 5,
  health: 100,
  opponentHealth: 100,
  position: { x: 0, y: 0 },
  opponentPosition: { x: 10, y: 0 },
  tick: 0
};

describe('JSExecutor', () => {
  describe('Basic execution', () => {
    it('should return ATTACK when fighter attacks', () => {
      const code = `
class Fighter {
  execute() {
    return this.attack();
  }
}`;
      const executor = new JSExecutor(code);
      const action = executor.execute({ ...defaultState, distance: 2 });
      expect(action).toBe('ATTACK');
    });

    it('should return BLOCK when fighter blocks', () => {
      const code = `
class Fighter {
  execute() {
    return this.block();
  }
}`;
      const executor = new JSExecutor(code);
      const action = executor.execute(defaultState);
      expect(action).toBe('BLOCK');
    });

    it('should return APPROACH when moveTowards enemy', () => {
      const code = `
class Fighter {
  execute() {
    return this.moveTowards('enemy');
  }
}`;
      const executor = new JSExecutor(code);
      const action = executor.execute(defaultState);
      expect(action).toBe('APPROACH');
    });

    it('should return IDLE on wait()', () => {
      const code = `
class Fighter {
  execute() {
    return this.wait();
  }
}`;
      const executor = new JSExecutor(code);
      const action = executor.execute(defaultState);
      expect(action).toBe('IDLE');
    });

    it('should use game state properties in logic', () => {
      const code = `
class Fighter {
  execute() {
    if (this.distance < 3) {
      return this.attack();
    }
    return this.moveTowards('enemy');
  }
}`;
      const executor = new JSExecutor(code);
      expect(executor.execute({ ...defaultState, distance: 2 })).toBe('ATTACK');
      expect(executor.execute({ ...defaultState, distance: 5 })).toBe('APPROACH');
    });

    it('should return IDLE on error (timeout, etc.)', () => {
      // Syntax error in code
      const code = `class Fighter { execute() { return invalid syntax !!! }`;
      const executor = new JSExecutor(code);
      expect(executor.execute(defaultState)).toBe('IDLE');
    });

    it('should enforce timeout on infinite loops', () => {
      const code = `
class Fighter {
  execute() {
    while(true) {}
    return this.attack();
  }
}`;
      const executor = new JSExecutor(code);
      const start = Date.now();
      const action = executor.execute(defaultState);
      const elapsed = Date.now() - start;
      expect(action).toBe('IDLE');
      expect(elapsed).toBeLessThan(500); // should timeout well under 500ms
    });
  });
});

describe('JSValidator', () => {
  describe('Valid code', () => {
    it('should accept valid Fighter class', () => {
      const code = `
class Fighter {
  execute() {
    return 'ATTACK';
  }
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Forbidden patterns', () => {
    it('should reject code using eval()', () => {
      const code = `
class Fighter {
  execute() {
    eval('1+1');
    return 'ATTACK';
  }
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('eval'))).toBe(true);
    });

    it('should reject code using process', () => {
      const code = `
class Fighter {
  execute() {
    process.exit(0);
    return 'ATTACK';
  }
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('process'))).toBe(true);
    });

    it('should reject code using require()', () => {
      const code = `
class Fighter {
  execute() {
    require('fs');
    return 'ATTACK';
  }
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('require'))).toBe(true);
    });

    it('should reject code using setTimeout()', () => {
      const code = `
class Fighter {
  execute() {
    setTimeout(() => {}, 0);
    return 'ATTACK';
  }
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('setTimeout'))).toBe(true);
    });
  });

  describe('Syntax errors', () => {
    it('should reject code with syntax errors', () => {
      const code = `class Fighter { execute() { return invalid syntax !!! }`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Syntax error'))).toBe(true);
    });
  });

  describe('Structure validation', () => {
    it('should reject code missing Fighter class', () => {
      const code = `
function myFunc() {
  return 'ATTACK';
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Fighter'))).toBe(true);
    });

    it('should reject code missing execute() method', () => {
      const code = `
class Fighter {
  run() {
    return 'ATTACK';
  }
}`;
      const validator = new JSValidator();
      const result = validator.validate(code);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('execute'))).toBe(true);
    });
  });
});
