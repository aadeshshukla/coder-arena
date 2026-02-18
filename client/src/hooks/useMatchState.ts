import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { BattleMatchState, MatchResults } from '../../../shared/types/match';

interface UseMatchStateOptions {
  matchId?: string;
  onMatchEnd?: (results: MatchResults) => void;
}

export function useMatchState({ matchId, onMatchEnd }: UseMatchStateOptions = {}) {
  const { socket } = useSocket();
  const [matchState, setMatchState] = useState<BattleMatchState | null>(null);
  const [results, setResults] = useState<MatchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleMatchState = (state: BattleMatchState) => {
      // Only update if it's the match we're watching
      if (!matchId || state.matchId === matchId) {
        setMatchState(state);
        setIsLoading(false);
      }
    };

    const handleMatchEnded = (endResults: MatchResults) => {
      if (!matchId || endResults.matchId === matchId) {
        setResults(endResults);
        if (onMatchEnd) {
          onMatchEnd(endResults);
        }
      }
    };

    socket.on('match:state', handleMatchState);
    socket.on('match:ended', handleMatchEnded);

    return () => {
      socket.off('match:state', handleMatchState);
      socket.off('match:ended', handleMatchEnded);
    };
  }, [socket, matchId, onMatchEnd]);

  return {
    matchState,
    results,
    isLoading
  };
}
