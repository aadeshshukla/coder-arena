import { ReactNode, useState } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Container
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <TooltipBox $position={position}>
          {content}
          <Arrow $position={position} />
        </TooltipBox>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipBox = styled.div<{ $position: string }>`
  position: absolute;
  background: rgba(10, 14, 39, 0.95);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 1000;
  border: 1px solid rgba(0, 255, 136, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  
  ${props => {
    switch (props.$position) {
      case 'top':
        return 'bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);';
      case 'bottom':
        return 'top: calc(100% + 8px); left: 50%; transform: translateX(-50%);';
      case 'left':
        return 'right: calc(100% + 8px); top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'left: calc(100% + 8px); top: 50%; transform: translateY(-50%);';
      default:
        return '';
    }
  }}
`;

const Arrow = styled.div<{ $position: string }>`
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  
  ${props => {
    switch (props.$position) {
      case 'top':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-top-color: rgba(10, 14, 39, 0.95);
          border-bottom: none;
        `;
      case 'bottom':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: rgba(10, 14, 39, 0.95);
          border-top: none;
        `;
      case 'left':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-left-color: rgba(10, 14, 39, 0.95);
          border-right: none;
        `;
      case 'right':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-right-color: rgba(10, 14, 39, 0.95);
          border-left: none;
        `;
      default:
        return '';
    }
  }}
`;
