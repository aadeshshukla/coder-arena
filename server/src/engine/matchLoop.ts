import { Fighter, GameState } from '../../../shared/types/gameState';
import { ActionType } from '../../../shared/types/actions';
import { Rule } from '../../../shared/types/rules';

// Game balance constants
const BASE_DAMAGE = 10;
const BLOCK_DAMAGE_MULTIPLIER = 0.5;
const ATTACK_RANGE = 2;

function createFighter(x: number, y: number): Fighter {
  return {
    health: 100,
    maxHealth: 100,
    position: { x, y },
    blocking: false,
    attacking: false
  };
}

function calculateDistance(fighterA: Fighter, fighterB: Fighter): number {
  const dx = fighterA.position.x - fighterB.position.x;
  const dy = fighterA.position.y - fighterB.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function evaluateRule(rule: Rule, fighter: Fighter, opponent: Fighter): boolean {
  const distance = calculateDistance(fighter, opponent);
  
  switch (rule.condition.type) {
    case 'ENEMY_HEALTH_LESS_THAN':
      return opponent.health < rule.condition.value;
    case 'ENEMY_HEALTH_GREATER_THAN':
      return opponent.health > rule.condition.value;
    case 'DISTANCE_LESS_THAN':
      return distance < rule.condition.value;
    case 'DISTANCE_GREATER_THAN':
      return distance > rule.condition.value;
    default:
      return false;
  }
}

function chooseAction(rules: Rule[], fighter: Fighter, opponent: Fighter): ActionType {
  for (const rule of rules) {
    if (evaluateRule(rule, fighter, opponent)) {
      return rule.action;
    }
  }
  return 'IDLE';
}

function applyMovement(fighter: Fighter, opponent: Fighter, moveToward: boolean): void {
  if (moveToward) {
    // Move toward opponent (APPROACH)
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
  } else {
    // Move away from opponent (RETREAT)
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
}

export function runMatch(): void {
  // Initialize fighters
  const fighterA = createFighter(0, 0);
  const fighterB = createFighter(10, 0);
  
  // Define rules for fighterA - more defensive strategy
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
  
  // Define rules for fighterB - more aggressive strategy
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
  
  let tick = 0;
  const maxTicks = 1000; // Safety limit to prevent infinite loops
  
  console.log('=== Match Start ===');
  console.log(`Fighter A: Health=${fighterA.health}, Position=(${fighterA.position.x}, ${fighterA.position.y})`);
  console.log(`Fighter B: Health=${fighterB.health}, Position=(${fighterB.position.x}, ${fighterB.position.y})`);
  console.log('');
  
  // Simulation loop
  while (fighterA.health > 0 && fighterB.health > 0 && tick < maxTicks) {
    tick++;
    
    // Choose actions for both fighters BEFORE applying them
    const actionA = chooseAction(rulesA, fighterA, fighterB);
    const actionB = chooseAction(rulesB, fighterB, fighterA);
    
    // Apply actions in order - but attacks happen simultaneously
    // Store damage to apply
    let damageToA = 0;
    let damageToB = 0;
    
    // Process attacks first to calculate damage
    const distance = calculateDistance(fighterA, fighterB);
    
    if (actionA === 'ATTACK' && distance <= ATTACK_RANGE) {
      let damage = BASE_DAMAGE;
      if (actionB === 'BLOCK') {
        damage = damage * BLOCK_DAMAGE_MULTIPLIER;
      }
      damageToB = damage;
      fighterA.attacking = true;
      fighterA.blocking = false;
    } else if (actionA === 'BLOCK') {
      fighterA.blocking = true;
      fighterA.attacking = false;
    } else {
      fighterA.attacking = false;
      fighterA.blocking = false;
    }
    
    if (actionB === 'ATTACK' && distance <= ATTACK_RANGE) {
      let damage = BASE_DAMAGE;
      if (actionA === 'BLOCK') {
        damage = damage * BLOCK_DAMAGE_MULTIPLIER;
      }
      damageToA = damage;
      fighterB.attacking = true;
      fighterB.blocking = false;
    } else if (actionB === 'BLOCK') {
      fighterB.blocking = true;
      fighterB.attacking = false;
    } else {
      fighterB.attacking = false;
      fighterB.blocking = false;
    }
    
    // Apply damage
    fighterA.health -= damageToA;
    fighterB.health -= damageToB;
    
    // Then apply movement
    if (actionA === 'APPROACH') {
      applyMovement(fighterA, fighterB, true);
    } else if (actionA === 'RETREAT') {
      applyMovement(fighterA, fighterB, false);
    }
    
    if (actionB === 'APPROACH') {
      applyMovement(fighterB, fighterA, true);
    } else if (actionB === 'RETREAT') {
      applyMovement(fighterB, fighterA, false);
    }
    
    // Log every 10 ticks to avoid spam
    if (tick % 10 === 0 || fighterA.health <= 0 || fighterB.health <= 0) {
      console.log(`Tick ${tick}:`);
      console.log(`  Fighter A: ${actionA} | Health=${fighterA.health.toFixed(1)} | Position=(${fighterA.position.x}, ${fighterA.position.y})`);
      console.log(`  Fighter B: ${actionB} | Health=${fighterB.health.toFixed(1)} | Position=(${fighterB.position.x}, ${fighterB.position.y})`);
      console.log('');
    }
  }
  
  // Determine winner
  console.log('=== Match End ===');
  if (fighterA.health > 0 && fighterB.health <= 0) {
    console.log(`Winner: Fighter A with ${fighterA.health.toFixed(1)} health remaining`);
  } else if (fighterB.health > 0 && fighterA.health <= 0) {
    console.log(`Winner: Fighter B with ${fighterB.health.toFixed(1)} health remaining`);
  } else if (fighterA.health <= 0 && fighterB.health <= 0) {
    console.log('Draw: Both fighters defeated');
  } else {
    console.log('Match reached maximum ticks');
  }
  console.log(`Total ticks: ${tick}`);
}
