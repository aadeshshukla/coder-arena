import React from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

interface HealthBarProps {
  current: number;
  max: number;
  side: 'left' | 'right';
  takingDamage?: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, side, takingDamage }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const widthSpring = useSpring({
    width: `${percentage}%`,
    config: { tension: 180, friction: 20 }
  });
  
  const glowSpring = useSpring({
    opacity: takingDamage ? 1 : 0,
    config: { duration: 200 }
  });

  const getColor = (percent: number): string => {
    if (percent > 60) return '#00ff88';
    if (percent > 30) return '#ffaa00';
    return '#ff3366';
  };

  return (
    <Container $side={side}>
      <HealthBarBG>
        <HealthBarFill style={widthSpring} $color={getColor(percentage)} />
        <GlowEffect style={glowSpring} $color={getColor(percentage)} />
      </HealthBarBG>
      <HealthText>
        {Math.max(0, Math.round(current))} / {max}
      </HealthText>
    </Container>
  );
};

const Container = styled.div<{ $side: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$side === 'left' ? 'flex-start' : 'flex-end'};
  gap: 4px;
`;

const HealthBarBG = styled.div`
  position: relative;
  width: 250px;
  height: 30px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  overflow: hidden;
`;

const HealthBarFill = styled(animated.div)<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${props => props.$color};
  box-shadow: 0 0 10px ${props => props.$color};
  transition: background 0.3s ease;
`;

const GlowEffect = styled(animated.div)<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.$color};
  filter: blur(10px);
  pointer-events: none;
`;

const HealthText = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

export default HealthBar;
