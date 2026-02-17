export enum PlayerStatus {
  ONLINE = 'online',
  IDLE = 'idle',
  IN_QUEUE = 'in_queue',
  IN_MATCH = 'in_match'
}

export interface PlayerStats {
  wins: number;
  losses: number;
  totalMatches: number;
}

export class Player {
  public id: string;
  public username: string;
  public socketId: string;
  public status: PlayerStatus;
  public stats: PlayerStats;
  public connectedAt: number;

  constructor(username: string, socketId: string) {
    this.id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.username = username;
    this.socketId = socketId;
    this.status = PlayerStatus.ONLINE;
    this.stats = { wins: 0, losses: 0, totalMatches: 0 };
    this.connectedAt = Date.now();
  }

  toPublicData() {
    return {
      id: this.id,
      username: this.username,
      status: this.status,
      stats: this.stats
    };
  }
}
