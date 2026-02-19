import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useSocket } from '../../contexts/SocketContext';
import { ActionButton, BattleCodeSubmitRequest, BattleCodeSubmitResponse, ActionTriggerRequest, ActionTriggerResponse } from '../../../../shared/types/actions';
import { BattleActionAvailableEvent, BattleCooldownEvent } from '../../../../shared/types/match';

interface ActionButtonsProps {
  matchId: string;
  initialActions?: ActionButton[];
}

const ACTION_ICONS: Record<string, string> = {
  attack: '⚔️', defend: '🛡️', block: '🛡️',
  forward: '➡️', moveforward: '➡️', backward: '⬅️', movebackward: '⬅️',
};
const HOTKEYS = ['Q', 'W', 'E', 'R', '1', '2', '3', '4'];

function getIcon(name: string): string {
  const lower = name.toLowerCase().replace(/\s/g, '');
  for (const key of Object.keys(ACTION_ICONS)) {
    if (lower.includes(key)) return ACTION_ICONS[key];
  }
  return '🎯';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ matchId, initialActions = [] }) => {
  const { socket } = useSocket();
  const [actions, setActions] = useState<ActionButton[]>(initialActions);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);

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

  const handleTrigger = useCallback((actionId: string) => {
    if (!socket) return;
    const action = actions.find(a => a.id === actionId);
    if (!action || action.isOnCooldown) return;

    setPressedId(actionId);
    setTimeout(() => setPressedId(null), 200);

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
        setActions(prev =>
          prev.map(a =>
            a.id === actionId
              ? { ...a, isOnCooldown: true, cooldownRemaining: a.cooldownMs }
              : a,
          ),
        );
      }
    });
  }, [socket, actions, matchId]);

  // Stable ref so the keyboard handler always calls the latest handleTrigger
  const handleTriggerRef = useRef(handleTrigger);
  useEffect(() => { handleTriggerRef.current = handleTrigger; }, [handleTrigger]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      const idx = HOTKEYS.indexOf(e.key.toUpperCase());
      if (idx >= 0 && idx < actions.length) handleTriggerRef.current(actions[idx].id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);

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
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 1500);
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
          {actions.map((action, i) => (
            <ActionButtonItem
              key={action.id}
              action={action}
              hotkey={HOTKEYS[i]}
              icon={getIcon(action.name)}
              onTrigger={handleTrigger}
              disabled={action.isOnCooldown}
              pressed={pressedId === action.id}
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
          $success={submitSuccess}
          $error={!!submitError}
        />
        {submitError && <ErrorText>{submitError}</ErrorText>}
        <SubmitButton onClick={handleSubmitCode} disabled={isSubmitting || !code.trim()} $success={submitSuccess}>
          {isSubmitting ? 'Submitting...' : submitSuccess ? '✓ Created!' : 'Create Action Button'}
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
  hotkey?: string;
  icon?: string;
  pressed: boolean;
}

const ActionButtonItem: React.FC<ActionButtonItemProps> = ({ action, onTrigger, disabled, hotkey, icon, pressed }) => {
  const cooldownFraction = action.isOnCooldown
    ? action.cooldownRemaining / action.cooldownMs
    : 0;

  return (
    <ButtonWrapper
      onClick={() => !disabled && onTrigger(action.id)}
      disabled={disabled}
      isDefault={action.isDefault}
      $pressed={pressed}
    >
      <RadialSweep $fraction={cooldownFraction} />
      {icon && <BtnIcon>{icon}</BtnIcon>}
      <ButtonLabel>{action.name}</ButtonLabel>
      {hotkey && <HotkeyLabel>{hotkey}</HotkeyLabel>}
      {action.isOnCooldown && (
        <CooldownText>{(action.cooldownRemaining / 1000).toFixed(1)}s</CooldownText>
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
  max-width: 800px;
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
`;

const pressFlash = keyframes`
  0%   { background: rgba(0,212,255,0.4); }
  100% { background: rgba(0,212,255,0); }
`;

const readyPulse = keyframes`
  0%, 100% { box-shadow: 0 0 6px rgba(0,212,255,0.3); }
  50%       { box-shadow: 0 0 16px rgba(0,212,255,0.8); }
`;

interface ButtonWrapperProps {
  disabled: boolean;
  isDefault: boolean;
  $pressed: boolean;
}

const ButtonWrapper = styled.button<ButtonWrapperProps>`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 10px 10px;
  min-height: 80px;
  border-radius: 8px;
  border: 1px solid ${({ isDefault }) => (isDefault ? 'rgba(0,212,255,0.5)' : 'rgba(0,255,136,0.4)')};
  background: ${({ isDefault }) =>
    isDefault ? 'rgba(0,212,255,0.08)' : 'rgba(0,255,136,0.06)'};
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  transition: transform 0.1s, opacity 0.2s;

  ${({ $pressed }) =>
    $pressed &&
    css`animation: ${pressFlash} 0.2s ease-out;`}

  ${({ disabled, isDefault }) =>
    !disabled &&
    css`animation: ${readyPulse} 2s ease-in-out infinite;
         border-color: ${isDefault ? 'rgba(0,212,255,0.7)' : 'rgba(0,255,136,0.6)'};`}

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.03);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const RadialSweep = styled.div<{ $fraction: number }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(
    rgba(0, 0, 0, 0.65) ${({ $fraction }) => $fraction * 360}deg,
    transparent 0deg
  );
  pointer-events: none;
  z-index: 1;
`;

const BtnIcon = styled.span`
  font-size: 20px;
  line-height: 1;
  z-index: 2;
`;

const ButtonLabel = styled.span`
  position: relative;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

const HotkeyLabel = styled.span`
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  z-index: 3;
`;

const CooldownText = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  z-index: 3;
`;

const CodeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const successAnim = keyframes`
  0%   { border-color: rgba(0,255,136,0.8); }
  100% { border-color: rgba(0,255,136,0.4); }
`;

const errorShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-4px); }
  40%       { transform: translateX(4px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(2px); }
`;

const CodeTextarea = styled.textarea<{ $success: boolean; $error: boolean }>`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid ${({ $success, $error }) =>
    $success ? 'rgba(0,255,136,0.7)' : $error ? 'rgba(255,60,60,0.7)' : 'rgba(255,255,255,0.15)'};
  border-radius: 6px;
  color: #c8e6c9;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 10px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s;
  ${({ $success }) => $success && css`animation: ${successAnim} 0.5s ease;`}
  ${({ $error }) => $error && css`animation: ${errorShake} 0.4s ease;`}

  &:focus {
    outline: none;
    border-color: ${({ $error }) => ($error ? 'rgba(255,60,60,0.9)' : 'rgba(0,212,255,0.6)')};
  }
`;

const ErrorText = styled.p`
  color: #ff4444;
  font-size: 12px;
  margin: 0;
`;

const SubmitButton = styled.button<{ $success: boolean }>`
  padding: 10px 16px;
  background: ${({ $success }) =>
    $success
      ? 'linear-gradient(135deg, #00ff88, #00d4ff)'
      : 'linear-gradient(135deg, #0070ff, #00d4ff)'};
  border: none;
  border-radius: 6px;
  color: #0a0e27;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s, background 0.3s;
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

