import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

// Import managers
import { AuthManager } from './managers/AuthManager';
import { LobbyManager } from './managers/LobbyManager';
import { MatchmakingManager } from './managers/MatchmakingManager';
import { MatchManager } from './managers/MatchManager';
import { SpectatorManager } from './managers/SpectatorManager';
import { RematchManager } from './managers/RematchManager';

// Import event handlers
import { registerAuthHandlers } from './network/eventHandlers/authHandler';
import { registerLobbyHandlers } from './network/eventHandlers/lobbyHandler';
import { registerMatchmakingHandlers } from './network/eventHandlers/matchmakingHandler';
import { registerMatchHandlers } from './network/eventHandlers/matchHandler';
import { registerSpectatorHandlers } from './network/eventHandlers/spectatorHandler';
import { registerRematchHandlers } from './network/eventHandlers/rematchHandler';

const app = express();
const server = http.createServer(app);

// Configuration from environment variables
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS for client
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize managers
const authManager = new AuthManager();
const lobbyManager = new LobbyManager(io, authManager);
const matchManager = new MatchManager(io, authManager);
const matchmakingManager = new MatchmakingManager(io, authManager);
const spectatorManager = new SpectatorManager(io, matchManager);
const rematchManager = new RematchManager(io);

console.log('🎮 Coder Arena Server Starting...');
console.log('📦 Managers initialized');

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Register all event handlers
  registerAuthHandlers(socket, authManager, lobbyManager);
  registerLobbyHandlers(socket, authManager, lobbyManager);
  registerMatchmakingHandlers(socket, authManager, matchmakingManager, matchManager);
  registerMatchHandlers(socket, authManager, matchManager);
  registerSpectatorHandlers(socket, matchManager, spectatorManager);
  registerRematchHandlers(socket, rematchManager);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    const player = authManager.getPlayerBySocketId(socket.id);
    if (player) {
      lobbyManager.leaveLobby(player.id);
      matchmakingManager.leaveQueue(player.id);
      matchmakingManager.removePlayerFromRooms(player.id);
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    onlinePlayers: authManager.getAllPlayers().length,
    activeMatches: matchManager.getActiveMatchCount()
  });
});

// Start
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌐 WebSocket ready`);
  console.log(`🎯 Waiting for players...\n`);
});

