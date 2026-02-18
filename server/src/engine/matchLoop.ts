/**
 * LEGACY/DEMO CODE - NOT USED IN PRODUCTION
 * 
 * This file contains the original POC auto-simulation code.
 * It is kept for reference and testing purposes only.
 * 
 * The production match system now uses:
 * - Match class (core/Match.ts) for match lifecycle
 * - MatchManager (managers/MatchManager.ts) for match coordination
 * - Event-driven architecture triggered by player actions
 * 
 * DO NOT call runMatch() from index.ts or any production code.
 */

import { Rule } from '../../../shared/types/rules';
import { Fighter, MatchState, ExtendedRule } from './types';
import { evaluateRules } from './ruleEngine';
import { simulateTick } from './simulator';
import { getDefaultRules } from './defaultBehavior';
import { broadcastMatchState } from '../network/socketServer';

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
 * Returns a promise that resolves when the match ends
 */
function runSingleMatch(rulesA: (Rule | ExtendedRule)[], rulesB: (Rule | ExtendedRule)[]): Promise<void> {
  return new Promise((resolve) => {
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
      
      // Broadcast state to connected clients
      broadcastMatchState(state);
      
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
        let winner: string = 'Draw';
        if (state.fighterA.health > 0 && state.fighterB.health <= 0) {
          winner = 'Fighter A';
          console.log(`Winner: Fighter A with ${state.fighterA.health.toFixed(1)} health remaining`);
        } else if (state.fighterB.health > 0 && state.fighterA.health <= 0) {
          winner = 'Fighter B';
          console.log(`Winner: Fighter B with ${state.fighterB.health.toFixed(1)} health remaining`);
        } else {
          console.log('Draw: Both fighters defeated');
        }
        console.log(`Total ticks: ${state.tick}`);
        console.log('');
        
        // Broadcast final state with winner
        broadcastMatchState(state, winner);
        
        resolve();
      }
    }, TICK_INTERVAL_MS);
  });
}

/**
 * Start the continuous match loop
 * Runs matches forever, automatically restarting after each match
 */
export async function runMatch(): Promise<void> {
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
  
  // Run matches continuously
  while (true) {
    await runSingleMatch(rulesA, rulesB);
    // Wait 2 seconds before starting next match
    await new Promise(resolve => setTimeout(resolve, RESTART_DELAY_MS));
  }
}

