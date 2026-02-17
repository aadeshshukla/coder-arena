import { Socket } from 'socket.io';
import { AuthManager } from '../../managers/AuthManager';
import { LobbyManager } from '../../managers/LobbyManager';
import { LobbyJoinRequest } from '../../../shared/types/events';

export function registerLobbyHandlers(
  socket: Socket,
  authManager: AuthManager,
  lobbyManager: LobbyManager
): void {
  
  /**
   * Handle joining the lobby
   */
  socket.on('lobby:join', (data: LobbyJoinRequest, callback?: (response: { success: boolean; error?: string }) => void) => {
    const { token } = data;
    
    // Validate token
    const result = authManager.validateToken(token);
    
    if (result.success && result.player) {
      // Add player to lobby
      lobbyManager.joinLobby(result.player, socket);
      
      // Send current lobby state to the joining player
      const lobbyState = lobbyManager.getLobbyState(authManager.getAllPlayers());
      socket.emit('lobby:update', lobbyState);
      
      // Broadcast to all other players in lobby
      lobbyManager.broadcastLobbyUpdate(authManager.getAllPlayers());
      
      if (callback) {
        callback({ success: true });
      }
    } else {
      if (callback) {
        callback({ success: false, error: 'Invalid token' });
      }
    }
  });

  /**
   * Handle leaving the lobby
   */
  socket.on('lobby:leave', () => {
    const player = authManager.getPlayerBySocketId(socket.id);
    if (player) {
      lobbyManager.leaveLobby(player.id);
      socket.leave('lobby');
      
      // Broadcast lobby update
      lobbyManager.broadcastLobbyUpdate(authManager.getAllPlayers());
    }
  });

  /**
   * Handle request for current lobby state
   */
  socket.on('lobby:request_state', () => {
    const player = authManager.getPlayerBySocketId(socket.id);
    if (player && lobbyManager.isInLobby(player.id)) {
      const lobbyState = lobbyManager.getLobbyState(authManager.getAllPlayers());
      socket.emit('lobby:update', lobbyState);
    }
  });
}
