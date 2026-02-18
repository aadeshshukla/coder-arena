import { Server as SocketIOServer } from 'socket.io';
import { Player, PlayerStatus } from '../core/Player';
import { Match } from '../core/Match';
import { Room } from '../core/Room';
import { AuthManager } from './AuthManager';

export class MatchmakingManager {
  private io: SocketIOServer;
  private authManager: AuthManager;
  private queue: string[]; // Array of player IDs in queue (FIFO)
  private rooms: Map<string, Room>; // Map of room code -> Room
  private roomCleanupInterval?: NodeJS.Timeout;

  constructor(io: SocketIOServer, authManager: AuthManager) {
    this.io = io;
    this.authManager = authManager;
    this.queue = [];
    this.rooms = new Map();
    
    // Start room cleanup interval (check every minute)
    this.startRoomCleanup();
  }

  /**
   * Add a player to the matchmaking queue
   */
  joinQueue(playerId: string): { success: boolean; position: number; error?: string } {
    const player = this.authManager.getPlayerById(playerId);
    
    if (!player) {
      return { success: false, position: 0, error: 'Player not found' };
    }

    if (this.queue.includes(playerId)) {
      return { success: false, position: 0, error: 'Already in queue' };
    }

    // Add to queue
    this.queue.push(playerId);
    player.status = PlayerStatus.IN_QUEUE;

    const position = this.queue.indexOf(playerId);
    
    console.log(`Player ${player.username} joined queue at position ${position}`);
    
    // Broadcast queue update
    this.broadcastQueueUpdate();

    return { success: true, position };
  }

  /**
   * Remove a player from the matchmaking queue
   */
  leaveQueue(playerId: string): boolean {
    const index = this.queue.indexOf(playerId);
    
    if (index === -1) {
      return false;
    }

    this.queue.splice(index, 1);
    
    const player = this.authManager.getPlayerById(playerId);
    if (player) {
      player.status = PlayerStatus.ONLINE;
      console.log(`Player ${player.username} left queue`);
    }

    this.broadcastQueueUpdate();
    return true;
  }

  /**
   * Try to match players from the queue
   */
  tryMatchPlayers(): Match | null {
    if (this.queue.length < 2) {
      return null;
    }

    // Get first two players from queue (FIFO)
    const playerAId = this.queue.shift()!;
    const playerBId = this.queue.shift()!;

    const playerA = this.authManager.getPlayerById(playerAId);
    const playerB = this.authManager.getPlayerById(playerBId);

    if (!playerA || !playerB) {
      console.error('Player not found when matching');
      return null;
    }

    // Create match
    const match = new Match(playerA, playerB);
    
    console.log(`Match created: ${match.id} (${playerA.username} vs ${playerB.username})`);

    // Emit match:found to both players
    this.io.to(playerA.socketId).emit('match:found', {
      matchId: match.id,
      opponent: playerB.toPublicData()
    });

    this.io.to(playerB.socketId).emit('match:found', {
      matchId: match.id,
      opponent: playerA.toPublicData()
    });

    this.broadcastQueueUpdate();

    return match;
  }

  /**
   * Create a private room
   */
  createRoom(hostPlayerId: string): { success: boolean; roomCode?: string; error?: string } {
    const player = this.authManager.getPlayerById(hostPlayerId);
    
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Generate unique room code
    let roomCode: string;
    let attempts = 0;
    do {
      roomCode = Room.generateCode();
      attempts++;
    } while (this.rooms.has(roomCode) && attempts < 10);

    if (attempts >= 10) {
      return { success: false, error: 'Failed to generate unique room code' };
    }

    const room = new Room(roomCode, hostPlayerId);
    this.rooms.set(roomCode, room);

    console.log(`Room ${roomCode} created by ${player.username}`);

    return { success: true, roomCode };
  }

  /**
   * Join a private room
   */
  joinRoom(guestPlayerId: string, roomCode: string): { 
    success: boolean; 
    match?: Match; 
    error?: string 
  } {
    const player = this.authManager.getPlayerById(guestPlayerId);
    
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.isExpired()) {
      this.rooms.delete(roomCode);
      return { success: false, error: 'Room has expired' };
    }

    if (room.isFull()) {
      return { success: false, error: 'Room is full' };
    }

    if (room.hostPlayerId === guestPlayerId) {
      return { success: false, error: 'Cannot join your own room' };
    }

    // Add guest to room
    room.addGuest(guestPlayerId);

    // Get host player
    const hostPlayer = this.authManager.getPlayerById(room.hostPlayerId);
    
    if (!hostPlayer) {
      return { success: false, error: 'Host player not found' };
    }

    // Create match
    const match = new Match(hostPlayer, player);
    room.matchId = match.id;

    console.log(`Player ${player.username} joined room ${roomCode}`);
    console.log(`Match created: ${match.id} (${hostPlayer.username} vs ${player.username})`);

    // Emit match:found to both players
    this.io.to(hostPlayer.socketId).emit('match:found', {
      matchId: match.id,
      opponent: player.toPublicData()
    });

    this.io.to(player.socketId).emit('match:found', {
      matchId: match.id,
      opponent: hostPlayer.toPublicData()
    });

    // Clean up room after match is created
    this.rooms.delete(roomCode);

    return { success: true, match };
  }

  /**
   * Get room by code
   */
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  /**
   * Broadcast queue size to all players in queue
   */
  private broadcastQueueUpdate(): void {
    const queueSize = this.queue.length;
    
    // Send to each player in queue with their position
    this.queue.forEach((playerId, index) => {
      const player = this.authManager.getPlayerById(playerId);
      if (player) {
        this.io.to(player.socketId).emit('queue:update', {
          queueSize,
          position: index
        });
      }
    });
  }

  /**
   * Start periodic cleanup of expired rooms
   */
  private startRoomCleanup(): void {
    this.roomCleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredRooms: string[] = [];

      this.rooms.forEach((room, code) => {
        if (room.isExpired()) {
          expiredRooms.push(code);
        }
      });

      expiredRooms.forEach(code => {
        console.log(`Room ${code} expired and removed`);
        this.rooms.delete(code);
      });
    }, 60000); // Check every minute
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Check if player is in queue
   */
  isInQueue(playerId: string): boolean {
    return this.queue.includes(playerId);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.roomCleanupInterval) {
      clearInterval(this.roomCleanupInterval);
    }
  }
}
