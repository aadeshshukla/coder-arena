import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <Container $type={type} onClick={onClose}>
      <Icon>{getIcon(type)}</Icon>
      <Message>{message}</Message>
      <CloseButton onClick={onClose}>×</CloseButton>
    </Container>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
}

const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const Container = styled.div<{ $type: string }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => {
    switch (props.$type) {
      case 'success': return '#00ff88';
      case 'error': return '#ff3366';
      case 'warning': return '#ffaa00';
      default: return '#00d4ff';
    }
  }};
  color: #0a0e27;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${slideIn} 0.3s ease-out;
  z-index: 10000;
  min-width: 300px;
  max-width: 500px;
  cursor: pointer;
  
  &:hover {
    transform: translateX(-5px);
  }
`;

const Icon = styled.span`
  font-size: 1.5rem;
`;

const Message = styled.span`
  flex: 1;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    opacity: 0.7;
  }
`;
