import jwt from 'jsonwebtoken';
import { Player } from '../core/Player';

const JWT_SECRET = process.env.JWT_SECRET || 'coder-arena-secret-key-dev';
const JWT_EXPIRY = '7d';

export class AuthManager {
  private players: Map<string, Player>;
  private playersBySocketId: Map<string, Player>;

  constructor() {
    this.players = new Map();
    this.playersBySocketId = new Map();
  }

  /**
   * Validate username format
   * Must be 3-20 characters, alphanumeric only
   */
  private validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length < 3 || username.length > 20) {
      return { valid: false, error: 'Username must be 3-20 characters' };
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return { valid: false, error: 'Username must be alphanumeric only' };
    }
    return { valid: true };
  }

  /**
   * Login a user and create a player
   */
  login(username: string, socketId: string): { success: boolean; token?: string; player?: Player; error?: string } {
    // Validate username
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create new player
    const player = new Player(username, socketId);
    
    // Store player
    this.players.set(player.id, player);
    this.playersBySocketId.set(socketId, player);

    // Generate JWT token
    const token = jwt.sign(
      { playerId: player.id, username: player.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return { success: true, token, player };
  }

  /**
   * Validate a JWT token and return the player
   */
  validateToken(token: string): { success: boolean; player?: Player; error?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string; username: string };
      const player = this.players.get(decoded.playerId);
      
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      return { success: true, player };
    } catch (error) {
      return { success: false, error: 'Invalid or expired token' };
    }
  }

  /**
   * Logout a player
   */
  logout(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (player) {
      this.playersBySocketId.delete(player.socketId);
      this.players.delete(playerId);
      return true;
    }
    return false;
  }

  /**
   * Get a player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Get a player by socket ID
   */
  getPlayerBySocketId(socketId: string): Player | undefined {
    return this.playersBySocketId.get(socketId);
  }

  /**
   * Update player socket ID (for reconnection)
   */
  updateSocketId(playerId: string, socketId: string): boolean {
    const player = this.players.get(playerId);
    if (player) {
      // Remove old socket mapping
      this.playersBySocketId.delete(player.socketId);
      // Update player socket ID
      player.socketId = socketId;
      // Add new socket mapping
      this.playersBySocketId.set(socketId, player);
      return true;
    }
    return false;
  }

  /**
   * Get all players
   */
  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}
