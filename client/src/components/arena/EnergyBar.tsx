import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface EnergyBarProps {
  energy: number;
  maxEnergy: number;
  side: 'left' | 'right';
}

const SEGMENT_COUNT = 5;

const EnergyBar: React.FC<EnergyBarProps> = ({ energy, maxEnergy, side }) => {
  const percentage = maxEnergy > 0 ? Math.max(0, Math.min(1, energy / maxEnergy)) : 0;
  const isFull = percentage >= 1;

  return (
    <Container $side={side}>
      <Label>ENERGY</Label>
      <BarTrack>
        {Array.from({ length: SEGMENT_COUNT }, (_, i) => {
          const threshold = (i + 1) / SEGMENT_COUNT;
          const filled = percentage >= threshold - 0.01;
          return (
            <Segment key={i} $filled={filled} $full={isFull} $index={i} />
          );
        })}
      </BarTrack>
    </Container>
  );
};

/* ─── Animations ─────────────────────────────────────────────────────────── */

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 6px rgba(0, 150, 255, 0.6), inset 0 0 4px rgba(0, 150, 255, 0.3); }
  50%       { box-shadow: 0 0 14px rgba(120, 60, 255, 0.9), inset 0 0 8px rgba(120, 60, 255, 0.5); }
`;

/* ─── Styled components ─────────────────────────────────────────────────── */

const Container = styled.div<{ $side: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $side }) => ($side === 'left' ? 'flex-start' : 'flex-end')};
  gap: 3px;
`;

const Label = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: rgba(100, 180, 255, 0.7);
  text-transform: uppercase;
`;

const BarTrack = styled.div`
  display: flex;
  gap: 3px;
`;

const Segment = styled.div<{ $filled: boolean; $full: boolean; $index: number }>`
  width: 34px;
  height: 10px;
  border-radius: 3px;
  border: 1px solid rgba(80, 120, 255, 0.35);
  background: ${({ $filled }) =>
    $filled
      ? 'linear-gradient(135deg, #0070ff, #7b00ff)'
      : 'rgba(0, 0, 0, 0.4)'};
  transition: background 0.2s ease, box-shadow 0.2s ease;

  ${({ $filled, $full }) =>
    $filled &&
    css`
      box-shadow: 0 0 6px rgba(0, 150, 255, 0.6), inset 0 0 4px rgba(0, 150, 255, 0.3);
      ${$full &&
        css`
          animation: ${glow} 1.2s ease-in-out infinite;
        `}
    `}
`;

export default EnergyBar;
