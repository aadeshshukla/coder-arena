# CASL Language Engine

The **CASL (Coder Arena Strategy Language) Engine** is a complete implementation of a custom domain-specific language for programming fighter AI in Coder Arena. It provides parsing, validation, and execution capabilities with a focus on safety, simplicity, and performance.

## Quick Start

```typescript
import { parseCode, validateStrategy, executeStrategy } from './casl';
import { ExecutionContext } from '../../../shared/types/casl';

// 1. Parse CASL code
const code = `
  STRATEGY MyBot {
    RULE "Attack when close" {
      WHEN distance < 3 AND self.attackCooldown == 0
      DO ATTACK
    }
    DEFAULT APPROACH
  }
`;

const parseResult = parseCode(code);

// 2. Validate the strategy
const validationResult = validateStrategy(parseResult.strategy!);

// 3. Execute in combat
const context: ExecutionContext = {
  enemy: { health: 80, attackCooldown: 1 },
  self: { health: 100, attackCooldown: 0 },
  distance: 2
};

const action = executeStrategy(parseResult.strategy!, context);
// action === 'ATTACK'
```

## Features

- ✅ **100% Safe** - No infinite loops, no crashes, guaranteed termination
- ✅ **Beginner-Friendly** - Simple, readable syntax inspired by natural language
- ✅ **Well-Tested** - 94 tests with 92-97% code coverage
- ✅ **Fast** - Executes in < 1ms per strategy evaluation
- ✅ **Comprehensive** - Full documentation and 7 example strategies

## Components

### CASLParser
Parses CASL code text into structured AST:
- Extracts STRATEGY name
- Parses RULE blocks with names
- Handles WHEN conditions with AND/OR logic
- Extracts DO actions and DEFAULT action
- Provides clear error messages

```typescript
import { parseCode } from './CASLParser';

const result = parseCode(caslCode);
if (result.success) {
  console.log(result.strategy);
} else {
  console.error(result.errors);
}
```

### CASLValidator
Validates parsed strategies for correctness:
- Verifies field names are valid
- Checks operators are supported
- Validates actions exist
- Enforces limits (10 rules max, 5 conditions per rule max)
- Returns detailed errors and warnings

```typescript
import { validateStrategy } from './CASLValidator';

const validation = validateStrategy(strategy);
if (validation.valid) {
  console.log('Strategy is valid!');
} else {
  console.error(validation.errors);
}
```

### CASLExecutor
Executes strategies during combat:
- Evaluates rules in priority order (top to bottom)
- Handles complex AND/OR logic correctly
- Returns action from first matching rule
- Falls back to DEFAULT if no rules match
- Optimized for performance (< 1ms execution)

```typescript
import { executeStrategy } from './CASLExecutor';

const action = executeStrategy(strategy, gameContext);
// Returns: 'ATTACK' | 'BLOCK' | 'APPROACH' | 'RETREAT' | 'IDLE'
```

## Language Syntax

### Basic Structure
```javascript
STRATEGY BotName {
  RULE "Rule Name" {
    WHEN conditions
    DO ACTION
  }
  
  DEFAULT ACTION
}
```

### Available Components

**Fields:**
- `enemy.health` (0-100)
- `enemy.attackCooldown` (0-3)
- `self.health` (0-100)
- `self.attackCooldown` (0-3)
- `distance` (0-10)

**Operators:**
- `<`, `>`, `<=`, `>=`, `==`, `!=`

**Actions:**
- `ATTACK` - Attack the enemy
- `BLOCK` - Block incoming damage
- `APPROACH` - Move closer
- `RETREAT` - Move away
- `IDLE` - Do nothing

**Logical Operators:**
- `AND` - All conditions must be true
- `OR` - At least one condition must be true

### Example Strategy

```javascript
STRATEGY BeginnerBot {
  RULE "Finish weak enemy" {
    WHEN enemy.health < 20
     AND distance < 3
    DO ATTACK
  }
  
  RULE "Block when low" {
    WHEN self.health < 30
    DO BLOCK
  }
  
  RULE "Approach if far" {
    WHEN distance > 5
    DO APPROACH
  }
  
  DEFAULT IDLE
}
```

## Documentation

- **[CASL_LANGUAGE.md](../../../../docs/CASL_LANGUAGE.md)** - Complete language reference
- **[CASL_EXAMPLES.md](../../../../docs/CASL_EXAMPLES.md)** - 7 example strategies with different styles

## Running the Demo

```bash
# Run the interactive demo
npx ts-node server/src/engine/casl/demo.ts
```

This will parse, validate, and execute a sample strategy against multiple combat scenarios.

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **CASLParser**: 95.89% coverage
- **CASLValidator**: 97.33% coverage
- **CASLExecutor**: 92.50% coverage
- **Total**: 94 tests, all passing

## Design Principles

1. **Safety First** - No way to create infinite loops or crash the system
2. **Simplicity** - Easy to learn, even for beginners
3. **Performance** - Fast enough for real-time combat (< 1ms per execution)
4. **Clarity** - Clear error messages and validation warnings
5. **Predictability** - Deterministic behavior, rules evaluated top-to-bottom

## Limitations

To ensure safety and performance:
- Maximum 10 rules per strategy
- Maximum 5 conditions per rule
- No loops or recursion
- No variables or state persistence
- No function calls or external dependencies

## Future Enhancements

Potential additions for future versions:
- [ ] Rule priority/weight system
- [ ] Nested condition groups with parentheses
- [ ] Additional fields (enemy position, arena bounds)
- [ ] Custom actions with parameters
- [ ] Strategy composition/inheritance
- [ ] Visual strategy editor
- [ ] Strategy marketplace

## Contributing

When adding features to CASL:
1. Maintain 80%+ test coverage
2. Update documentation
3. Add example strategies
4. Ensure backward compatibility
5. Keep execution time < 1ms

## License

Part of the Coder Arena project. See root LICENSE file.
