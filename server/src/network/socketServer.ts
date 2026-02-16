import { Server as SocketIOServer } from 'socket.io';
import { MatchState } from '../engine/types';

let io: SocketIOServer | null = null;

/**
 * Initialize and start the WebSocket server
 */
export function startSocketServer(): void {
  io = new SocketIOServer(3001, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      // Optional: log disconnection
    });
  });

  console.log('WebSocket server started on port 3001');
}

/**
 * Broadcast match state to all connected clients
 */
export function broadcastMatchState(state: MatchState, winner?: string): void {
  if (!io) {
    return; // No socket server initialized, skip broadcasting
  }

  const payload = {
    tick: state.tick,
    fighterA: {
      health: state.fighterA.health,
      maxHealth: state.fighterA.maxHealth,
      position: state.fighterA.position,
      blocking: state.fighterA.blocking,
      attacking: state.fighterA.attacking
    },
    fighterB: {
      health: state.fighterB.health,
      maxHealth: state.fighterB.maxHealth,
      position: state.fighterB.position,
      blocking: state.fighterB.blocking,
      attacking: state.fighterB.attacking
    },
    ...(winner && { winner })
  };

  io.emit('match_state', payload);
}
