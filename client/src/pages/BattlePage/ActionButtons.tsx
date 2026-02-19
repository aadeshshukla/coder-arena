import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSocket } from '../../contexts/SocketContext';
import { ActionButton, BattleCodeSubmitRequest, BattleCodeSubmitResponse, ActionTriggerRequest, ActionTriggerResponse } from '../../../../shared/types/actions';
import { BattleActionAvailableEvent, BattleCooldownEvent } from '../../../../shared/types/match';

interface ActionButtonsProps {
  matchId: string;
  initialActions?: ActionButton[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ matchId, initialActions = [] }) => {
  const { socket } = useSocket();
  const [actions, setActions] = useState<ActionButton[]>(initialActions);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Listen for new action buttons and cooldown updates
  useEffect(() => {
    if (!socket) return;

    const handleActionAvailable = (event: BattleActionAvailableEvent) => {
      setActions(prev => {
        const exists = prev.find(a => a.id === event.action.id);
        if (exists) {
          return prev.map(a => a.id === event.action.id ? event.action : a);
        }
        return [...prev, event.action];
      });
    };

    const handleCooldown = (event: BattleCooldownEvent) => {
      setActions(prev =>
        prev.map(a =>
          a.id === event.actionId
            ? { ...a, isOnCooldown: true, cooldownRemaining: event.cooldownRemaining }
            : a,
        ),
      );
    };

    socket.on('battle:actionAvailable', handleActionAvailable);
    socket.on('battle:cooldown', handleCooldown);

    return () => {
      socket.off('battle:actionAvailable', handleActionAvailable);
      socket.off('battle:cooldown', handleCooldown);
    };
  }, [socket]);

  // Tick down cooldownRemaining locally for smooth UI
  useEffect(() => {
    const interval = setInterval(() => {
      setActions(prev =>
        prev.map(a => {
          if (!a.isOnCooldown || a.cooldownRemaining <= 0) {
            return { ...a, isOnCooldown: false, cooldownRemaining: 0 };
          }
          const remaining = Math.max(0, a.cooldownRemaining - 100);
          return { ...a, cooldownRemaining: remaining, isOnCooldown: remaining > 0 };
        }),
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = (actionId: string) => {
    if (!socket) return;
    const action = actions.find(a => a.id === actionId);
    if (!action || action.isOnCooldown) return;

    const request: ActionTriggerRequest = { matchId, actionId };
    socket.emit('battle:triggerAction', request, (response: ActionTriggerResponse) => {
      if (!response.success && response.cooldownRemaining) {
        setActions(prev =>
          prev.map(a =>
            a.id === actionId
              ? { ...a, isOnCooldown: true, cooldownRemaining: response.cooldownRemaining ?? 0 }
              : a,
          ),
        );
      } else if (response.success) {
        // Optimistically mark as on cooldown
        setActions(prev =>
          prev.map(a =>
            a.id === actionId
              ? { ...a, isOnCooldown: true, cooldownRemaining: a.cooldownMs }
              : a,
          ),
        );
      }
    });
  };

  const handleSubmitCode = () => {
    if (!socket || !code.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const request: BattleCodeSubmitRequest = {
      matchId,
      code: code.trim(),
      functionName: '',
    };

    socket.emit('battle:submitCode', request, (response: BattleCodeSubmitResponse) => {
      setIsSubmitting(false);
      if (response.success && response.action) {
        setCode('');
      } else if (!response.success) {
        setSubmitError(response.errors?.join(', ') ?? 'Submission failed');
      }
    });
  };

  return (
    <Container>
      <ButtonsSection>
        <SectionTitle>Actions</SectionTitle>
        <ButtonGrid>
          {actions.map(action => (
            <ActionButtonItem
              key={action.id}
              action={action}
              onTrigger={handleTrigger}
              disabled={action.isOnCooldown}
            />
          ))}
        </ButtonGrid>
      </ButtonsSection>

      <CodeSection>
        <SectionTitle>Submit Custom Action</SectionTitle>
        <CodeTextarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={`function customAttack() {\n  attack();\n  moveBackward();\n}`}
          rows={6}
          spellCheck={false}
        />
        {submitError && <ErrorText>{submitError}</ErrorText>}
        <SubmitButton onClick={handleSubmitCode} disabled={isSubmitting || !code.trim()}>
          {isSubmitting ? 'Submitting...' : 'Create Action Button'}
        </SubmitButton>
      </CodeSection>
    </Container>
  );
};

/* ─── Sub-component: individual action button ───────────────────────────── */

interface ActionButtonItemProps {
  action: ActionButton;
  onTrigger: (id: string) => void;
  disabled: boolean;
}

const ActionButtonItem: React.FC<ActionButtonItemProps> = ({ action, onTrigger, disabled }) => {
  const progress = action.isOnCooldown
    ? (action.cooldownRemaining / action.cooldownMs) * 100
    : 0;

  return (
    <ButtonWrapper
      onClick={() => !disabled && onTrigger(action.id)}
      disabled={disabled}
      isDefault={action.isDefault}
    >
      <ButtonLabel>{action.name}</ButtonLabel>
      {action.isOnCooldown && (
        <>
          <CooldownOverlay progress={progress} />
          <CooldownText>{(action.cooldownRemaining / 1000).toFixed(1)}s</CooldownText>
        </>
      )}
    </ButtonWrapper>
  );
};

/* ─── Styled components ─────────────────────────────────────────────────── */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
`;

const SectionTitle = styled.h3`
  color: #00ff88;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ButtonsSection = styled.div``;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
`;

const cooldownSweep = keyframes`
  from { opacity: 0.5; }
  to   { opacity: 0; }
`;

interface ButtonWrapperProps {
  disabled: boolean;
  isDefault: boolean;
}

const ButtonWrapper = styled.button<ButtonWrapperProps>`
  position: relative;
  overflow: hidden;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid ${({ isDefault }) => (isDefault ? 'rgba(0,212,255,0.5)' : 'rgba(0,255,136,0.4)')};
  background: ${({ isDefault }) =>
    isDefault ? 'rgba(0,212,255,0.1)' : 'rgba(0,255,136,0.08)'};
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: background 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    background: ${({ isDefault }) =>
      isDefault ? 'rgba(0,212,255,0.2)' : 'rgba(0,255,136,0.18)'};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ButtonLabel = styled.span`
  position: relative;
  z-index: 1;
`;

interface CooldownOverlayProps {
  progress: number;
}

const CooldownOverlay = styled.div<CooldownOverlayProps>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  /* Shrink from right to left as cooldown depletes */
  clip-path: inset(0 ${({ progress }) => 100 - progress}% 0 0);
  animation: ${cooldownSweep} 0.1s linear;
  pointer-events: none;
`;

const CooldownText = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
`;

const CodeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CodeTextarea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 10px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(0, 255, 136, 0.5);
  }
`;

const ErrorText = styled.p`
  color: #ff4444;
  font-size: 12px;
  margin: 0;
`;

const SubmitButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #00ff88, #00d4ff);
  border: none;
  border-radius: 6px;
  color: #0a0e27;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  align-self: flex-start;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default ActionButtons;
