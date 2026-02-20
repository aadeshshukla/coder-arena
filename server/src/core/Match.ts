import { Player, PlayerStatus } from './Player';
import { MatchState, MatchData, BattleMatchState, FighterState, MatchEvent, MatchResults, CombatStats, Position } from '../../../shared/types/match';
import { ActionType } from '../../../shared/types/actions';

/**
 * Calculate Euclidean distance between two positions
 */
function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Battle constants
const TICK_INTERVAL_MS = 100;
const MAX_TICKS = 6000; // 10 minutes max
const BASE_DAMAGE = 10;
const BLOCK_DAMAGE_REDUCTION = 0.5;
const ATTACK_RANGE = 2;
const ATTACK_COOLDOWN_TICKS = 3;

export class Match {
  public id: string;
  public state: MatchState;
  public playerA: Player;
  public playerB: Player;
  public createdAt: number;
  
  // Battle state
  private battleInterval?: NodeJS.Timeout;
  private battleState?: BattleMatchState;
  private battleStartTime?: number;
  private statsA: CombatStats;
  private statsB: CombatStats;
  private onBroadcast?: (state: BattleMatchState) => void;
  private onFinish?: (results: MatchResults) => void;
  /** Pending manual action override for each player (consumed on next tick) */
  private pendingActionA?: ActionType;
  private pendingActionB?: ActionType;

  constructor(playerA: Player, playerB: Player) {
    this.id = `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.state = MatchState.BATTLE;
    this.playerA = playerA;
    this.playerB = playerB;
    this.createdAt = Date.now();

    // Update player statuses
    this.playerA.status = PlayerStatus.IN_MATCH;
    this.playerB.status = PlayerStatus.IN_MATCH;
    
    // Initialize combat stats
    this.statsA = {
      attacksLanded: 0,
      blocksUsed: 0,
      damageDealt: 0,
      damageTaken: 0,
      finalPosition: { x: 0, y: 0 }
    };
    this.statsB = {
      attacksLanded: 0,
      blocksUsed: 0,
      damageDealt: 0,
      damageTaken: 0,
      finalPosition: { x: 10, y: 0 }
    };
  }

  /**
   * Check if a player is in this match
   */
  hasPlayer(playerId: string): boolean {
    return this.playerA.id === playerId || this.playerB.id === playerId;
  }

  /**
   * Get the opponent of a player
   */
  getOpponent(playerId: string): Player | null {
    if (playerId === this.playerA.id) {
      return this.playerB;
    } else if (playerId === this.playerB.id) {
      return this.playerA;
    }
    return null;
  }

  /**
   * Start the actual battle simulation.
   * Fighters start idle; players trigger actions via buttons.
   */
  startBattleSimulation(onBroadcast: (state: BattleMatchState) => void, onFinish: (results: MatchResults) => void): void {
    this.onBroadcast = onBroadcast;
    this.onFinish = onFinish;
    this.battleStartTime = Date.now();
    
    // Initialize battle state
    this.battleState = {
      matchId: this.id,
      tick: 0,
      phase: 'BATTLE',
      duration: 0,
      fighterA: {
        playerId: this.playerA.id,
        username: this.playerA.username,
        health: 100,
        maxHealth: 100,
        position: { x: 0, y: 0 },
        attacking: false,
        blocking: false,
        attackCooldown: 0,
        lastAction: 'IDLE'
      },
      fighterB: {
        playerId: this.playerB.id,
        username: this.playerB.username,
        health: 100,
        maxHealth: 100,
        position: { x: 10, y: 0 },
        attacking: false,
        blocking: false,
        attackCooldown: 0,
        lastAction: 'IDLE'
      },
      spectatorCount: 0
    };
    
    // Start battle loop
    this.battleInterval = setInterval(() => {
      this.processBattleTick();
    }, TICK_INTERVAL_MS);
    
    console.log(`Battle started for match ${this.id}`);
  }

  /**
   * Set a manual action override for a player (triggered by an action button).
   * This action is consumed on the next tick.
   */
  setPendingAction(playerId: string, action: ActionType): void {
    if (playerId === this.playerA.id) {
      this.pendingActionA = action;
    } else if (playerId === this.playerB.id) {
      this.pendingActionB = action;
    }
  }
  
  /**
   * Process a single battle tick
   */
  private processBattleTick(): void {
    if (!this.battleState) {
      return;
    }
    
    const { fighterA, fighterB } = this.battleState;

    // Determine action for player A: consume pending action or default to IDLE
    let actionA: ActionType;
    if (this.pendingActionA !== undefined) {
      actionA = this.pendingActionA;
      this.pendingActionA = undefined;
    } else {
      actionA = 'IDLE';
    }

    // Determine action for player B: consume pending action or default to IDLE
    let actionB: ActionType;
    if (this.pendingActionB !== undefined) {
      actionB = this.pendingActionB;
      this.pendingActionB = undefined;
    } else {
      actionB = 'IDLE';
    }
    
    // Simulate tick
    this.simulateTick(actionA, actionB);
    
    // Update duration
    if (this.battleStartTime) {
      this.battleState.duration = Date.now() - this.battleStartTime;
    }
    
    // Broadcast state
    if (this.onBroadcast) {
      this.onBroadcast(this.battleState);
    }
    
    // Check end conditions
    if (fighterA.health <= 0 || fighterB.health <= 0 || this.battleState.tick >= MAX_TICKS) {
      this.endBattle();
    }
  }
  
  /**
   * Calculate damage after applying block reduction
   */
  private calculateDamage(baseDamage: number, isBlocked: boolean): number {
    return isBlocked ? baseDamage * BLOCK_DAMAGE_REDUCTION : baseDamage;
  }
  
  /**
   * Simulate a single tick of combat
   */
  private simulateTick(actionA: ActionType, actionB: ActionType): void {
    if (!this.battleState) return;
    
    const { fighterA, fighterB } = this.battleState;
    
    // Calculate distance
    const distance = calculateDistance(fighterA.position, fighterB.position);
    
    // Reset flags
    fighterA.attacking = false;
    fighterA.blocking = false;
    fighterB.attacking = false;
    fighterB.blocking = false;
    
    let event: MatchEvent | undefined;
    
    // Process Fighter A's action
    if (actionA === 'ATTACK' && distance <= ATTACK_RANGE && fighterA.attackCooldown === 0) {
      const damage = this.calculateDamage(BASE_DAMAGE, actionB === 'BLOCK');
      if (actionB === 'BLOCK') {
        event = { type: 'BLOCK', attacker: this.playerA.id, target: this.playerB.id, damage };
      } else {
        event = { type: 'DAMAGE', attacker: this.playerA.id, target: this.playerB.id, damage };
      }
      fighterB.health -= damage;
      fighterA.attacking = true;
      fighterA.attackCooldown = ATTACK_COOLDOWN_TICKS;
      this.statsA.attacksLanded++;
      this.statsA.damageDealt += damage;
      this.statsB.damageTaken += damage;
    } else if (actionA === 'BLOCK') {
      fighterA.blocking = true;
      this.statsA.blocksUsed++;
    } else if (actionA === 'ATTACK' && distance > ATTACK_RANGE) {
      event = { type: 'MISS', attacker: this.playerA.id };
    }
    
    // Process Fighter B's action
    if (actionB === 'ATTACK' && distance <= ATTACK_RANGE && fighterB.attackCooldown === 0) {
      const damage = this.calculateDamage(BASE_DAMAGE, actionA === 'BLOCK');
      if (actionA === 'BLOCK') {
        if (!event) event = { type: 'BLOCK', attacker: this.playerB.id, target: this.playerA.id, damage };
      } else {
        if (!event) event = { type: 'DAMAGE', attacker: this.playerB.id, target: this.playerA.id, damage };
      }
      fighterA.health -= damage;
      fighterB.attacking = true;
      fighterB.attackCooldown = ATTACK_COOLDOWN_TICKS;
      this.statsB.attacksLanded++;
      this.statsB.damageDealt += damage;
      this.statsA.damageTaken += damage;
    } else if (actionB === 'BLOCK') {
      fighterB.blocking = true;
      this.statsB.blocksUsed++;
    } else if (actionB === 'ATTACK' && distance > ATTACK_RANGE) {
      if (!event) event = { type: 'MISS', attacker: this.playerB.id };
    }
    
    // Apply movement
    this.applyMovement(fighterA, fighterB, actionA);
    this.applyMovement(fighterB, fighterA, actionB);
    
    // Decrease cooldowns
    if (fighterA.attackCooldown > 0) fighterA.attackCooldown--;
    if (fighterB.attackCooldown > 0) fighterB.attackCooldown--;
    
    // Update last actions
    fighterA.lastAction = actionA;
    fighterB.lastAction = actionB;
    
    // Store event
    this.battleState.lastEvent = event;
    
    // Increment tick
    this.battleState.tick++;
  }
  
  /**
   * Apply movement to a fighter
   */
  private applyMovement(fighter: FighterState, opponent: FighterState, action: ActionType): void {
    if (action === 'APPROACH') {
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
  
  /**
   * End the battle and calculate results
   */
  private endBattle(): void {
    if (this.battleInterval) {
      clearInterval(this.battleInterval);
      this.battleInterval = undefined;
    }
    
    if (!this.battleState) return;
    
    this.battleState.phase = 'FINISHED';
    this.finish();
    
    // Store final positions
    this.statsA.finalPosition = { ...this.battleState.fighterA.position };
    this.statsB.finalPosition = { ...this.battleState.fighterB.position };
    
    // Determine winner
    let winner: 'A' | 'B' | 'DRAW' = 'DRAW';
    if (this.battleState.fighterA.health > 0 && this.battleState.fighterB.health <= 0) {
      winner = 'A';
    } else if (this.battleState.fighterB.health > 0 && this.battleState.fighterA.health <= 0) {
      winner = 'B';
    }
    
    const results: MatchResults = {
      matchId: this.id,
      winner,
      winnerPlayer: winner === 'A' ? this.playerA.toPublicData() : winner === 'B' ? this.playerB.toPublicData() : undefined,
      loserPlayer: winner === 'A' ? this.playerB.toPublicData() : winner === 'B' ? this.playerA.toPublicData() : undefined,
      finalHealthA: this.battleState.fighterA.health,
      finalHealthB: this.battleState.fighterB.health,
      tickCount: this.battleState.tick,
      duration: this.battleState.duration,
      statsA: this.statsA,
      statsB: this.statsB
    };
    
    if (this.onFinish) {
      this.onFinish(results);
    }
    
    console.log(`Battle ended for match ${this.id}, winner: ${winner}`);
  }
  
  /**
   * Get current battle state
   */
  getBattleState(): BattleMatchState | undefined {
    return this.battleState;
  }
  
  /**
   * Update spectator count
   */
  updateSpectatorCount(count: number): void {
    if (this.battleState) {
      this.battleState.spectatorCount = count;
    }
  }

  /**
   * Transition to finished state
   */
  finish(): void {
    this.state = MatchState.FINISHED;
    this.playerA.status = PlayerStatus.ONLINE;
    this.playerB.status = PlayerStatus.ONLINE;
  }

  /**
   * Get public match data
   */
  toPublicData(): MatchData {
    return {
      id: this.id,
      state: this.state,
      playerA: this.playerA.toPublicData(),
      playerB: this.playerB.toPublicData(),
      createdAt: this.createdAt
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.battleInterval) {
      clearInterval(this.battleInterval);
      this.battleInterval = undefined;
    }
  }
}
