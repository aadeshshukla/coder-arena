import { Socket } from 'socket.io';
import { RematchManager } from '../../managers/RematchManager';

export function registerRematchHandlers(socket: Socket, rematchManager: RematchManager) {
  // Send rematch request
  socket.on('rematch:send', ({ toPlayerId }: { toPlayerId: string }) => {
    const playerId = (socket as any).playerId;
    if (!playerId) return;

    const success = rematchManager.sendRematchRequest(playerId, toPlayerId);
    if (!success) {
      socket.emit('rematch:error', { message: 'Failed to send rematch request' });
    }
  });

  // Accept rematch
  socket.on('rematch:accept', ({ fromPlayerId }: { fromPlayerId: string }) => {
    const playerId = (socket as any).playerId;
    if (!playerId) return;

    const success = rematchManager.acceptRematch(playerId, fromPlayerId);
    if (!success) {
      socket.emit('rematch:error', { message: 'Rematch request expired or not found' });
    }
  });

  // Decline rematch
  socket.on('rematch:decline', ({ fromPlayerId }: { fromPlayerId: string }) => {
    const playerId = (socket as any).playerId;
    if (!playerId) return;

    rematchManager.declineRematch(playerId, fromPlayerId);
  });
}
