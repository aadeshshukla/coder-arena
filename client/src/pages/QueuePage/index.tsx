import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../theme';
import { useSocket } from '../../contexts/SocketContext';
import { useMatchmakingStore } from '../../stores/matchmakingStore';
import Button from '../../components/common/Button';
import { MatchFoundEvent, QueueUpdateEvent } from '../../../../shared/types/matchmaking';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const QueueCard = styled.div`
  background: ${theme.colors.bg.secondary};
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 16px;
  padding: 48px;
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  color: ${theme.colors.accent.success};
  font-size: 32px;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const SearchingText = styled.p`
  color: ${theme.colors.text.primary};
  font-size: 20px;
  margin: 0 0 32px 0;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const QueueInfo = styled.div`
  background: ${theme.colors.bg.tertiary};
  border-radius: 8px;
  padding: 24px;
  margin: 0 0 32px 0;
`;

const QueueStat = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QueueValue = styled.span`
  color: ${theme.colors.accent.blue};
  font-weight: 600;
  font-size: 18px;
  margin-left: 8px;
`;

const Timer = styled.div`
  color: ${theme.colors.text.primary};
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 32px 0;
  font-family: monospace;
`;

const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { queuePosition, queueSize, setQueuePosition, setQueueSize, setMatchId, setOpponent, reset } = useMatchmakingStore();
  const [timeInQueue, setTimeInQueue] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for queue updates
    socket.on('queue:update', (data: QueueUpdateEvent) => {
      setQueueSize(data.queueSize);
      if (data.position !== undefined) {
        setQueuePosition(data.position);
      }
    });

    // Listen for match found
    socket.on('match:found', (data: MatchFoundEvent) => {
      console.log('Match found:', data);
      setMatchId(data.matchId);
      setOpponent(data.opponent);
      navigate(`/editor/${data.matchId}`);
    });

    return () => {
      socket.off('queue:update');
      socket.off('match:found');
    };
  }, [socket, navigate, setQueuePosition, setQueueSize, setMatchId, setOpponent]);

  // Timer for time in queue
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInQueue(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    if (socket) {
      socket.emit('queue:leave');
      reset();
      navigate('/lobby');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <QueueCard>
        <Title>⚔️ Matchmaking ⚔️</Title>
        <SearchingText>Searching for opponent...</SearchingText>
        
        <Timer>{formatTime(timeInQueue)}</Timer>
        
        <QueueInfo>
          <QueueStat>
            Queue Position:
            <QueueValue>#{queuePosition + 1}</QueueValue>
          </QueueStat>
          <QueueStat>
            Players in Queue:
            <QueueValue>{queueSize}</QueueValue>
          </QueueStat>
        </QueueInfo>
        
        <Button $variant="secondary" onClick={handleCancel}>
          Cancel Search
        </Button>
      </QueueCard>
    </Container>
  );
};

export default QueuePage;
