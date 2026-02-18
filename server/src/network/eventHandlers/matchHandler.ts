import { Socket } from 'socket.io';
import { AuthManager } from '../../managers/AuthManager';
import { MatchManager } from '../../managers/MatchManager';
import {
  CodeSubmitRequest,
  CodeValidatedResponse,
  PlayerReadyRequest,
  MatchLeaveRequest
} from '../../../../shared/types/match';

export function registerMatchHandlers(
  socket: Socket,
  authManager: AuthManager,
  matchManager: MatchManager
): void {

  /**
   * Handle code submission
   */
  socket.on('code:submit', (data: CodeSubmitRequest, callback?: (response: CodeValidatedResponse) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);
    
    if (!player) {
      if (callback) {
        callback({ success: false, errors: [{ message: 'Player not found' }] });
      }
      return;
    }

    const { matchId, code } = data;
    const result = matchManager.submitCode(player.id, matchId, code);

    if (callback) {
      callback(result);
    } else {
      socket.emit('code:validated', result);
    }
  });

  /**
   * Handle player ready
   */
  socket.on('player:ready', (data: PlayerReadyRequest, callback?: (response: { success: boolean; error?: string }) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);
    
    if (!player) {
      if (callback) {
        callback({ success: false, error: 'Player not found' });
      }
      return;
    }

    const { matchId } = data;
    const success = matchManager.markPlayerReady(player.id, matchId);

    if (callback) {
      callback({ success, error: success ? undefined : 'Failed to mark ready' });
    }
  });

  /**
   * Handle leaving a match
   */
  socket.on('match:leave', (data: MatchLeaveRequest, callback?: (response: { success: boolean }) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);
    
    if (!player) {
      if (callback) {
        callback({ success: false });
      }
      return;
    }

    const { matchId } = data;
    const success = matchManager.leaveMatch(player.id, matchId);

    if (callback) {
      callback({ success });
    }
  });
}
