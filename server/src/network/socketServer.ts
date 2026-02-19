import { Server as SocketIOServer } from 'socket.io';
import { MatchState } from '../engine/types';
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
let currentMatchState: MatchState | null = null;
let authManager: AuthManager | null = null;
let lobbyManager: LobbyManager | null = null;
let matchmakingManager: MatchmakingManager | null = null;
let matchManager: MatchManager | null = null;
let spectatorManager: SpectatorManager | null = null;
let rematchManager: RematchManager | null = null;
let actionManager: ActionManager | null = null;

// Throttle configuration: limit broadcasts to 10-20 per second
const MIN_BROADCAST_INTERVAL_MS = 50; // 20 broadcasts/sec max
let lastBroadcastTime = 0;

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
    
    // CRITICAL: Send current match state immediately to sync new viewer
    if (currentMatchState) {
      socket.emit('match_state', currentMatchState);
    }

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

/**
 * Broadcast match state to all connected clients
 * Throttled to prevent network flooding (max 20 broadcasts/sec)
 * Skips broadcast when no clients are connected
 */
export function broadcastMatchState(state: MatchState, winner?: string): void {
  if (!io) {
    return; // No socket server initialized, skip broadcasting
  }

  // Guard: Skip if no clients connected (prevents unnecessary serialization)
  if (io.engine.clientsCount === 0) {
    return;
  }

  // Throttle: Skip broadcast if called too frequently (unless match ended)
  const now = Date.now();
  const timeSinceLastBroadcast = now - lastBroadcastTime;
  
  if (!winner && timeSinceLastBroadcast < MIN_BROADCAST_INTERVAL_MS) {
    return; // Skip this broadcast to prevent flooding
  }
  
  lastBroadcastTime = now;

  // Build lightweight DTO with only necessary fields
  // Access nested properties once to avoid repeated lookups
  const fighterA = state.fighterA;
  const fighterB = state.fighterB;
  
  const payload = {
    tick: state.tick,
    fighterA: {
      health: fighterA.health,
      maxHealth: fighterA.maxHealth,
      position: fighterA.position,
      blocking: fighterA.blocking,
      attacking: fighterA.attacking
    },
    fighterB: {
      health: fighterB.health,
      maxHealth: fighterB.maxHealth,
      position: fighterB.position,
      blocking: fighterB.blocking,
      attacking: fighterB.attacking
    },
    ...(winner && { winner })
  };

  // Store current state for late joiners
  currentMatchState = payload as unknown as MatchState;

  // Non-blocking emit (socket.io handles async internally)
  io.emit('match_state', payload);
}
