import { Server as SocketIOServer, Socket } from 'socket.io';
import { MatchManager } from './MatchManager';
import { MatchSummary, MatchListResponse } from '../../../shared/types/spectator';

export class SpectatorManager {
  private io: SocketIOServer;
  private matchManager: MatchManager;
  // Map of matchId -> Set of spectator socket IDs
  private spectators: Map<string, Set<string>>;

  constructor(io: SocketIOServer, matchManager: MatchManager) {
    this.io = io;
    this.matchManager = matchManager;
    this.spectators = new Map();
  }

  /**
   * Add a spectator to a match
   */
  joinMatch(socket: Socket, matchId: string): boolean {
    const match = this.matchManager.getMatch(matchId);
    
    if (!match) {
      return false;
    }

    // Add spectator to set
    if (!this.spectators.has(matchId)) {
      this.spectators.set(matchId, new Set());
    }
    
    this.spectators.get(matchId)!.add(socket.id);
    
    // Join socket room for this match
    socket.join(`match:${matchId}`);
    
    console.log(`Spectator ${socket.id} joined match ${matchId}`);
    
    return true;
  }

  /**
   * Remove a spectator from a match
   */
  leaveMatch(socket: Socket, matchId: string): boolean {
    const spectatorSet = this.spectators.get(matchId);
    
    if (!spectatorSet) {
      return false;
    }

    spectatorSet.delete(socket.id);
    
    // Remove empty sets
    if (spectatorSet.size === 0) {
      this.spectators.delete(matchId);
    }
    
    // Leave socket room
    socket.leave(`match:${matchId}`);
    
    console.log(`Spectator ${socket.id} left match ${matchId}`);
    
    return true;
  }

  /**
   * Remove spectator from all matches (on disconnect)
   */
  removeSpectator(socketId: string): void {
    for (const [matchId, spectatorSet] of this.spectators.entries()) {
      if (spectatorSet.has(socketId)) {
        spectatorSet.delete(socketId);
        
        // Remove empty sets
        if (spectatorSet.size === 0) {
          this.spectators.delete(matchId);
        }
      }
    }
  }

  /**
   * Get spectator count for a match
   */
  getSpectatorCount(matchId: string): number {
    return this.spectators.get(matchId)?.size || 0;
  }

  /**
   * Get list of all active matches with summary data
   */
  getActiveMatches(): MatchListResponse {
    const matches: MatchSummary[] = [];
    const allMatches = this.matchManager.getAllMatches();

    for (const match of allMatches) {
      const battleState = this.matchManager.getMatchBattleState(match.id);
      
      if (battleState) {
        matches.push({
          matchId: match.id,
          playerA: match.playerA.toPublicData(),
          playerB: match.playerB.toPublicData(),
          tick: battleState.tick,
          duration: battleState.duration,
          spectatorCount: this.getSpectatorCount(match.id),
          healthA: battleState.fighterA.health,
          healthB: battleState.fighterB.health,
          maxHealth: battleState.fighterA.maxHealth
        });
      }
    }

    return { matches };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.spectators.clear();
  }
}
