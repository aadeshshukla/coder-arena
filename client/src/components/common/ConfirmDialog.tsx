import React from 'react';
import styled from 'styled-components';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onCancel}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
          <ConfirmButton onClick={onConfirm} $variant={variant}>
            {confirmText}
          </ConfirmButton>
        </ButtonGroup>
      </Container>
    </Overlay>
  );
}

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
`;

const Container = styled.div`
  background: #1a1f3a;
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h3`
  color: #00ff88;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 1rem;
`;

const Message = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.5;
  margin: 0 0 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ConfirmButton = styled(Button)<{ $variant: string }>`
  background: ${props => {
    switch (props.$variant) {
      case 'danger': return '#ff3366';
      case 'warning': return '#ffaa00';
      default: return '#00ff88';
    }
  }};
  color: #0a0e27;
  border-color: transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => {
      switch (props.$variant) {
        case 'danger': return 'rgba(255, 51, 102, 0.4)';
        case 'warning': return 'rgba(255, 170, 0, 0.4)';
        default: return 'rgba(0, 255, 136, 0.4)';
      }
    }};
  }
`;
