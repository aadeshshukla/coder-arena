import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';

interface BlockEffectProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

const BlockEffect: React.FC<BlockEffectProps> = ({ x, y, onComplete }) => {
  const [show, setShow] = useState(true);

  const bubbleSpring = useSpring({
    from: { 
      opacity: 0,
      scale: 0.5
    },
    to: [
      { opacity: 1, scale: 1.2 },
      { opacity: 0, scale: 1 }
    ],
    config: { duration: 250 },
    onRest: () => {
      setShow(false);
      onComplete?.();
    }
  });

  if (!show) return null;

  return (
    <ShieldBubble 
      style={{ 
        left: x - 40, 
        top: y - 40,
        opacity: bubbleSpring.opacity,
        transform: bubbleSpring.scale.to(s => `scale(${s})`)
      }} 
    />
  );
};

const ShieldBubble = styled(animated.div)`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent);
  border: 3px solid rgba(0, 212, 255, 0.8);
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.6),
    inset 0 0 20px rgba(0, 212, 255, 0.4);
  pointer-events: none;
  z-index: 99;
`;

export default BlockEffect;
