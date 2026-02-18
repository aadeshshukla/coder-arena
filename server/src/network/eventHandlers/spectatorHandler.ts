import { Socket } from 'socket.io';
import { MatchManager } from '../../managers/MatchManager';
import { SpectatorManager } from '../../managers/SpectatorManager';
import {
  SpectatorJoinRequest,
  SpectatorLeaveRequest,
  MatchListResponse
} from '../../../../shared/types/spectator';

export function registerSpectatorHandlers(
  socket: Socket,
  matchManager: MatchManager,
  spectatorManager: SpectatorManager
): void {

  /**
   * Handle spectator joining a match
   */
  socket.on('match:join_spectator', (data: SpectatorJoinRequest, callback?: (response: { success: boolean; error?: string }) => void) => {
    const { matchId } = data;
    
    const success = spectatorManager.joinMatch(socket, matchId);
    
    if (success) {
      // Send current match state immediately
      const battleState = matchManager.getMatchBattleState(matchId);
      if (battleState) {
        socket.emit('spectator:joined', battleState);
      }
      
      if (callback) {
        callback({ success: true });
      }
    } else {
      if (callback) {
        callback({ success: false, error: 'Match not found or not available' });
      }
    }
  });

  /**
   * Handle spectator leaving a match
   */
  socket.on('match:leave_spectator', (data: SpectatorLeaveRequest, callback?: (response: { success: boolean }) => void) => {
    const { matchId } = data;
    
    const success = spectatorManager.leaveMatch(socket, matchId);
    
    if (success) {
      socket.emit('spectator:left');
    }
    
    if (callback) {
      callback({ success });
    }
  });

  /**
   * Handle getting list of active matches
   */
  socket.on('match:list', (callback?: (response: MatchListResponse) => void) => {
    const matches = spectatorManager.getActiveMatches();
    
    if (callback) {
      callback(matches);
    } else {
      socket.emit('match:list_response', matches);
    }
  });

  /**
   * Handle disconnection - remove from all spectated matches
   */
  socket.on('disconnect', () => {
    spectatorManager.removeSpectator(socket.id);
  });
}
