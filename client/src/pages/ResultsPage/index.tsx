import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MatchResults } from '../../../../shared/types/match';
import { useAuth } from '../../contexts/AuthContext';
import { useStatsStore } from '../../stores/statsStore';
import { useRematch } from '../../hooks/useRematch';
import { useSound } from '../../hooks/useSound';
import { checkAchievements } from '../../utils/achievements';
import RematchModal from './RematchModal';
import Tooltip from '../../components/common/Tooltip';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordMatchResult } = useStatsStore();
  const { playSound } = useSound();
  const { sendRematchRequest, rematchRequest, acceptRematch, declineRematch } = useRematch();
  
  const [showRematchModal, setShowRematchModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const results = location.state?.results as MatchResults | undefined;

  // Save match results on mount
  useEffect(() => {
    if (!results || !user) return;
    
    const isWinner = results.winnerPlayer?.id === user.id;
    const isDraw = results.winner === 'DRAW';
    const isPlayerA = results.winnerPlayer ? (results.winner === 'A' && isWinner) || (results.winner === 'B' && !isWinner) : true;
    const playerStats = isPlayerA ? results.statsA : results.statsB;
    const opponentName = isPlayerA ? 'Opponent' : 'Opponent';

    // Record match result and get updated stats
    const matchEntry = {
      matchId: results.matchId,
      opponent: opponentName,
      result: isDraw ? 'draw' : isWinner ? 'win' : 'loss',
      damageDealt: playerStats.damageDealt,
      damageTaken: playerStats.damageTaken,
      duration: results.duration,
      timestamp: Date.now()
    } as const;
    
    recordMatchResult(matchEntry);

    // Play sound
    playSound(isWinner ? 'victory' : 'defeat');

    // Check achievements with the current stats after recording
    // Note: Since Zustand updates are synchronous, stats will be updated immediately
    setTimeout(() => {
      checkAchievements(useStatsStore.getState().stats);
    }, 0);
  }, [results, user]);

  // Listen for rematch requests
  useEffect(() => {
    if (rematchRequest) {
      setShowRematchModal(true);
    }
  }, [rematchRequest]);

  if (!results) {
    return (
      <Container>
        <Message>No match results found</Message>
        <BackButton onClick={() => navigate('/lobby')}>Back to Lobby</BackButton>
      </Container>
    );
  }

  // Determine if current user is player A or B based on winner data
  const isWinner = results.winnerPlayer?.id === user?.id;
  const isPlayerA = results.winnerPlayer ? (results.winner === 'A' && isWinner) || (results.winner === 'B' && !isWinner) : true;
  const won = (isPlayerA && results.winner === 'A') || (!isPlayerA && results.winner === 'B');
  const playerStats = isPlayerA ? results.statsA : results.statsB;
  const opponentStats = isPlayerA ? results.statsB : results.statsA;
  const playerHealth = isPlayerA ? results.finalHealthA : results.finalHealthB;
  const opponentHealth = isPlayerA ? results.finalHealthB : results.finalHealthA;

  const handleRematch = () => {
    if (results.winnerPlayer) {
      const opponentId = results.winnerPlayer.id === user?.id 
        ? results.loserPlayer?.id 
        : results.winnerPlayer.id;
      if (opponentId) {
        sendRematchRequest(opponentId);
      }
    }
  };

  const handleShare = async () => {
    const shareText = `I just ${won ? 'won' : 'lost'} in Coder Arena! ${Math.round(playerStats.damageDealt)} damage dealt in ${Math.floor(results.duration / 1000)}s`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <Container>
      <Banner $won={won}>
        {results.winner === 'DRAW' ? '🤝 DRAW!' : won ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
      </Banner>

      <StatsContainer>
        <StatsColumn>
          <ColumnTitle>You</ColumnTitle>
          <HealthDisplay>
            Final HP: {Math.max(0, Math.round(playerHealth))}/100
          </HealthDisplay>
          <HealthBarContainer>
            <HealthBarFill 
              $width={(playerHealth / 100) * 100}
              $color={playerHealth > 60 ? '#00ff88' : playerHealth > 30 ? '#ffaa00' : '#ff3366'}
            />
          </HealthBarContainer>

          <StatsList>
            <StatRow>
              <StatLabel>⚔️ Attacks Landed:</StatLabel>
              <StatValue>{playerStats.attacksLanded}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>🛡️ Blocks Used:</StatLabel>
              <StatValue>{playerStats.blocksUsed}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>💥 Damage Dealt:</StatLabel>
              <StatValue>{Math.round(playerStats.damageDealt)}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>💔 Damage Taken:</StatLabel>
              <StatValue>{Math.round(playerStats.damageTaken)}</StatValue>
            </StatRow>
          </StatsList>
        </StatsColumn>

        <VsColumn>
          <VsText>VS</VsText>
          <DurationText>⏱️ {Math.floor(results.duration / 1000)}s</DurationText>
          <TickText>{results.tickCount} ticks</TickText>
        </VsColumn>

        <StatsColumn>
          <ColumnTitle>Opponent</ColumnTitle>
          <HealthDisplay>
            Final HP: {Math.max(0, Math.round(opponentHealth))}/100
          </HealthDisplay>
          <HealthBarContainer>
            <HealthBarFill 
              $width={(opponentHealth / 100) * 100}
              $color={opponentHealth > 60 ? '#00ff88' : opponentHealth > 30 ? '#ffaa00' : '#ff3366'}
            />
          </HealthBarContainer>

          <StatsList>
            <StatRow>
              <StatLabel>⚔️ Attacks Landed:</StatLabel>
              <StatValue>{opponentStats.attacksLanded}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>🛡️ Blocks Used:</StatLabel>
              <StatValue>{opponentStats.blocksUsed}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>💥 Damage Dealt:</StatLabel>
              <StatValue>{Math.round(opponentStats.damageDealt)}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>💔 Damage Taken:</StatLabel>
              <StatValue>{Math.round(opponentStats.damageTaken)}</StatValue>
            </StatRow>
          </StatsList>
        </StatsColumn>
      </StatsContainer>

      <ActionButtons>
        <Tooltip content="Challenge opponent to a rematch">
          <ActionButton onClick={handleRematch} $variant="primary">
            🔄 Rematch
          </ActionButton>
        </Tooltip>
        <Tooltip content={shareSuccess ? "Copied!" : "Share your results"}>
          <ActionButton onClick={handleShare} $variant="secondary">
            📤 {shareSuccess ? 'Copied!' : 'Share'}
          </ActionButton>
        </Tooltip>
        <ActionButton onClick={() => navigate('/lobby')} $variant="tertiary">
          🏠 Back to Lobby
        </ActionButton>
      </ActionButtons>

      {/* Rematch Modal */}
      {showRematchModal && rematchRequest && (
        <RematchModal
          opponent={rematchRequest.fromUsername}
          onAccept={() => {
            acceptRematch();
            setShowRematchModal(false);
            navigate('/lobby'); // Go to lobby to wait for match
          }}
          onDecline={() => {
            declineRematch();
            setShowRematchModal(false);
          }}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #0a0e27;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 40px;
`;

const Banner = styled.div<{ $won: boolean }>`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.$won ? '#00ff88' : '#ff3366'};
  text-shadow: 
    0 0 20px ${props => props.$won ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 51, 102, 0.8)'},
    0 4px 12px rgba(0, 0, 0, 0.8);
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const Message = styled.div`
  color: #fff;
  font-size: 24px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 60px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const StatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 250px;
`;

const ColumnTitle = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin-bottom: 10px;
`;

const HealthDisplay = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;

const HealthBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HealthBarFill = styled.div<{ $width: number; $color: string }>`
  width: ${props => props.$width}%;
  height: 100%;
  background: ${props => props.$color};
  box-shadow: 0 0 10px ${props => props.$color};
  transition: width 0.3s ease, background 0.3s ease;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const StatValue = styled.div`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const VsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
`;

const VsText = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
`;

const DurationText = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
`;

const TickText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'tertiary' }>`
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$variant === 'tertiary' ? 'rgba(255, 255, 255, 0.7)' : '#fff'};
  background: ${props => {
    switch (props.$variant) {
      case 'primary': return 'rgba(0, 255, 136, 0.2)';
      case 'secondary': return 'rgba(0, 212, 255, 0.2)';
      default: return 'transparent';
    }
  }};
  border: 2px solid ${props => {
    switch (props.$variant) {
      case 'primary': return '#00ff88';
      case 'secondary': return '#00d4ff';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'primary': return 'rgba(0, 255, 136, 0.3)';
        case 'secondary': return 'rgba(0, 212, 255, 0.3)';
        default: return 'rgba(255, 255, 255, 0.1)';
      }
    }};
    box-shadow: 0 0 20px ${props => {
      switch (props.$variant) {
        case 'primary': return 'rgba(0, 255, 136, 0.5)';
        case 'secondary': return 'rgba(0, 212, 255, 0.5)';
        default: return 'rgba(255, 255, 255, 0.3)';
      }
    }};
    transform: translateY(-2px);
    color: #fff;
  }
`;

const BackButton = styled(ActionButton)``;

export default ResultsPage;
