import React from 'react';
import styled, { keyframes } from 'styled-components';

interface ArenaBackgroundProps {
  theme?: 'cyber' | 'dojo' | 'space' | 'neon';
}

const ArenaBackground: React.FC<ArenaBackgroundProps> = ({ theme = 'cyber' }) => {
  return (
    <BackgroundRoot $theme={theme}>
      {theme === 'cyber' && (
        <>
          <GridOverlay />
          <NeonLine $top="20%" $delay="0s" />
          <NeonLine $top="50%" $delay="0.5s" />
          <NeonLine $top="80%" $delay="1s" />
          <HexGrid />
          {[...Array(6)].map((_, i) => (
            <HexParticle key={i} $index={i} />
          ))}
        </>
      )}
      {theme === 'dojo' && (
        <>
          <DojoFloor />
          <DojoScreen />
          {[...Array(4)].map((_, i) => (
            <DojoDust key={i} $index={i} />
          ))}
        </>
      )}
      {theme === 'space' && (
        <>
          {[...Array(40)].map((_, i) => (
            <Star key={i} $index={i} />
          ))}
          <Nebula />
          {[...Array(3)].map((_, i) => (
            <Asteroid key={i} $index={i} />
          ))}
        </>
      )}
      {theme === 'neon' && (
        <>
          <NeonGrid />
          {[...Array(4)].map((_, i) => (
            <ElectricArc key={i} $index={i} />
          ))}
          <NeonGlow />
        </>
      )}
      <GroundArea $theme={theme} />
    </BackgroundRoot>
  );
};

/* ─── Animations ─────────────────────────────────────────────────────────── */

const pulseLine = keyframes`
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.5; }
`;

const floatParticle = keyframes`
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-30px) translateX(10px) scale(1.2); opacity: 1; }
  100% { transform: translateY(-60px) translateX(-5px) scale(0.8); opacity: 0; }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
`;

const drift = keyframes`
  0% { transform: translateX(0) translateY(0) rotate(0deg); }
  100% { transform: translateX(-200px) translateY(50px) rotate(180deg); }
`;

const arcFlash = keyframes`
  0%, 90%, 100% { opacity: 0; }
  95% { opacity: 1; }
`;

const neonPulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
`;

const dustFloat = keyframes`
  0% { transform: translateY(0) translateX(0); opacity: 0.4; }
  100% { transform: translateY(-80px) translateX(20px); opacity: 0; }
`;

/* ─── Shared ─────────────────────────────────────────────────────────────── */

const BackgroundRoot = styled.div<{ $theme: string }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: ${({ $theme }) => {
    switch ($theme) {
      case 'dojo': return 'linear-gradient(180deg, #3d2b1f 0%, #5c3d28 60%, #7a5035 100%)';
      case 'space': return 'linear-gradient(180deg, #000510 0%, #050a20 50%, #0a0520 100%)';
      case 'neon': return 'linear-gradient(180deg, #000000 0%, #050510 100%)';
      default: return 'linear-gradient(180deg, #060b28 0%, #0d1545 60%, #111a55 100%)';
    }
  }};
`;

const GroundArea = styled.div<{ $theme: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: ${({ $theme }) => {
    switch ($theme) {
      case 'dojo': return 'linear-gradient(180deg, transparent, rgba(90, 60, 30, 0.8))';
      case 'space': return 'linear-gradient(180deg, transparent, rgba(20, 10, 60, 0.9))';
      case 'neon': return 'linear-gradient(180deg, transparent, rgba(0, 0, 20, 0.95))';
      default: return 'linear-gradient(180deg, transparent, rgba(0, 10, 40, 0.9))';
    }
  }};
  border-top: 1px solid ${({ $theme }) => {
    switch ($theme) {
      case 'dojo': return 'rgba(180, 120, 60, 0.4)';
      case 'space': return 'rgba(80, 40, 160, 0.4)';
      case 'neon': return 'rgba(0, 255, 255, 0.4)';
      default: return 'rgba(0, 212, 255, 0.2)';
    }
  }};
`;

/* ─── Cyber theme ────────────────────────────────────────────────────────── */

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.06) 1px, transparent 1px);
  background-size: 40px 40px;
`;

const NeonLine = styled.div<{ $top: string; $delay: string }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ $top }) => $top};
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent);
  animation: ${pulseLine} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const HexGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    60deg,
    rgba(0, 212, 255, 0.04) 0px,
    rgba(0, 212, 255, 0.04) 1px,
    transparent 1px,
    transparent 30px
  );
`;

const HexParticle = styled.div<{ $index: number }>`
  position: absolute;
  width: 6px;
  height: 6px;
  background: #00d4ff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00d4ff;
  left: ${({ $index }) => 10 + $index * 16}%;
  bottom: 35%;
  animation: ${floatParticle} ${({ $index }) => 2 + $index * 0.4}s ease-in-out infinite;
  animation-delay: ${({ $index }) => $index * 0.6}s;
`;

/* ─── Dojo theme ─────────────────────────────────────────────────────────── */

const DojoFloor = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
  background: repeating-linear-gradient(
    90deg,
    rgba(120, 80, 40, 0.6) 0px,
    rgba(140, 95, 50, 0.6) 60px,
    rgba(110, 75, 35, 0.6) 60px,
    rgba(110, 75, 35, 0.6) 120px
  );
`;

const DojoScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 65%;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 240, 200, 0.04) 0px,
    rgba(255, 240, 200, 0.04) 2px,
    transparent 2px,
    transparent 40px
  );
`;

const DojoDust = styled.div<{ $index: number }>`
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(200, 160, 100, 0.6);
  border-radius: 50%;
  left: ${({ $index }) => 20 + $index * 20}%;
  bottom: 30%;
  animation: ${dustFloat} ${({ $index }) => 3 + $index * 0.5}s ease-out infinite;
  animation-delay: ${({ $index }) => $index * 0.8}s;
`;

/* ─── Space theme ────────────────────────────────────────────────────────── */

const Star = styled.div<{ $index: number }>`
  position: absolute;
  width: ${({ $index }) => 1 + ($index % 3)}px;
  height: ${({ $index }) => 1 + ($index % 3)}px;
  background: white;
  border-radius: 50%;
  left: ${({ $index }) => ($index * 2.5) % 100}%;
  top: ${({ $index }) => ($index * 3.7) % 70}%;
  animation: ${twinkle} ${({ $index }) => 1.5 + ($index % 3)}s ease-in-out infinite;
  animation-delay: ${({ $index }) => ($index * 0.2) % 3}s;
`;

const Nebula = styled.div`
  position: absolute;
  width: 60%;
  height: 50%;
  top: 10%;
  left: 20%;
  background: radial-gradient(
    ellipse at center,
    rgba(80, 20, 120, 0.3) 0%,
    rgba(20, 40, 100, 0.2) 50%,
    transparent 70%
  );
  filter: blur(20px);
`;

const Asteroid = styled.div<{ $index: number }>`
  position: absolute;
  width: ${({ $index }) => 8 + $index * 4}px;
  height: ${({ $index }) => 6 + $index * 3}px;
  background: rgba(120, 110, 100, 0.7);
  border-radius: 40%;
  left: ${({ $index }) => 10 + $index * 30}%;
  top: ${({ $index }) => 5 + $index * 10}%;
  animation: ${drift} ${({ $index }) => 30 + $index * 10}s linear infinite;
`;

/* ─── Neon theme ─────────────────────────────────────────────────────────── */

const NeonGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 50px 50px;
`;

const ElectricArc = styled.div<{ $index: number }>`
  position: absolute;
  width: 2px;
  height: ${({ $index }) => 40 + $index * 20}px;
  background: linear-gradient(180deg, transparent, #00ffff, transparent);
  left: ${({ $index }) => 15 + $index * 25}%;
  top: 20%;
  box-shadow: 0 0 8px #00ffff, 0 0 16px rgba(0, 255, 255, 0.5);
  animation: ${arcFlash} ${({ $index }) => 1 + $index * 0.3}s ease-in-out infinite;
  animation-delay: ${({ $index }) => $index * 0.4}s;
`;

const NeonGlow = styled.div`
  position: absolute;
  bottom: 30%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, #ff00ff, transparent);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4);
  animation: ${neonPulse} 2s ease-in-out infinite;
`;

export default ArenaBackground;
