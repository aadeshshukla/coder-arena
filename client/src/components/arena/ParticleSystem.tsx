import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

interface ParticleSystemProps {
  type: 'ambient' | 'impact' | 'energy';
  count?: number;
}

interface ParticleData {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ type, count }) => {
  const particleCount = count ?? (type === 'ambient' ? 20 : type === 'energy' ? 12 : 10);

  const particles: ParticleData[] = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: (i * 37 + 13) % 100,
        top: (i * 53 + 7) % 80,
        size: 1 + (i % 4),
        duration: 3 + (i % 5),
        delay: (i * 0.3) % 4,
        opacity: 0.3 + (i % 5) * 0.1,
      })),
    [particleCount],
  );

  return (
    <ParticleRoot>
      {particles.map(p => (
        <Particle
          key={p.id}
          $type={type}
          $left={p.left}
          $top={p.top}
          $size={p.size}
          $duration={p.duration}
          $delay={p.delay}
          $opacity={p.opacity}
        />
      ))}
    </ParticleRoot>
  );
};

/* ─── Animations ─────────────────────────────────────────────────────────── */

const floatUp = keyframes`
  0%   { transform: translateY(0)     translateX(0)    scale(1);   opacity: var(--p-opacity); }
  50%  { transform: translateY(-40px) translateX(8px)  scale(1.3); opacity: calc(var(--p-opacity) * 1.5); }
  100% { transform: translateY(-80px) translateX(-4px) scale(0.5); opacity: 0; }
`;

const energyTrail = keyframes`
  0%   { transform: translateX(0)    scale(1);   opacity: var(--p-opacity); }
  50%  { transform: translateX(15px) scale(1.4); opacity: calc(var(--p-opacity) * 2); }
  100% { transform: translateX(30px) scale(0.4); opacity: 0; }
`;

const sparkle = keyframes`
  0%, 100% { transform: scale(0); opacity: 0; }
  20%       { transform: scale(1.5); opacity: 1; }
  80%       { transform: scale(0.8); opacity: 0.5; }
`;

/* ─── Styled components ─────────────────────────────────────────────────── */

const ParticleRoot = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const Particle = styled.div<{
  $type: string;
  $left: number;
  $top: number;
  $size: number;
  $duration: number;
  $delay: number;
  $opacity: number;
}>`
  position: absolute;
  will-change: transform, opacity;
  border-radius: 50%;
  --p-opacity: ${({ $opacity }) => $opacity};

  left: ${({ $left }) => $left}%;
  top: ${({ $top }) => $top}%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;

  background: ${({ $type }) => {
    switch ($type) {
      case 'energy': return 'radial-gradient(circle, #00d4ff, #7b00ff)';
      case 'impact': return 'radial-gradient(circle, #ffaa00, #ff4400)';
      default:       return 'radial-gradient(circle, #00d4ff, rgba(0,212,255,0.2))';
    }
  }};

  box-shadow: 0 0 ${({ $size }) => $size * 2}px ${({ $type }) => {
    switch ($type) {
      case 'energy': return 'rgba(0, 212, 255, 0.7)';
      case 'impact': return 'rgba(255, 170, 0, 0.7)';
      default:       return 'rgba(0, 212, 255, 0.4)';
    }
  }};

  animation: ${({ $type }) => {
    switch ($type) {
      case 'energy': return energyTrail;
      case 'impact': return sparkle;
      default:       return floatUp;
    }
  }}
    ${({ $duration }) => $duration}s
    ease-in-out
    ${({ $delay }) => $delay}s
    infinite;
`;

export default React.memo(ParticleSystem);
