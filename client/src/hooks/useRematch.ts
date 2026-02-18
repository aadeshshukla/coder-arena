import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

interface RematchRequest {
  fromPlayerId: string;
  fromUsername: string;
  expiresIn: number;
}

export function useRematch() {
  const { socket } = useSocket();
  const [rematchRequest, setRematchRequest] = useState<RematchRequest | null>(null);
  const [rematchSent, setRematchSent] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming rematch requests
    socket.on('rematch:request', (data: RematchRequest) => {
      setRematchRequest(data);
    });

    // Listen for rematch accepted
    socket.on('rematch:accepted', () => {
      setRematchSent(false);
      setRematchRequest(null);
    });

    // Listen for rematch declined
    socket.on('rematch:declined', () => {
      setRematchSent(false);
    });

    // Listen for rematch expired
    socket.on('rematch:expired', () => {
      setRematchSent(false);
    });

    return () => {
      socket.off('rematch:request');
      socket.off('rematch:accepted');
      socket.off('rematch:declined');
      socket.off('rematch:expired');
    };
  }, [socket]);

  const sendRematchRequest = useCallback((opponentId: string) => {
    if (!socket) return;
    socket.emit('rematch:send', { toPlayerId: opponentId });
    setRematchSent(true);
  }, [socket]);

  const acceptRematch = useCallback(() => {
    if (!socket || !rematchRequest) return;
    socket.emit('rematch:accept', { fromPlayerId: rematchRequest.fromPlayerId });
    setRematchRequest(null);
  }, [socket, rematchRequest]);

  const declineRematch = useCallback(() => {
    if (!socket || !rematchRequest) return;
    socket.emit('rematch:decline', { fromPlayerId: rematchRequest.fromPlayerId });
    setRematchRequest(null);
  }, [socket, rematchRequest]);

  return {
    rematchRequest,
    rematchSent,
    sendRematchRequest,
    acceptRematch,
    declineRematch
  };
}
