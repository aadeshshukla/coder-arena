import { Player, PlayerStatus } from './Player';
import { MatchState, MatchData } from '../../../shared/types/match';

export class Match {
  public id: string;
  public state: MatchState;
  public playerA: Player;
  public playerB: Player;
  public codeA?: string;
  public codeB?: string;
  public readyA: boolean;
  public readyB: boolean;
  public countdown: number;
  public createdAt: number;
  private countdownInterval?: NodeJS.Timeout;

  constructor(playerA: Player, playerB: Player) {
    this.id = `match_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.state = MatchState.PREPARATION;
    this.playerA = playerA;
    this.playerB = playerB;
    this.readyA = false;
    this.readyB = false;
    this.countdown = 30;
    this.createdAt = Date.now();

    // Update player statuses
    this.playerA.status = PlayerStatus.IN_MATCH;
    this.playerB.status = PlayerStatus.IN_MATCH;
  }

  /**
   * Submit code for a player
   */
  submitCode(playerId: string, code: string): boolean {
    if (this.state !== MatchState.PREPARATION) {
      return false;
    }

    if (playerId === this.playerA.id) {
      this.codeA = code;
      return true;
    } else if (playerId === this.playerB.id) {
      this.codeB = code;
      return true;
    }

    return false;
  }

  /**
   * Mark a player as ready
   */
  markReady(playerId: string): boolean {
    if (this.state !== MatchState.PREPARATION) {
      return false;
    }

    if (playerId === this.playerA.id) {
      this.readyA = true;
      return true;
    } else if (playerId === this.playerB.id) {
      this.readyB = true;
      return true;
    }

    return false;
  }

  /**
   * Check if both players are ready
   */
  areBothReady(): boolean {
    return this.readyA && this.readyB;
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
   * Start the countdown timer
   */
  startCountdown(onTick: (seconds: number) => void, onComplete: () => void): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      onTick(this.countdown);

      if (this.countdown <= 0) {
        this.stopCountdown();
        onComplete();
      }
    }, 1000);
  }

  /**
   * Stop the countdown timer
   */
  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  /**
   * Transition to battle state
   */
  startBattle(): void {
    this.stopCountdown();
    this.state = MatchState.BATTLE;
  }

  /**
   * Transition to finished state
   */
  finish(): void {
    this.stopCountdown();
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
      codeA: this.codeA,
      codeB: this.codeB,
      readyA: this.readyA,
      readyB: this.readyB,
      countdown: this.countdown,
      createdAt: this.createdAt
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopCountdown();
  }
}
