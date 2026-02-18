import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { animated, useSpring } from '@react-spring/web';
import { FighterState } from '../../../../shared/types/match';

interface FighterSpriteProps {
  fighter: FighterState;
  side: 'A' | 'B';
}

const FIGHTER_WIDTH = 60;
const FIGHTER_HEIGHT = 80;
const UNITS_TO_PX_X = 40; // 800px / 20 units
const UNITS_TO_PX_Y = 40; // 400px / 10 units

const FighterSprite: React.FC<FighterSpriteProps> = ({ fighter, side }) => {
  const [prevHealth, setPrevHealth] = useState(fighter.health);
  const [isHurt, setIsHurt] = useState(false);

  // Convert game position to pixel position
  const pixelX = fighter.position.x * UNITS_TO_PX_X;
  const pixelY = fighter.position.y * UNITS_TO_PX_Y;

  // Position animation
  const positionSpring = useSpring({
    x: pixelX,
    y: pixelY,
    config: { tension: 200, friction: 20, mass: 1 }
  });

  // Idle breathing animation
  const idleSpring = useSpring({
    from: { scale: 1 },
    to: { scale: 1.05 },
    loop: true,
    config: { duration: 1500 }
  });

  // Attack animation
  const attackSpring = useSpring({
    scale: fighter.attacking ? 1.2 : 1,
    rotate: fighter.attacking ? 10 : 0,
    config: { duration: 300 }
  });

  // Block animation - pulse effect
  const blockSpring = useSpring({
    opacity: fighter.blocking ? 1 : 0,
    scale: fighter.blocking ? 1 : 0.8,
    config: { tension: 300, friction: 10 }
  });

  // Hurt flash effect
  useEffect(() => {
    if (fighter.health < prevHealth) {
      setIsHurt(true);
      setTimeout(() => setIsHurt(false), 300);
    }
    setPrevHealth(fighter.health);
  }, [fighter.health, prevHealth]);

  const color = side === 'A' ? '#00ff88' : '#00d4ff';

  return (
    <Container
      style={{
        left: positionSpring.x,
        top: positionSpring.y
      }}
    >
      <FighterBody
        style={{
          transform: attackSpring.scale.to(s => 
            `scale(${s * (fighter.attacking ? 1 : idleSpring.scale.get())}) rotateY(${side === 'A' ? 0 : 180}deg)`
          )
        }}
        $color={color}
        $hurt={isHurt}
      >
        <FighterHead />
        <FighterTorso />
        <FighterLeg $left />
        <FighterLeg />
      </FighterBody>
      
      {fighter.blocking && (
        <BlockIndicator style={blockSpring} />
      )}
      
      <NameTag>{fighter.username}</NameTag>
    </Container>
  );
};

const Container = styled(animated.div)`
  position: absolute;
  width: ${FIGHTER_WIDTH}px;
  height: ${FIGHTER_HEIGHT}px;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

const FighterBody = styled(animated.div)<{ $color: string; $hurt: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  filter: ${props => props.$hurt ? 'brightness(2) saturate(0)' : 'none'};
  transition: filter 0.15s ease;
  
  > * {
    background: ${props => props.$color};
    box-shadow: 0 0 15px ${props => props.$color}aa;
  }
`;

const FighterHead = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
`;

const FighterTorso = styled.div`
  position: absolute;
  width: 30px;
  height: 35px;
  border-radius: 5px;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
`;

const FighterLeg = styled.div<{ $left?: boolean }>`
  position: absolute;
  width: 12px;
  height: 25px;
  border-radius: 6px;
  bottom: 0;
  left: ${props => props.$left ? '15px' : '33px'};
`;

const BlockIndicator = styled(animated.div)`
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #00d4ff;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0, 212, 255, 0.2), transparent);
  pointer-events: none;
`;

const NameTag = styled.div`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
`;

export default React.memo(FighterSprite);
