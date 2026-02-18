import { Server as SocketIOServer, Socket } from 'socket.io';

interface RematchRequest {
  fromPlayerId: string;
  toPlayerId: string;
  timestamp: number;
  expiresAt: number;
}

export class RematchManager {
  private io: SocketIOServer;
  private pendingRematches: Map<string, RematchRequest> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private playerNames: Map<string, string> = new Map(); // playerId -> username
  private REMATCH_TIMEOUT = 30000; // 30 seconds
  
  constructor(io: SocketIOServer) {
    this.io = io;
  }
  
  /**
   * Register a player's socket connection
   */
  registerPlayer(playerId: string, socketId: string, username: string): void {
    this.playerSockets.set(playerId, socketId);
    this.playerNames.set(playerId, username);
  }

  /**
   * Unregister a player's socket connection
   */
  unregisterPlayer(playerId: string): void {
    this.playerSockets.delete(playerId);
    // Don't delete username as it might be needed for pending requests
  }
  
  /**
   * Send rematch request from one player to another
   */
  sendRematchRequest(fromPlayerId: string, toPlayerId: string): boolean {
    // Check if request already exists
    const requestKey = this.getRequestKey(fromPlayerId, toPlayerId);
    
    if (this.pendingRematches.has(requestKey)) {
      return false; // Already sent
    }

    // Check if target player is online
    const targetSocketId = this.playerSockets.get(toPlayerId);
    if (!targetSocketId) {
      return false; // Target player not online
    }
    
    const request: RematchRequest = {
      fromPlayerId,
      toPlayerId,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.REMATCH_TIMEOUT
    };
    
    this.pendingRematches.set(requestKey, request);
    
    // Emit to target player
    this.io.to(targetSocketId).emit('rematch:request', {
      fromPlayerId,
      fromUsername: this.playerNames.get(fromPlayerId) || 'Unknown',
      expiresIn: this.REMATCH_TIMEOUT
    });
    
    // Auto-expire after timeout
    setTimeout(() => {
      this.expireRematchRequest(requestKey);
    }, this.REMATCH_TIMEOUT);
    
    return true;
  }
  
  /**
   * Accept rematch request
   */
  acceptRematch(playerId: string, fromPlayerId: string): boolean {
    const requestKey = this.getRequestKey(fromPlayerId, playerId);
    const request = this.pendingRematches.get(requestKey);
    
    if (!request || Date.now() > request.expiresAt) {
      return false; // Expired or not found
    }
    
    // Clean up request
    this.pendingRematches.delete(requestKey);
    
    const requesterSocketId = this.playerSockets.get(fromPlayerId);
    const accepterSocketId = this.playerSockets.get(playerId);

    // Notify both players
    if (requesterSocketId) {
      this.io.to(requesterSocketId).emit('rematch:accepted', { opponentId: playerId });
    }
    if (accepterSocketId) {
      this.io.to(accepterSocketId).emit('rematch:accepted', { opponentId: fromPlayerId });
    }
    
    return true;
  }
  
  /**
   * Decline rematch request
   */
  declineRematch(playerId: string, fromPlayerId: string): void {
    const requestKey = this.getRequestKey(fromPlayerId, playerId);
    this.pendingRematches.delete(requestKey);
    
    const requesterSocketId = this.playerSockets.get(fromPlayerId);
    
    // Notify requester
    if (requesterSocketId) {
      this.io.to(requesterSocketId).emit('rematch:declined', {
        byPlayerId: playerId
      });
    }
  }
  
  /**
   * Expire rematch request
   */
  private expireRematchRequest(requestKey: string): void {
    const request = this.pendingRematches.get(requestKey);
    
    if (!request) return;
    
    this.pendingRematches.delete(requestKey);
    
    const requesterSocketId = this.playerSockets.get(request.fromPlayerId);
    
    // Notify requester
    if (requesterSocketId) {
      this.io.to(requesterSocketId).emit('rematch:expired');
    }
  }
  
  /**
   * Get unique request key
   */
  private getRequestKey(playerId1: string, playerId2: string): string {
    return `${playerId1}-${playerId2}`;
  }
}
