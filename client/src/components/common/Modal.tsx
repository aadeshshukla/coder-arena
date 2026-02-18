import { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = '500px',
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()} $width={width}>
        {showCloseButton && (
          <CloseButton onClick={onClose}>×</CloseButton>
        )}
        {title && <Title>{title}</Title>}
        <Content>{children}</Content>
      </Container>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Container = styled.div<{ $width: string }>`
  background: #1a1f3a;
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: ${props => props.$width};
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  position: relative;
  animation: ${scaleIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
  
  &:hover {
    color: #fff;
  }
`;

const Title = styled.h2`
  color: #00ff88;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Content = styled.div`
  padding: 2rem;
  color: #fff;
`;
