import { Socket } from 'socket.io';
import { AuthManager } from '../../managers/AuthManager';
import { MatchmakingManager } from '../../managers/MatchmakingManager';
import { MatchManager } from '../../managers/MatchManager';
import {
  QueueJoinRequest,
  QueueJoinedResponse,
  QueueLeftResponse,
  RoomCreateRequest,
  RoomCreatedResponse,
  RoomJoinRequest,
  RoomJoinedResponse,
  RoomStatusRequest,
  RoomStatusResponse
} from '../../../../shared/types/matchmaking';

export function registerMatchmakingHandlers(
  socket: Socket,
  authManager: AuthManager,
  matchmakingManager: MatchmakingManager,
  matchManager: MatchManager
): void {

  /**
   * Handle joining the matchmaking queue
   */
  socket.on('queue:join', (data: QueueJoinRequest, callback?: (response: QueueJoinedResponse) => void) => {
    const { token } = data;
    
    const result = authManager.validateToken(token);
    
    if (!result.success || !result.player) {
      if (callback) {
        callback({ success: false, position: 0, error: 'Invalid token' });
      }
      return;
    }

    const queueResult = matchmakingManager.joinQueue(result.player.id);

    if (queueResult.success) {
      socket.emit('queue:joined', { position: queueResult.position });
    }

    // Try to create match and add to match manager if successful
    const match = matchmakingManager.tryMatchPlayers();
    if (match) {
      matchManager.addMatch(match);
    }

    if (callback) {
      callback(queueResult);
    }
  });

  /**
   * Handle leaving the matchmaking queue
   */
  socket.on('queue:leave', (callback?: (response: QueueLeftResponse) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);
    
    if (!player) {
      if (callback) {
        callback({ success: false });
      }
      return;
    }

    const success = matchmakingManager.leaveQueue(player.id);

    if (success) {
      socket.emit('queue:left');
    }

    if (callback) {
      callback({ success });
    }
  });

  /**
   * Handle creating a private room
   */
  socket.on('room:create', (data: RoomCreateRequest, callback?: (response: RoomCreatedResponse) => void) => {
    const { token } = data;
    
    const result = authManager.validateToken(token);
    
    if (!result.success || !result.player) {
      if (callback) {
        callback({ success: false, roomCode: '', error: 'Invalid token' });
      }
      return;
    }

    const roomResult = matchmakingManager.createRoom(result.player.id);

    if (roomResult.success && roomResult.roomCode) {
      socket.emit('room:created', { roomCode: roomResult.roomCode });
      
      if (callback) {
        callback({ success: true, roomCode: roomResult.roomCode });
      }
    } else {
      if (callback) {
        callback({ success: false, roomCode: '', error: roomResult.error });
      }
    }
  });

  /**
   * Handle joining a private room
   */
  socket.on('room:join', (data: RoomJoinRequest, callback?: (response: RoomJoinedResponse) => void) => {
    const { token, roomCode } = data;
    
    const result = authManager.validateToken(token);
    
    if (!result.success || !result.player) {
      socket.emit('room:error', { message: 'Invalid token' });
      if (callback) {
        callback({ success: false, error: 'Invalid token' });
      }
      return;
    }

    const joinResult = matchmakingManager.joinRoom(result.player.id, roomCode);

    if (joinResult.success && joinResult.match) {
      // Add match to match manager
      matchManager.addMatch(joinResult.match);
      
      if (callback) {
        callback({ 
          success: true, 
          matchId: joinResult.match.id,
          opponent: joinResult.match.getOpponent(result.player.id)?.toPublicData()
        });
      }
    } else {
      socket.emit('room:error', { message: joinResult.error || 'Failed to join room' });
      if (callback) {
        callback({ success: false, error: joinResult.error });
      }
    }
  });

  /**
   * Handle room status query
   */
  socket.on('room:status', (data: RoomStatusRequest, callback?: (response: RoomStatusResponse) => void) => {
    const room = matchmakingManager.getRoom(data.roomCode);

    if (!room) {
      if (callback) callback({ found: false });
      return;
    }

    const hostPlayer = authManager.getPlayer(room.hostPlayerId);
    if (callback) {
      callback({
        found: true,
        expired: room.isExpired(),
        full: room.isFull(),
        hostUsername: hostPlayer?.username
      });
    }
  });
}
