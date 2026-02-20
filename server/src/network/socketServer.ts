import { Server as SocketIOServer } from 'socket.io';
import { AuthManager } from '../managers/AuthManager';
import { LobbyManager } from '../managers/LobbyManager';
import { MatchmakingManager } from '../managers/MatchmakingManager';
import { MatchManager } from '../managers/MatchManager';
import { SpectatorManager } from '../managers/SpectatorManager';
import { RematchManager } from '../managers/RematchManager';
import { ActionManager } from '../managers/ActionManager';
import { registerAuthHandlers } from './eventHandlers/authHandler';
import { registerLobbyHandlers } from './eventHandlers/lobbyHandler';
import { registerMatchmakingHandlers } from './eventHandlers/matchmakingHandler';
import { registerMatchHandlers } from './eventHandlers/matchHandler';
import { registerSpectatorHandlers } from './eventHandlers/spectatorHandler';
import { registerRematchHandlers } from './eventHandlers/rematchHandler';

let io: SocketIOServer | null = null;
let authManager: AuthManager | null = null;
let lobbyManager: LobbyManager | null = null;
let matchmakingManager: MatchmakingManager | null = null;
let matchManager: MatchManager | null = null;
let spectatorManager: SpectatorManager | null = null;
let rematchManager: RematchManager | null = null;
let actionManager: ActionManager | null = null;

/**
 * Initialize and start the WebSocket server
 */
export function startSocketServer(): void {
  io = new SocketIOServer(3001, {
    cors: {
      origin: "*", // Allow all origins for development/demo purposes
      methods: ["GET", "POST"]
    }
  });

  // Initialize managers
  authManager = new AuthManager();
  lobbyManager = new LobbyManager(io, authManager);
  matchmakingManager = new MatchmakingManager(io, authManager);
  actionManager = new ActionManager();
  matchManager = new MatchManager(io, authManager, actionManager);
  spectatorManager = new SpectatorManager(io, matchManager);
  rematchManager = new RematchManager(io);

  io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Register event handlers
    if (authManager && lobbyManager && matchmakingManager && matchManager && spectatorManager && rematchManager) {
      registerAuthHandlers(socket, authManager, lobbyManager);
      registerLobbyHandlers(socket, authManager, lobbyManager);
      registerMatchmakingHandlers(socket, authManager, matchmakingManager, matchManager);
      registerMatchHandlers(socket, authManager, matchManager, actionManager ?? undefined);
      registerSpectatorHandlers(socket, matchManager, spectatorManager);
      registerRematchHandlers(socket, rematchManager);
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      // Socket.io automatically cleans up socket references
      // No manual cleanup needed as we don't store socket references
    });
  });

  console.log('WebSocket server started on port 3001');
}
