import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useMatchState } from '../../hooks/useMatchState';
import FighterSprite from '../../components/arena/FighterSprite';
import HealthBar from '../../components/arena/HealthBar';
import AttackEffect from '../../components/arena/AttackEffect';
import BlockEffect from '../../components/arena/BlockEffect';
import DamageNumber from '../../components/arena/DamageNumber';
import ActionButtons from './ActionButtons';
import { MatchEvent } from '../../../../shared/types/match';

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 400;

const BattlePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { matchState, isLoading } = useMatchState({
    matchId,
    onMatchEnd: (endResults) => {
      // Navigate to results page after a short delay
      setTimeout(() => {
        navigate(`/results/${matchId}`, { state: { results: endResults } });
      }, 2000);
    }
  });

  const [effects, setEffects] = useState<Array<{ id: string; event: MatchEvent }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; damage: number; x: number; y: number; blocked?: boolean }>>([]);

  // Handle match events for visual effects
  useEffect(() => {
    if (!matchState?.lastEvent) return;

    const event = matchState.lastEvent;
    const effectId = `${Date.now()}-${Math.random()}`;

    // Add effect
    setEffects(prev => [...prev, { id: effectId, event }]);

    // Add damage number if applicable
    if (event.damage && event.position) {
      const damageId = `damage-${Date.now()}-${Math.random()}`;
      setDamageNumbers(prev => [...prev, {
        id: damageId,
        damage: event.damage!,
        x: event.position!.x * 40, // Convert to pixels
        y: event.position!.y * 40,
        blocked: event.type === 'BLOCK'
      }]);
    }
  }, [matchState?.lastEvent]);

  if (isLoading || !matchState) {
    return (
      <LoadingContainer>
        <LoadingText>Loading Battle...</LoadingText>
      </LoadingContainer>
    );
  }

  const removeEffect = (id: string) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  const removeDamageNumber = (id: string) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  return (
    <Container>
      <MatchInfo>
        <InfoLeft>
          <PlayerName>{matchState.fighterA.username}</PlayerName>
          <HealthBar
            current={matchState.fighterA.health}
            max={matchState.fighterA.maxHealth}
            side="left"
            takingDamage={matchState.lastEvent?.target === matchState.fighterA.playerId}
          />
        </InfoLeft>
        
        <MatchStats>
          <StatItem>Tick: {matchState.tick}</StatItem>
          <StatItem>Duration: {Math.floor(matchState.duration / 1000)}s</StatItem>
          {matchState.spectatorCount > 0 && (
            <StatItem>👁 {matchState.spectatorCount} watching</StatItem>
          )}
        </MatchStats>
        
        <InfoRight>
          <PlayerName>{matchState.fighterB.username}</PlayerName>
          <HealthBar
            current={matchState.fighterB.health}
            max={matchState.fighterB.maxHealth}
            side="right"
            takingDamage={matchState.lastEvent?.target === matchState.fighterB.playerId}
          />
        </InfoRight>
      </MatchInfo>

      <ArenaContainer>
        <Arena>
          <GridPattern />
          <CenterLine />
          
          <FighterSprite
            fighter={matchState.fighterA}
            side="A"
          />
          
          <FighterSprite
            fighter={matchState.fighterB}
            side="B"
          />

          {effects.map(({ id, event }) => {
            if (event.type === 'ATTACK' || event.type === 'DAMAGE') {
              return event.position && (
                <AttackEffect
                  key={id}
                  x={event.position.x * 40}
                  y={event.position.y * 40}
                  onComplete={() => removeEffect(id)}
                />
              );
            }
            if (event.type === 'BLOCK') {
              return event.position && (
                <BlockEffect
                  key={id}
                  x={event.position.x * 40}
                  y={event.position.y * 40}
                  onComplete={() => removeEffect(id)}
                />
              );
            }
            return null;
          })}

          {damageNumbers.map(({ id, damage, x, y, blocked }) => (
            <DamageNumber
              key={id}
              damage={damage}
              x={x}
              y={y}
              blocked={blocked}
              onComplete={() => removeDamageNumber(id)}
            />
          ))}
        </Arena>
      </ArenaContainer>

      {matchState.phase === 'FINISHED' && (
        <FinishedOverlay>
          <FinishedText>Battle Complete!</FinishedText>
        </FinishedOverlay>
      )}

      {matchState.phase !== 'FINISHED' && matchId && (
        <ActionButtonsWrapper>
          <ActionButtons matchId={matchId} />
        </ActionButtonsWrapper>
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
  padding: 20px;
`;

const LoadingContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #0a0e27;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.div`
  color: #00ff88;
  font-size: 24px;
  font-weight: 600;
`;

const MatchInfo = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
`;

const InfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const InfoRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`;

const PlayerName = styled.div`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
`;

const MatchStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StatItem = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
`;

const ArenaContainer = styled.div`
  position: relative;
  width: ${ARENA_WIDTH}px;
  height: ${ARENA_HEIGHT}px;
  border: 3px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(0, 255, 136, 0.2),
    inset 0 0 30px rgba(0, 0, 0, 0.5);
`;

const Arena = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0f1535 0%, #1a1f45 100%);
`;

const GridPattern = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
`;

const CenterLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(0, 212, 255, 0.5),
    transparent
  );
  transform: translateX(-50%);
`;

const FinishedOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;

const ActionButtonsWrapper = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 1000px;
`;

const FinishedText = styled.div`
  color: #00ff88;
  font-size: 48px;
  font-weight: 700;
  text-shadow: 
    0 0 20px rgba(0, 255, 136, 0.8),
    0 4px 12px rgba(0, 0, 0, 0.8);
  animation: pulse 1s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

export default BattlePage;
