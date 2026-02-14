import { Rule } from '../../../shared/types/rules';
import { Fighter, MatchState, ExtendedRule } from './types';
import { evaluateRules } from './ruleEngine';
import { simulateTick } from './simulator';
import { getDefaultRules } from './defaultBehavior';

// Match configuration
const TICK_INTERVAL_MS = 100;
const RESTART_DELAY_MS = 2000;

/**
 * Create a new fighter with initial state
 */
function createFighter(x: number, y: number): Fighter {
  return {
    health: 100,
    maxHealth: 100,
    position: { x, y },
    blocking: false,
    attacking: false,
    attackCooldown: 0,
    lastAction: 'IDLE'
  };
}

/**
 * Run a single match between two fighters
 */
function runSingleMatch(rulesA: (Rule | ExtendedRule)[], rulesB: (Rule | ExtendedRule)[]): void {
  // Initialize match state
  const state: MatchState = {
    fighterA: createFighter(0, 0),
    fighterB: createFighter(10, 0),
    tick: 0
  };
  
  console.log('=== Match Start ===');
  console.log(`Fighter A: Health=${state.fighterA.health}, Position=(${state.fighterA.position.x}, ${state.fighterA.position.y})`);
  console.log(`Fighter B: Health=${state.fighterB.health}, Position=(${state.fighterB.position.x}, ${state.fighterB.position.y})`);
  console.log('');
  
  // Match loop - run until one fighter is defeated
  const matchInterval = setInterval(() => {
    // Evaluate actions for both fighters
    const actionA = evaluateRules(rulesA, state.fighterA, state.fighterB);
    const actionB = evaluateRules(rulesB, state.fighterB, state.fighterA);
    
    // Simulate the tick
    simulateTick(state, actionA, actionB);
    
    // Log current state
    console.log(`Tick ${state.tick}:`);
    console.log(`  ${actionA.padEnd(8)} | ${state.fighterA.health.toFixed(1).padStart(5)}`);
    console.log(`  ${actionB.padEnd(8)} | ${state.fighterB.health.toFixed(1).padStart(5)}`);
    console.log('');
    
    // Check for match end
    if (state.fighterA.health <= 0 || state.fighterB.health <= 0) {
      clearInterval(matchInterval);
      
      // Determine winner
      console.log('=== Match End ===');
      if (state.fighterA.health > 0 && state.fighterB.health <= 0) {
        console.log(`Winner: Fighter A with ${state.fighterA.health.toFixed(1)} health remaining`);
      } else if (state.fighterB.health > 0 && state.fighterA.health <= 0) {
        console.log(`Winner: Fighter B with ${state.fighterB.health.toFixed(1)} health remaining`);
      } else {
        console.log('Draw: Both fighters defeated');
      }
      console.log(`Total ticks: ${state.tick}`);
      console.log('');
      
      // Wait 2 seconds and start a new match
      setTimeout(() => {
        runSingleMatch(rulesA, rulesB);
      }, RESTART_DELAY_MS);
    }
  }, TICK_INTERVAL_MS);
}

/**
 * Start the continuous match loop
 * Runs matches forever, automatically restarting after each match
 */
export function runMatch(): void {
  // Define rules for fighterA - defensive strategy
  const rulesA: Rule[] = [
    {
      condition: { type: 'ENEMY_HEALTH_LESS_THAN', value: 40 },
      action: 'ATTACK'
    },
    {
      condition: { type: 'DISTANCE_LESS_THAN', value: 2.5 },
      action: 'BLOCK'
    },
    {
      condition: { type: 'DISTANCE_GREATER_THAN', value: 2.5 },
      action: 'APPROACH'
    }
  ];
  
  // Define rules for fighterB - aggressive strategy
  const rulesB: Rule[] = [
    {
      condition: { type: 'DISTANCE_LESS_THAN', value: 3 },
      action: 'ATTACK'
    },
    {
      condition: { type: 'ENEMY_HEALTH_LESS_THAN', value: 30 },
      action: 'ATTACK'
    },
    {
      condition: { type: 'DISTANCE_GREATER_THAN', value: 3 },
      action: 'APPROACH'
    }
  ];
  
  // Start the first match
  runSingleMatch(rulesA, rulesB);
}

