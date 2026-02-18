import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  blocked?: boolean;
  onComplete?: () => void;
}

const DamageNumber: React.FC<DamageNumberProps> = ({ damage, x, y, blocked, onComplete }) => {
  const [show, setShow] = useState(true);

  const springs = useSpring({
    from: { 
      opacity: 1, 
      y: 0,
      scale: 1.5
    },
    to: { 
      opacity: 0, 
      y: -60,
      scale: 1
    },
    config: { duration: 1000 },
    onRest: () => {
      setShow(false);
      onComplete?.();
    }
  });

  if (!show) return null;

  return (
    <Container
      style={{
        left: x,
        top: y,
        transform: springs.y.to(v => `translateY(${v}px) scale(${springs.scale.get()})`),
        opacity: springs.opacity
      }}
      $blocked={blocked}
    >
      {blocked ? '-' : ''}{damage}
    </Container>
  );
};

const Container = styled(animated.div)<{ $blocked?: boolean }>`
  position: absolute;
  color: ${props => props.$blocked ? '#00ffff' : '#ff3366'};
  font-size: 24px;
  font-weight: bold;
  text-shadow: 
    0 0 10px ${props => props.$blocked ? '#00ffff' : '#ff3366'},
    0 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  z-index: 100;
  user-select: none;
`;

export default DamageNumber;
