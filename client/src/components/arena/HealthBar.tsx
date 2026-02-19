import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

interface HealthBarProps {
  current: number;
  max: number;
  side: 'left' | 'right';
  takingDamage?: boolean;
  blocking?: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, side, takingDamage, blocking }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isCritical = percentage < 20;

  // Damage ghost bar - lags behind actual health
  const [ghostPct, setGhostPct] = useState(percentage);
  const ghostPctRef = useRef(ghostPct);
  const ghostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (percentage < ghostPctRef.current) {
      // Delay ghost shrink by 600ms for dramatic effect
      if (ghostTimer.current) clearTimeout(ghostTimer.current);
      ghostTimer.current = setTimeout(() => {
        setGhostPct(percentage);
        ghostPctRef.current = percentage;
      }, 600);
    } else {
      setGhostPct(percentage);
      ghostPctRef.current = percentage;
    }
    return () => {
      if (ghostTimer.current) clearTimeout(ghostTimer.current);
    };
  }, [percentage]);

  const healthSpring = useSpring({ width: `${percentage}%`, config: { tension: 180, friction: 20 } });
  const ghostSpring = useSpring({ width: `${ghostPct}%`, config: { tension: 60, friction: 20 } });

  const getColor = (pct: number): string => {
    if (pct > 60) return '#00ff88';
    if (pct > 30) return '#ffaa00';
    return '#ff3366';
  };

  const color = getColor(percentage);

  return (
    <Container $side={side}>
      <BarRow $side={side}>
        {blocking && side === 'right' && <ShieldIcon>🛡</ShieldIcon>}
        <HealthBarBG $critical={isCritical} $color={color}>
          {/* Ghost / damage preview layer */}
          <GhostFill style={ghostSpring} />
          {/* Actual health fill */}
          <HealthFill style={healthSpring} $color={color} />
          {/* Hit flash */}
          {takingDamage && <HitFlash />}
        </HealthBarBG>
        {blocking && side === 'left' && <ShieldIcon>🛡</ShieldIcon>}
      </BarRow>
      <HealthText>
        {Math.max(0, Math.round(current))} / {max}{' '}
        <HealthPct $color={color}>{Math.round(percentage)}%</HealthPct>
      </HealthText>
    </Container>
  );
};

/* ─── Animations ─────────────────────────────────────────────────────────── */

const criticalPulse = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(255, 51, 102, 0.4); }
  50%       { box-shadow: 0 0 20px rgba(255, 51, 102, 0.9), 0 0 40px rgba(255, 51, 102, 0.4); }
`;

const hitFlash = keyframes`
  0%   { opacity: 0.7; }
  100% { opacity: 0; }
`;

/* ─── Styled components ─────────────────────────────────────────────────── */

const Container = styled.div<{ $side: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$side === 'left' ? 'flex-start' : 'flex-end'};
  gap: 4px;
`;

const BarRow = styled.div<{ $side: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-direction: ${props => props.$side === 'left' ? 'row' : 'row-reverse'};
`;

const ShieldIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.8));
`;

const HealthBarBG = styled.div<{ $critical: boolean; $color: string }>`
  position: relative;
  width: 260px;
  height: 22px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 11px;
  overflow: hidden;

  ${({ $critical }) =>
    $critical &&
    css`
      animation: ${criticalPulse} 0.8s ease-in-out infinite;
      border-color: rgba(255, 51, 102, 0.5);
    `}
`;

const GhostFill = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(220, 50, 50, 0.55);
  will-change: width;
`;

const HealthFill = styled(animated.div)<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${props =>
    props.$color === '#00ff88'
      ? 'linear-gradient(90deg, #00cc66, #00ff88)'
      : props.$color === '#ffaa00'
      ? 'linear-gradient(90deg, #ff6600, #ffaa00)'
      : 'linear-gradient(90deg, #cc0033, #ff3366)'};
  box-shadow: 0 0 8px ${props => props.$color}88;
  will-change: width;
  transition: box-shadow 0.3s ease;
`;

const HitFlash = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
  animation: ${hitFlash} 0.25s ease-out forwards;
  pointer-events: none;
`;

const HealthText = styled.div`
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
`;

const HealthPct = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 11px;
  font-weight: 700;
`;

export default HealthBar;

