import { Server as SocketIOServer } from 'socket.io';
import { Match } from '../core/Match';
import { AuthManager } from './AuthManager';
import { CASLParser } from '../engine/casl/CASLParser';
import { CASLValidator } from '../engine/casl/CASLValidator';

export class MatchManager {
  private io: SocketIOServer;
  private authManager: AuthManager;
  private matches: Map<string, Match>; // Map of match ID -> Match

  constructor(io: SocketIOServer, authManager: AuthManager) {
    this.io = io;
    this.authManager = authManager;
    this.matches = new Map();
  }

  /**
   * Add a match to the manager
   */
  addMatch(match: Match): void {
    this.matches.set(match.id, match);
    
    // Start countdown
    match.startCountdown(
      // On tick
      (seconds) => {
        this.broadcastCountdown(match.id, seconds);
      },
      // On complete
      () => {
        this.handleCountdownComplete(match.id);
      }
    );

    // Send preparation event to both players
    this.io.to(match.playerA.socketId).emit('match:prepare', {
      matchId: match.id,
      opponent: match.playerB.toPublicData(),
      countdown: match.countdown
    });

    this.io.to(match.playerB.socketId).emit('match:prepare', {
      matchId: match.id,
      opponent: match.playerA.toPublicData(),
      countdown: match.countdown
    });

    console.log(`Match ${match.id} entered preparation phase`);
  }

  /**
   * Submit code for a player in a match
   */
  submitCode(playerId: string, matchId: string, code: string): {
    success: boolean;
    errors?: Array<{ message: string; line?: number }>;
  } {
    const match = this.matches.get(matchId);
    
    if (!match) {
      return { success: false, errors: [{ message: 'Match not found' }] };
    }

    if (!match.hasPlayer(playerId)) {
      return { success: false, errors: [{ message: 'Player not in this match' }] };
    }

    // Validate code
    const parser = new CASLParser(code);
    const parseResult = parser.parse();

    if (!parseResult.success || !parseResult.strategy) {
      return { 
        success: false, 
        errors: parseResult.errors?.map(e => ({ message: e })) || [{ message: 'Failed to parse code' }]
      };
    }

    const validator = new CASLValidator();
    const validationResult = validator.validate(parseResult.strategy);

    if (!validationResult.valid) {
      return { 
        success: false, 
        errors: validationResult.errors?.map(e => ({ message: e })) || [{ message: 'Code validation failed' }]
      };
    }

    // Submit code
    match.submitCode(playerId, code);

    console.log(`Player ${playerId} submitted code for match ${matchId}`);

    return { success: true };
  }

  /**
   * Mark a player as ready
   */
  markPlayerReady(playerId: string, matchId: string): boolean {
    const match = this.matches.get(matchId);
    
    if (!match) {
      return false;
    }

    if (!match.hasPlayer(playerId)) {
      return false;
    }

    // Check if player has submitted code
    const hasCode = (playerId === match.playerA.id && match.codeA) ||
                    (playerId === match.playerB.id && match.codeB);

    if (!hasCode) {
      return false;
    }

    match.markReady(playerId);

    // Notify opponent
    const opponent = match.getOpponent(playerId);
    if (opponent) {
      this.io.to(opponent.socketId).emit('opponent:ready', { ready: true });
    }

    console.log(`Player ${playerId} is ready for match ${matchId}`);

    // Check if both players are ready
    if (match.areBothReady()) {
      this.startMatch(matchId);
    }

    return true;
  }

  /**
   * Handle player leaving a match
   */
  leaveMatch(playerId: string, matchId: string): boolean {
    const match = this.matches.get(matchId);
    
    if (!match) {
      return false;
    }

    if (!match.hasPlayer(playerId)) {
      return false;
    }

    // For now, just finish the match
    // In a full implementation, we'd handle forfeit logic
    match.finish();
    this.matches.delete(matchId);

    console.log(`Player ${playerId} left match ${matchId}`);

    return true;
  }

  /**
   * Start a match (transition to battle)
   */
  private startMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    
    if (!match) {
      return;
    }

    match.startBattle();

    // Emit match:start to both players
    this.io.to(match.playerA.socketId).emit('match:start', { matchId });
    this.io.to(match.playerB.socketId).emit('match:start', { matchId });

    console.log(`Match ${matchId} started (entering battle phase)`);

    // TODO: In Phase 4, this would trigger the actual battle simulation
  }

  /**
   * Handle countdown completion
   */
  private handleCountdownComplete(matchId: string): void {
    const match = this.matches.get(matchId);
    
    if (!match) {
      return;
    }

    console.log(`Match ${matchId} countdown completed`);

    // Auto-start match even if not both ready
    this.startMatch(matchId);
  }

  /**
   * Broadcast countdown to match participants
   */
  private broadcastCountdown(matchId: string, seconds: number): void {
    const match = this.matches.get(matchId);
    
    if (!match) {
      return;
    }

    this.io.to(match.playerA.socketId).emit('match:countdown', { secondsRemaining: seconds });
    this.io.to(match.playerB.socketId).emit('match:countdown', { secondsRemaining: seconds });
  }

  /**
   * Get match by ID
   */
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  /**
   * Get match by player ID
   */
  getMatchByPlayer(playerId: string): Match | undefined {
    for (const match of this.matches.values()) {
      if (match.hasPlayer(playerId)) {
        return match;
      }
    }
    return undefined;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.matches.forEach(match => {
      match.cleanup();
    });
    this.matches.clear();
  }
}
