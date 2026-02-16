import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Position {
  x: number;
  y: number;
}

export interface Fighter {
  health: number;
  maxHealth: number;
  position: Position;
  blocking: boolean;
  attacking: boolean;
}

export interface MatchState {
  fighterA: Fighter;
  fighterB: Fighter;
  tick: number;
  winner?: string;
}

export interface ArenaState {
  matchState: MatchState | null;
  isConnected: boolean;
  isConnecting: boolean;
}

const SOCKET_URL = 'ws://localhost:3001';

export function useArenaState(): ArenaState {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // Create socket connection
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: Infinity
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to arena server');
      setIsConnected(true);
      setIsConnecting(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from arena server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnecting(false);
    });

    // Match state updates
    socket.on('match_state', (state: MatchState) => {
      setMatchState(state);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    matchState,
    isConnected,
    isConnecting
  };
}
