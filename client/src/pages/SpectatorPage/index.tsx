import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSocket } from '../../contexts/SocketContext';
import { MatchSummary } from '../../../../shared/types/spectator';

const SpectatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const fetchMatches = () => {
      socket.emit('match:list', (response: { matches: MatchSummary[] }) => {
        setMatches(response.matches);
        setIsLoading(false);
      });
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [socket]);

  const handleWatchMatch = (matchId: string) => {
    if (!socket) return;

    socket.emit('match:join_spectator', { matchId }, (response: { success: boolean; error?: string }) => {
      if (response.success) {
        navigate(`/battle/${matchId}`);
      } else {
        console.error('Failed to join match:', response.error);
      }
    });
  };

  if (isLoading) {
    return (
      <Container>
        <Title>Loading matches...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Live Battles</Title>
        <BackButton onClick={() => navigate('/lobby')}>
          Back to Lobby
        </BackButton>
      </Header>

      {matches.length === 0 ? (
        <NoMatches>No active matches at the moment</NoMatches>
      ) : (
        <MatchList>
          {matches.map((match) => {
            const healthPercentA = (match.healthA / match.maxHealth) * 100;
            const healthPercentB = (match.healthB / match.maxHealth) * 100;

            return (
              <MatchCard key={match.matchId}>
                <MatchHeader>
                  <PlayerNames>
                    <PlayerName>{match.playerA.username}</PlayerName>
                    <VsText>vs</VsText>
                    <PlayerName>{match.playerB.username}</PlayerName>
                  </PlayerNames>
                  <WatchButton onClick={() => handleWatchMatch(match.matchId)}>
                    👁 Watch
                  </WatchButton>
                </MatchHeader>

                <MatchStats>
                  <StatItem>Tick: {match.tick}</StatItem>
                  <StatItem>Duration: {Math.floor(match.duration / 1000)}s</StatItem>
                  <StatItem>Spectators: {match.spectatorCount}</StatItem>
                </MatchStats>

                <HealthBarsContainer>
                  <HealthBarRow>
                    <HealthBarLabel>{match.playerA.username}</HealthBarLabel>
                    <MiniHealthBar>
                      <MiniHealthFill 
                        $width={healthPercentA}
                        $color={healthPercentA > 60 ? '#00ff88' : healthPercentA > 30 ? '#ffaa00' : '#ff3366'}
                      />
                    </MiniHealthBar>
                    <HealthValue>{Math.round(match.healthA)}</HealthValue>
                  </HealthBarRow>
                  <HealthBarRow>
                    <HealthBarLabel>{match.playerB.username}</HealthBarLabel>
                    <MiniHealthBar>
                      <MiniHealthFill 
                        $width={healthPercentB}
                        $color={healthPercentB > 60 ? '#00ff88' : healthPercentB > 30 ? '#ffaa00' : '#ff3366'}
                      />
                    </MiniHealthBar>
                    <HealthValue>{Math.round(match.healthB)}</HealthValue>
                  </HealthBarRow>
                </HealthBarsContainer>
              </MatchCard>
            );
          })}
        </MatchList>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #0a0e27;
  padding: 40px 20px;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  color: #00ff88;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
`;

const BackButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const NoMatches = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  padding: 60px;
`;

const MatchList = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
`;

const MatchCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
  }
`;

const MatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const PlayerNames = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlayerName = styled.div`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const VsText = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
`;

const WatchButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 255, 136, 0.2);
  border: 2px solid #00ff88;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 136, 0.3);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
  }
`;

const MatchStats = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const StatItem = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
`;

const HealthBarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HealthBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HealthBarLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MiniHealthBar = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
`;

const MiniHealthFill = styled.div<{ $width: number; $color: string }>`
  width: ${props => props.$width}%;
  height: 100%;
  background: ${props => props.$color};
  box-shadow: 0 0 8px ${props => props.$color};
  transition: width 0.3s ease, background 0.3s ease;
`;

const HealthValue = styled.div`
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  width: 40px;
  text-align: right;
`;

export default SpectatorPage;
