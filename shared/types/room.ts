export interface Room {
  code: string;
  hostPlayerId: string;
  guestPlayerId?: string;
  matchId?: string;
  createdAt: number;
  expiresAt: number;
}

export interface RoomInfo {
  code: string;
  hostUsername: string;
  isFull: boolean;
  expiresIn: number;
}
