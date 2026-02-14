import { ActionType } from '../../../shared/types/actions';
import { Fighter, MatchState } from './types';
import { calculateDistance } from './ruleEngine';

// Game balance constants
const BASE_DAMAGE = 10;
const BLOCK_DAMAGE_REDUCTION = 0.5; // Block reduces damage by 50%
const ATTACK_RANGE = 2;
const ATTACK_COOLDOWN_TICKS = 3;

/**
 * Apply movement to a fighter based on their action
 * APPROACH: move fighter toward opponent by 1 unit
 * RETREAT: move fighter away by 1 unit
 */
function applyMovement(fighter: Fighter, opponent: Fighter, action: ActionType): void {
  if (action === 'APPROACH') {
    // Move toward opponent by 1 unit
    if (fighter.position.x < opponent.position.x) {
      fighter.position.x += 1;
    } else if (fighter.position.x > opponent.position.x) {
      fighter.position.x -= 1;
    }
    if (fighter.position.y < opponent.position.y) {
      fighter.position.y += 1;
    } else if (fighter.position.y > opponent.position.y) {
      fighter.position.y -= 1;
    }
  } else if (action === 'RETREAT') {
    // Move away from opponent by 1 unit
    if (fighter.position.x < opponent.position.x) {
      fighter.position.x -= 1;
    } else if (fighter.position.x > opponent.position.x) {
      fighter.position.x += 1;
    }
    if (fighter.position.y < opponent.position.y) {
      fighter.position.y -= 1;
    } else if (fighter.position.y > opponent.position.y) {
      fighter.position.y += 1;
    }
  }
  // IDLE, ATTACK, BLOCK: no movement
}

/**
 * Resolve actions chosen by both fighters and update MatchState.
 * 
 * Action resolution:
 * - APPROACH: move fighter toward opponent by 1 unit
 * - RETREAT: move fighter away by 1 unit
 * - ATTACK: If distance < 2 AND attackCooldown == 0:
 *           deal 10 damage, set attackCooldown to 3 ticks
 * - BLOCK: Reduce incoming attack damage by 50%
 * - IDLE: no movement
 * 
 * Cooldowns decrease by 1 each tick (minimum 0).
 * 
 * Updates: health, position, cooldowns, lastAction, blocking/attacking flags
 */
export function simulateTick(state: MatchState, actionA: ActionType, actionB: ActionType): MatchState {
  const { fighterA, fighterB } = state;
  
  // Calculate current distance
  const distance = calculateDistance(fighterA, fighterB);
  
  // Reset flags
  fighterA.attacking = false;
  fighterA.blocking = false;
  fighterB.attacking = false;
  fighterB.blocking = false;
  
  // Determine damage to be dealt
  let damageToA = 0;
  let damageToB = 0;
  
  // Process Fighter A's action
  if (actionA === 'ATTACK' && distance <= ATTACK_RANGE && fighterA.attackCooldown === 0) {
    // Fighter A can attack
    let damage = BASE_DAMAGE;
    if (actionB === 'BLOCK') {
      damage = damage * BLOCK_DAMAGE_REDUCTION;
    }
    damageToB = damage;
    fighterA.attacking = true;
    fighterA.attackCooldown = ATTACK_COOLDOWN_TICKS;
  } else if (actionA === 'BLOCK') {
    fighterA.blocking = true;
  }
  
  // Process Fighter B's action
  if (actionB === 'ATTACK' && distance <= ATTACK_RANGE && fighterB.attackCooldown === 0) {
    // Fighter B can attack
    let damage = BASE_DAMAGE;
    if (actionA === 'BLOCK') {
      damage = damage * BLOCK_DAMAGE_REDUCTION;
    }
    damageToA = damage;
    fighterB.attacking = true;
    fighterB.attackCooldown = ATTACK_COOLDOWN_TICKS;
  } else if (actionB === 'BLOCK') {
    fighterB.blocking = true;
  }
  
  // Apply damage
  fighterA.health -= damageToA;
  fighterB.health -= damageToB;
  
  // Apply movement
  applyMovement(fighterA, fighterB, actionA);
  applyMovement(fighterB, fighterA, actionB);
  
  // Decrease cooldowns (minimum 0)
  if (fighterA.attackCooldown > 0) {
    fighterA.attackCooldown--;
  }
  if (fighterB.attackCooldown > 0) {
    fighterB.attackCooldown--;
  }
  
  // Update last actions
  fighterA.lastAction = actionA;
  fighterB.lastAction = actionB;
  
  // Increment tick counter
  state.tick++;
  
  return state;
}
