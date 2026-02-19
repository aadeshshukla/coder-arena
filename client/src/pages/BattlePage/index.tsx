import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useMatchState } from '../../hooks/useMatchState';
import FighterSprite from '../../components/arena/FighterSprite';
import HealthBar from '../../components/arena/HealthBar';
import AttackEffect from '../../components/arena/AttackEffect';
import BlockEffect from '../../components/arena/BlockEffect';
import DamageNumber from '../../components/arena/DamageNumber';
import ArenaBackground from '../../components/arena/ArenaBackground';
import ParticleSystem from '../../components/arena/ParticleSystem';
import EnergyBar from '../../components/arena/EnergyBar';
import ActionPanel from '../../components/battle/ActionPanel';
import { MatchEvent } from '../../../../shared/types/match';

const ARENA_WIDTH = 1000;
const ARENA_HEIGHT = 500;
const MAX_COOLDOWN_MS = 1000; // proxy for max energy

const BattlePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { matchState, isLoading } = useMatchState({
    matchId,
    onMatchEnd: (endResults) => {
      setTimeout(() => {
        navigate(`/results/${matchId}`, { state: { results: endResults } });
      }, 2000);
    }
  });

  const [effects, setEffects] = useState<Array<{ id: string; event: MatchEvent }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; damage: number; x: number; y: number; blocked?: boolean }>>([]);
  const [combatActive, setCombatActive] = useState(false);

  useEffect(() => {
    if (!matchState?.lastEvent) return;

    const event = matchState.lastEvent;
    const effectId = `${Date.now()}-${Math.random()}`;

    setEffects(prev => [...prev, { id: effectId, event }]);
    setCombatActive(true);
    const t = setTimeout(() => setCombatActive(false), 1000);

    if (event.damage && event.position) {
      const damageId = `damage-${Date.now()}-${Math.random()}`;
      setDamageNumbers(prev => [...prev, {
        id: damageId,
        damage: event.damage!,
        x: event.position!.x * 50,
        y: event.position!.y * 50,
        blocked: event.type === 'BLOCK'
      }]);
    }

    return () => clearTimeout(t);
  }, [matchState?.lastEvent]);

  if (isLoading || !matchState) {
    return (
      <LoadingContainer>
        <LoadingText>Loading Battle...</LoadingText>
      </LoadingContainer>
    );
  }

  const removeEffect = (id: string) => setEffects(prev => prev.filter(e => e.id !== id));
  const removeDamageNumber = (id: string) => setDamageNumbers(prev => prev.filter(d => d.id !== id));

  const energyA = Math.max(0, MAX_COOLDOWN_MS - matchState.fighterA.attackCooldown);
  const energyB = Math.max(0, MAX_COOLDOWN_MS - matchState.fighterB.attackCooldown);

  return (
    <Container>
      <MatchInfo>
        <InfoLeft>
          <PlayerName $side="A">{matchState.fighterA.username}</PlayerName>
          <HealthBar
            current={matchState.fighterA.health}
            max={matchState.fighterA.maxHealth}
            side="left"
            takingDamage={matchState.lastEvent?.target === matchState.fighterA.playerId}
            blocking={matchState.fighterA.blocking}
          />
          <EnergyBar energy={energyA} maxEnergy={MAX_COOLDOWN_MS} side="left" />
        </InfoLeft>

        <MatchStats>
          <VsDivider>VS</VsDivider>
          <StatItem>Tick {matchState.tick}</StatItem>
          <StatItem>{Math.floor(matchState.duration / 1000)}s</StatItem>
          {matchState.spectatorCount > 0 && (
            <StatItem>👁 {matchState.spectatorCount}</StatItem>
          )}
        </MatchStats>

        <InfoRight>
          <PlayerName $side="B">{matchState.fighterB.username}</PlayerName>
          <HealthBar
            current={matchState.fighterB.health}
            max={matchState.fighterB.maxHealth}
            side="right"
            takingDamage={matchState.lastEvent?.target === matchState.fighterB.playerId}
            blocking={matchState.fighterB.blocking}
          />
          <EnergyBar energy={energyB} maxEnergy={MAX_COOLDOWN_MS} side="right" />
        </InfoRight>
      </MatchInfo>

      <ArenaContainer $combatActive={combatActive}>
        <Arena>
          <ArenaBackground theme="cyber" />
          <ParticleSystem type="ambient" count={15} />
          <CenterLine />

          <FighterSprite fighter={matchState.fighterA} side="A" />
          <FighterSprite fighter={matchState.fighterB} side="B" />

          {effects.map(({ id, event }) => {
            if (event.type === 'ATTACK' || event.type === 'DAMAGE') {
              return event.position && (
                <AttackEffect
                  key={id}
                  x={event.position.x * 50}
                  y={event.position.y * 50}
                  onComplete={() => removeEffect(id)}
                />
              );
            }
            if (event.type === 'BLOCK') {
              return event.position && (
                <BlockEffect
                  key={id}
                  x={event.position.x * 50}
                  y={event.position.y * 50}
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
          <ConfettiRow>
            {[...Array(8)].map((_, i) => <Confetti key={i} $index={i} />)}
          </ConfettiRow>
        </FinishedOverlay>
      )}

      {matchState.phase !== 'FINISHED' && matchId && (
        <ActionPanelWrapper>
          <ActionPanel matchId={matchId} />
        </ActionPanelWrapper>
      )}
    </Container>
  );
};

/* ─── Animations ─────────────────────────────────────────────────────────── */

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const confettiFall = keyframes`
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(80px)  rotate(360deg); opacity: 0; }
`;

/* ─── Styled components ─────────────────────────────────────────────────── */

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #0a0e27;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 16px;
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
  max-width: ${ARENA_WIDTH}px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
`;

const InfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
`;

const InfoRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const PlayerName = styled.div<{ $side: 'A' | 'B' }>`
  color: ${({ $side }) => ($side === 'A' ? '#00d4ff' : '#ff00ff')};
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 0 12px ${({ $side }) => ($side === 'A' ? 'rgba(0,212,255,0.6)' : 'rgba(255,0,255,0.6)')};
`;

const MatchStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const VsDivider = styled.div`
  color: #fff;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 3px;
  text-shadow: 0 0 16px rgba(255, 255, 255, 0.4);
`;

const StatItem = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
`;

const ArenaContainer = styled.div<{ $combatActive: boolean }>`
  position: relative;
  width: ${ARENA_WIDTH}px;
  height: ${ARENA_HEIGHT}px;
  border: 2px solid ${({ $combatActive }) =>
    $combatActive ? 'rgba(0,212,255,0.7)' : 'rgba(0,212,255,0.25)'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 0 ${({ $combatActive }) => ($combatActive ? '50px' : '20px')} ${({ $combatActive }) =>
    $combatActive ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.1)'},
    inset 0 0 30px rgba(0, 0, 0, 0.4);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
`;

const Arena = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const CenterLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.4), transparent);
  transform: translateX(-50%);
  z-index: 2;
  pointer-events: none;
`;

const FinishedOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const FinishedText = styled.div`
  color: #00ff88;
  font-size: 52px;
  font-weight: 900;
  text-shadow:
    0 0 30px rgba(0, 255, 136, 0.9),
    0 4px 12px rgba(0, 0, 0, 0.8);
  animation: ${pulse} 1s ease-in-out infinite;
  letter-spacing: 2px;
`;

const ConfettiRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Confetti = styled.div<{ $index: number }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({ $index }) =>
    ['#00ff88', '#00d4ff', '#ff00ff', '#ffaa00', '#ff3366', '#00d4ff', '#00ff88', '#ff00ff'][$index]};
  animation: ${confettiFall} ${({ $index }) => 0.8 + ($index % 3) * 0.2}s ease-in
    ${({ $index }) => $index * 0.1}s infinite;
`;

const ActionPanelWrapper = styled.div`
  width: 100%;
  max-width: ${ARENA_WIDTH}px;
`;

export default BattlePage;

