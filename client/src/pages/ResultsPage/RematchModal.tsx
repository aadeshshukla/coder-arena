import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Modal from '../../components/common/Modal';

interface RematchModalProps {
  opponent: string;
  onAccept: () => void;
  onDecline: () => void;
  timeoutSeconds?: number;
}

export default function RematchModal({ 
  opponent, 
  onAccept, 
  onDecline,
  timeoutSeconds = 30 
}: RematchModalProps) {
  const [countdown, setCountdown] = useState(timeoutSeconds);

  useEffect(() => {
    if (countdown <= 0) return; // Already at 0, stop
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDecline]);

  return (
    <Modal isOpen={true} onClose={onDecline} width="500px" showCloseButton={false}>
      <Container>
        <Icon>🔄</Icon>
        <Title>Rematch Challenge!</Title>
        <Message>
          <strong>{opponent}</strong> wants a rematch!
        </Message>
        <Countdown>
          Time remaining: <span>{countdown}s</span>
        </Countdown>
        <ButtonGroup>
          <DeclineButton onClick={onDecline}>
            ❌ Decline
          </DeclineButton>
          <AcceptButton onClick={onAccept}>
            ✅ Accept Challenge
          </AcceptButton>
        </ButtonGroup>
      </Container>
    </Modal>
  );
}

const Container = styled.div`
  text-align: center;
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Title = styled.h2`
  color: #00ff88;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 1rem;
`;

const Message = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin: 0 0 1.5rem;
  
  strong {
    color: #00d4ff;
  }
`;

const Countdown = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 2rem;
  
  span {
    color: #ffaa00;
    font-weight: 700;
    font-size: 20px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
`;

const DeclineButton = styled(Button)`
  background: transparent;
  color: #ff3366;
  border-color: #ff3366;
  
  &:hover {
    background: rgba(255, 51, 102, 0.2);
    transform: translateY(-2px);
  }
`;

const AcceptButton = styled(Button)`
  background: #00ff88;
  color: #0a0e27;
  border-color: transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
  }
`;
