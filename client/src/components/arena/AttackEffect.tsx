import React, { useState } from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

interface AttackEffectProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

const AttackEffect: React.FC<AttackEffectProps> = ({ x, y, onComplete }) => {
  const [show, setShow] = useState(true);

  const slashSpring = useSpring({
    from: { 
      opacity: 1,
      scale: 0.5,
      rotate: -45
    },
    to: { 
      opacity: 0,
      scale: 1.5,
      rotate: 0
    },
    config: { duration: 300 },
    onRest: () => {
      setShow(false);
      onComplete?.();
    }
  });

  if (!show) return null;

  return (
    <Container style={{ left: x, top: y }}>
      <SlashEffect style={slashSpring} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <Particle key={i} $angle={i * 45} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  pointer-events: none;
  z-index: 99;
`;

const SlashEffect = styled(animated.div)`
  position: absolute;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #ffaa00, #ff6600, transparent);
  box-shadow: 0 0 20px #ff6600;
  border-radius: 2px;
  top: 50%;
  left: 50%;
  transform-origin: center;
`;

const Particle = styled.div<{ $angle: number }>`
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffaa00;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-burst 300ms ease-out forwards;
  transform: rotate(${props => props.$angle}deg);
  box-shadow: 0 0 6px #ff6600;

  @keyframes particle-burst {
    from {
      transform: rotate(${props => props.$angle}deg) translateX(0);
      opacity: 1;
    }
    to {
      transform: rotate(${props => props.$angle}deg) translateX(30px);
      opacity: 0;
    }
  }
`;

export default AttackEffect;
