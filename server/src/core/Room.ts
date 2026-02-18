import { Room as RoomType } from '../../../shared/types/room';

export class Room {
  public code: string;
  public hostPlayerId: string;
  public guestPlayerId?: string;
  public matchId?: string;
  public createdAt: number;
  public expiresAt: number;

  private static readonly ROOM_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor(code: string, hostPlayerId: string) {
    this.code = code;
    this.hostPlayerId = hostPlayerId;
    this.createdAt = Date.now();
    this.expiresAt = this.createdAt + Room.ROOM_EXPIRY_MS;
  }

  /**
   * Check if room is full
   */
  isFull(): boolean {
    return !!this.guestPlayerId;
  }

  /**
   * Check if room has expired
   */
  isExpired(): boolean {
    return Date.now() > this.expiresAt;
  }

  /**
   * Add guest player to room
   */
  addGuest(playerId: string): boolean {
    if (this.isFull()) {
      return false;
    }
    this.guestPlayerId = playerId;
    return true;
  }

  /**
   * Check if a player is in this room
   */
  hasPlayer(playerId: string): boolean {
    return this.hostPlayerId === playerId || this.guestPlayerId === playerId;
  }

  /**
   * Get time until expiry in seconds
   */
  getTimeUntilExpiry(): number {
    const remaining = this.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Convert to public room data
   */
  toPublicData(): RoomType {
    return {
      code: this.code,
      hostPlayerId: this.hostPlayerId,
      guestPlayerId: this.guestPlayerId,
      matchId: this.matchId,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt
    };
  }

  /**
   * Generate a random 6-digit room code
   */
  static generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
