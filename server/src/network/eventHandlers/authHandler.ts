import { Socket } from 'socket.io';
import { AuthManager } from '../../managers/AuthManager';
import { LobbyManager } from '../../managers/LobbyManager';
import { 
  AuthLoginRequest, 
  AuthLoginResponse, 
  AuthValidateRequest, 
  AuthValidateResponse 
} from '../../../shared/types/events';

export function registerAuthHandlers(
  socket: Socket,
  authManager: AuthManager,
  lobbyManager: LobbyManager
): void {
  
  /**
   * Handle user login
   */
  socket.on('auth:login', (data: AuthLoginRequest, callback: (response: AuthLoginResponse) => void) => {
    const { username } = data;
    
    const result = authManager.login(username, socket.id);
    
    if (result.success && result.token && result.player) {
      callback({
        success: true,
        token: result.token,
        player: result.player.toPublicData()
      });
      console.log(`User ${username} logged in successfully`);
    } else {
      callback({
        success: false,
        error: result.error || 'Login failed'
      });
    }
  });

  /**
   * Handle token validation (for reconnection)
   */
  socket.on('auth:validate', (data: AuthValidateRequest, callback: (response: AuthValidateResponse) => void) => {
    const { token } = data;
    
    const result = authManager.validateToken(token);
    
    if (result.success && result.player) {
      // Update socket ID for reconnection
      authManager.updateSocketId(result.player.id, socket.id);
      
      callback({
        success: true,
        player: result.player.toPublicData()
      });
      console.log(`User ${result.player.username} validated token and reconnected`);
    } else {
      callback({
        success: false,
        error: result.error || 'Token validation failed'
      });
    }
  });

  /**
   * Handle user logout
   */
  socket.on('auth:logout', () => {
    const player = authManager.getPlayerBySocketId(socket.id);
    if (player) {
      lobbyManager.leaveLobby(player.id);
      authManager.logout(player.id);
      console.log(`User ${player.username} logged out`);
      
      // Broadcast lobby update
      lobbyManager.broadcastLobbyUpdate(authManager.getAllPlayers());
    }
  });

  /**
   * Handle disconnection
   */
  socket.on('disconnect', () => {
    const player = authManager.getPlayerBySocketId(socket.id);
    if (player) {
      lobbyManager.leaveLobby(player.id);
      authManager.logout(player.id);
      console.log(`User ${player.username} disconnected`);
      
      // Broadcast lobby update
      lobbyManager.broadcastLobbyUpdate(authManager.getAllPlayers());
    }
  });
}
