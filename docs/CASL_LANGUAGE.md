# CASL Language Reference

CASL (Coder Arena Strategy Language) is a beginner-friendly domain-specific language for programming fighter AI in Coder Arena. It's designed to be 100% safe—no infinite loops, no crashes—just pure strategy.

## Table of Contents
- [Overview](#overview)
- [Basic Syntax](#basic-syntax)
- [Language Components](#language-components)
  - [STRATEGY](#strategy)
  - [RULE](#rule)
  - [WHEN Conditions](#when-conditions)
  - [DO Actions](#do-actions)
  - [DEFAULT Action](#default-action)
- [Available Fields](#available-fields)
- [Available Operators](#available-operators)
- [Available Actions](#available-actions)
- [Logical Operators](#logical-operators)
- [Rule Evaluation](#rule-evaluation)
- [Limitations](#limitations)
- [Best Practices](#best-practices)

## Overview

CASL allows you to define a **strategy** consisting of multiple **rules**. Each rule has:
- A **name** (for debugging and readability)
- **Conditions** that determine when the rule applies
- An **action** to perform when conditions are met

Rules are evaluated top-to-bottom, and the first rule whose conditions are met will execute. If no rules match, the **DEFAULT** action is used.

## Basic Syntax

```javascript
STRATEGY BotName {
  RULE "Rule Name" {
    WHEN condition
    DO ACTION
  }
  
  DEFAULT ACTION
}
```

## Language Components

### STRATEGY

Every CASL program starts with a `STRATEGY` declaration followed by a name and opening brace:

```javascript
STRATEGY MyBot {
  // Rules go here
}
```

**Requirements:**
- Strategy name must be alphanumeric (letters, numbers, underscores)
- Strategy name should be descriptive

### RULE

Rules define specific behaviors under certain conditions:

```javascript
RULE "Descriptive name" {
  WHEN conditions
  DO ACTION
}
```

**Requirements:**
- Rule name must be enclosed in double quotes
- Rule name cannot be empty
- Maximum 10 rules per strategy

### WHEN Conditions

Conditions determine when a rule applies. A condition compares a field to a value:

```javascript
WHEN enemy.health < 30
```

Multiple conditions can be combined with AND/OR:

```javascript
WHEN enemy.health < 30
 AND distance < 3
 AND self.attackCooldown == 0
```

**Requirements:**
- At least one condition required per rule
- Maximum 5 conditions per rule
- Conditions must follow the format: `field operator value`

### DO Actions

The `DO` keyword specifies what action to perform:

```javascript
DO ATTACK
```

### DEFAULT Action

The `DEFAULT` keyword specifies the fallback action when no rules match:

```javascript
DEFAULT APPROACH
```

**Requirements:**
- Every strategy must have a DEFAULT action
- DEFAULT must appear after all rules

## Available Fields

### Enemy Fields
- `enemy.health` - Enemy's health (0-100)
- `enemy.attackCooldown` - Enemy's attack cooldown (0-3)

### Self Fields
- `self.health` - Your health (0-100)
- `self.attackCooldown` - Your attack cooldown (0-3)

### Distance
- `distance` - Distance to enemy (0-10)

## Available Operators

| Operator | Meaning |
|----------|---------|
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal to |
| `>=` | Greater than or equal to |
| `==` | Equal to |
| `!=` | Not equal to |

## Available Actions

| Action | Description |
|--------|-------------|
| `ATTACK` | Attack the enemy (deals damage if in range) |
| `BLOCK` | Block incoming attacks (reduces damage taken) |
| `APPROACH` | Move closer to the enemy |
| `RETREAT` | Move away from the enemy |
| `IDLE` | Do nothing (stand still) |

## Logical Operators

Combine multiple conditions using logical operators:

### AND
All conditions must be true:
```javascript
WHEN enemy.health < 30
 AND distance < 3
DO ATTACK
```

### OR
At least one condition must be true:
```javascript
WHEN self.health < 20
 OR enemy.attackCooldown == 0
DO BLOCK
```

### Mixed AND/OR
Conditions are evaluated left to right:
```javascript
WHEN self.health < 30
 AND enemy.health > 50
 OR distance < 2
DO RETREAT
```
This evaluates as: `((self.health < 30) AND (enemy.health > 50)) OR (distance < 2)`

## Rule Evaluation

Rules are evaluated in **priority order** from top to bottom:

1. First rule is checked
2. If all conditions are met → execute its action
3. If conditions aren't met → check next rule
4. If no rules match → use DEFAULT action

**Example:**
```javascript
STRATEGY PriorityBot {
  RULE "High priority" {
    WHEN distance < 3
    DO ATTACK
  }
  
  RULE "Lower priority" {
    WHEN distance < 10
    DO APPROACH
  }
  
  DEFAULT IDLE
}
```
If distance is 2, the first rule matches and `ATTACK` is executed. The second rule is never checked.

## Limitations

To ensure safety and performance:

- **Maximum 10 rules** per strategy
- **Maximum 5 conditions** per rule
- No loops or recursion
- No variables or state
- Execution must complete in < 1ms

## Best Practices

### 1. Order rules by specificity
Put more specific rules first:
```javascript
// ✓ Good - specific first
RULE "Finish weak enemy close" {
  WHEN enemy.health < 20 AND distance < 3
  DO ATTACK
}

RULE "General approach" {
  WHEN distance > 5
  DO APPROACH
}
```

### 2. Use descriptive rule names
```javascript
// ✓ Good
RULE "Block when low health and enemy ready"

// ✗ Bad
RULE "Rule 1"
```

### 3. Consider attack cooldown
```javascript
// ✓ Good - checks if attack is ready
WHEN self.attackCooldown == 0 AND distance < 3
DO ATTACK

// ✗ Bad - might try to attack on cooldown
WHEN distance < 3
DO ATTACK
```

### 4. Have a fallback strategy
Always set a sensible DEFAULT action:
```javascript
// ✓ Good - APPROACH keeps you engaged
DEFAULT APPROACH

// ✗ Bad - IDLE does nothing
DEFAULT IDLE
```

### 5. Balance offense and defense
Include both attacking and defensive rules:
```javascript
RULE "Attack when safe" {
  WHEN enemy.health < 30 AND self.health > 50
  DO ATTACK
}

RULE "Block when endangered" {
  WHEN self.health < 30
  DO BLOCK
}
```

### 6. Use comments
While CASL doesn't officially support comments in the language itself, you can use descriptive rule names to document your strategy:
```javascript
RULE "Aggressive finish: low enemy health, close range, attack ready" {
  WHEN enemy.health < 30
   AND distance < 3
   AND self.attackCooldown == 0
  DO ATTACK
}
```

## Common Patterns

### Aggressive Strategy
Focus on attacking:
```javascript
RULE "Finish weak enemy" {
  WHEN enemy.health < 30 AND distance < 4
  DO ATTACK
}

RULE "Close distance" {
  WHEN distance > 3
  DO APPROACH
}

DEFAULT ATTACK
```

### Defensive Strategy
Prioritize survival:
```javascript
RULE "Block when low" {
  WHEN self.health < 40
  DO BLOCK
}

RULE "Retreat when very low" {
  WHEN self.health < 20
  DO RETREAT
}

DEFAULT APPROACH
```

### Balanced Strategy
Mix offense and defense:
```javascript
RULE "Attack when ready and close" {
  WHEN self.attackCooldown == 0 AND distance < 3
  DO ATTACK
}

RULE "Block when enemy attacks" {
  WHEN enemy.attackCooldown == 0 AND distance < 4
  DO BLOCK
}

RULE "Approach when far" {
  WHEN distance > 5
  DO APPROACH
}

DEFAULT IDLE
```

## Debugging Tips

1. **Start simple** - Begin with 1-2 rules and add complexity gradually
2. **Test edge cases** - What happens when health is 0? When distance is 10?
3. **Watch rule order** - Remember, first matching rule wins
4. **Use the validator** - The CASL validator will catch syntax errors and provide helpful warnings

## Error Messages

The CASL system provides clear error messages:

- **"Missing STRATEGY declaration"** - You forgot to start with `STRATEGY Name {`
- **"Missing DEFAULT action"** - You forgot to add `DEFAULT ACTION` at the end
- **"Invalid field"** - You used a field that doesn't exist (check spelling)
- **"Invalid operator"** - You used an unsupported operator
- **"Too many rules"** - You exceeded the 10 rule limit
- **"Too many conditions"** - A rule has more than 5 conditions

## Next Steps

Ready to write your first bot? Check out [CASL_EXAMPLES.md](./CASL_EXAMPLES.md) for complete example strategies you can learn from and modify!
