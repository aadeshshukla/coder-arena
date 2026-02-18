#!/usr/bin/env ts-node
/**
 * CASL Demo Script
 * 
 * This script demonstrates how to use the CASL Language Engine
 * to parse, validate, and execute fighter strategies.
 */

import { parseCode } from './CASLParser';
import { validateStrategy } from './CASLValidator';
import { executeStrategy } from './CASLExecutor';
import { ExecutionContext } from '../../../../shared/types/casl';

// Example CASL code
const exampleStrategy = `
STRATEGY DemoBot {
  RULE "Aggressive finish" {
    WHEN enemy.health < 30
     AND self.attackCooldown == 0
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
`;

console.log('='.repeat(60));
console.log('CASL Language Engine Demo');
console.log('='.repeat(60));
console.log();

// Step 1: Parse the code
console.log('📝 Step 1: Parsing CASL code...');
console.log('-'.repeat(60));
const parseResult = parseCode(exampleStrategy);

if (parseResult.success) {
  console.log('✅ Parsing successful!');
  console.log(`   Strategy name: ${parseResult.strategy!.name}`);
  console.log(`   Number of rules: ${parseResult.strategy!.rules.length}`);
  console.log(`   Default action: ${parseResult.strategy!.defaultAction}`);
} else {
  console.log('❌ Parsing failed!');
  parseResult.errors.forEach(error => console.log(`   Error: ${error}`));
  process.exit(1);
}
console.log();

// Step 2: Validate the strategy
console.log('✔️  Step 2: Validating strategy...');
console.log('-'.repeat(60));
const validationResult = validateStrategy(parseResult.strategy!);

if (validationResult.valid) {
  console.log('✅ Validation successful!');
  if (validationResult.warnings.length > 0) {
    console.log('   Warnings:');
    validationResult.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  } else {
    console.log('   No warnings');
  }
} else {
  console.log('❌ Validation failed!');
  validationResult.errors.forEach(error => console.log(`   Error: ${error}`));
  process.exit(1);
}
console.log();

// Step 3: Execute the strategy in different scenarios
console.log('⚔️  Step 3: Executing strategy in combat scenarios...');
console.log('-'.repeat(60));

const scenarios = [
  {
    name: 'Finishing blow opportunity',
    context: {
      enemy: { health: 25, attackCooldown: 2 },
      self: { health: 80, attackCooldown: 0 },
      distance: 2,
    },
    expected: 'ATTACK'
  },
  {
    name: 'Low health defensive position',
    context: {
      enemy: { health: 90, attackCooldown: 0 },
      self: { health: 20, attackCooldown: 1 },
      distance: 3,
    },
    expected: 'BLOCK'
  },
  {
    name: 'Enemy far away',
    context: {
      enemy: { health: 80, attackCooldown: 1 },
      self: { health: 80, attackCooldown: 1 },
      distance: 7,
    },
    expected: 'APPROACH'
  },
  {
    name: 'Mid-range standoff',
    context: {
      enemy: { health: 80, attackCooldown: 1 },
      self: { health: 80, attackCooldown: 1 },
      distance: 4,
    },
    expected: 'IDLE'
  },
];

scenarios.forEach((scenario, index) => {
  const action = executeStrategy(parseResult.strategy!, scenario.context as ExecutionContext);
  const correct = action === scenario.expected;
  
  console.log(`\nScenario ${index + 1}: ${scenario.name}`);
  console.log(`   Enemy: HP=${scenario.context.enemy.health}, Cooldown=${scenario.context.enemy.attackCooldown}`);
  console.log(`   Self:  HP=${scenario.context.self.health}, Cooldown=${scenario.context.self.attackCooldown}`);
  console.log(`   Distance: ${scenario.context.distance}`);
  console.log(`   ${correct ? '✅' : '❌'} Action: ${action} ${correct ? '' : `(expected: ${scenario.expected})`}`);
});

console.log();
console.log('='.repeat(60));
console.log('Demo completed successfully! ✨');
console.log('='.repeat(60));
console.log();
console.log('Next steps:');
console.log('1. Check out docs/CASL_LANGUAGE.md for complete language reference');
console.log('2. Check out docs/CASL_EXAMPLES.md for more strategy examples');
console.log('3. Run tests with: npm test');
console.log();
