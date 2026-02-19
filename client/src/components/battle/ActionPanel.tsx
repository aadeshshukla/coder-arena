import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useSocket } from '../../contexts/SocketContext';
import {
  ActionButton,
  BattleCodeSubmitRequest,
  BattleCodeSubmitResponse,
  ActionTriggerRequest,
  ActionTriggerResponse,
} from '../../../../shared/types/actions';
import {
  BattleActionAvailableEvent,
  BattleCooldownEvent,
} from '../../../../shared/types/match';

interface ActionPanelProps {
  matchId: string;
  initialActions?: ActionButton[];
}

const ACTION_ICONS: Record<string, string> = {
  attack: '⚔️',
  defend: '🛡️',
  block: '🛡️',
  forward: '➡️',
  backward: '⬅️',
  moveForward: '➡️',
  moveBackward: '⬅️',
};

const HOTKEYS = ['Q', 'W', 'E', 'R', '1', '2', '3', '4'];

function getActionIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(ACTION_ICONS)) {
    if (lower.includes(key)) return ACTION_ICONS[key];
  }
  return '🎯';
}

const ActionPanel: React.FC<ActionPanelProps> = ({ matchId, initialActions = [] }) => {
  const { socket } = useSocket();
  const [actions, setActions] = useState<ActionButton[]>(initialActions);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [pressedId, setPressedId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleActionAvailable = (event: BattleActionAvailableEvent) => {
      setActions(prev => {
        const exists = prev.find(a => a.id === event.action.id);
        if (exists) return prev.map(a => (a.id === event.action.id ? event.action : a));
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

  // Tick down cooldowns locally
  useEffect(() => {
    const interval = setInterval(() => {
      setActions(prev =>
        prev.map(a => {
          if (!a.isOnCooldown || a.cooldownRemaining <= 0) return { ...a, isOnCooldown: false, cooldownRemaining: 0 };
          const remaining = Math.max(0, a.cooldownRemaining - 100);
          return { ...a, cooldownRemaining: remaining, isOnCooldown: remaining > 0 };
        }),
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = useCallback(
    (actionId: string) => {
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
              a.id === actionId ? { ...a, isOnCooldown: true, cooldownRemaining: a.cooldownMs } : a,
            ),
          );
        }
      });
    },
    [socket, actions, matchId],
  );

  const handleSubmitCode = () => {
    if (!socket || !code.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const request: BattleCodeSubmitRequest = { matchId, code: code.trim(), functionName: '' };
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      const idx = HOTKEYS.indexOf(e.key.toUpperCase());
      if (idx >= 0 && idx < actions.length) {
        handleTrigger(actions[idx].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions, handleTrigger]);

  const defaultActions = actions.filter(a => a.isDefault);
  const customActions = actions.filter(a => !a.isDefault);

  return (
    <PanelRoot>
      <ActionsRow>
        {defaultActions.map((action, i) => (
          <ActionBtn
            key={action.id}
            action={action}
            hotkey={HOTKEYS[i]}
            onTrigger={handleTrigger}
            isPressed={pressedId === action.id}
          />
        ))}

        {customActions.length > 0 && <Divider />}

        {customActions.map((action, i) => (
          <ActionBtn
            key={action.id}
            action={action}
            hotkey={HOTKEYS[defaultActions.length + i]}
            onTrigger={handleTrigger}
            isPressed={pressedId === action.id}
          />
        ))}

        <CodeToggle
          onClick={() => setCodeEditorOpen(v => !v)}
          $active={codeEditorOpen}
          title="Toggle code editor"
        >
          <span>{'</>'}</span>
          <HotkeyBadge>C</HotkeyBadge>
        </CodeToggle>
      </ActionsRow>

      <CodeEditorSlide $open={codeEditorOpen}>
        <CodeEditorInner>
          <CodeLabel>Submit Custom Action</CodeLabel>
          <CodeTextarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={'function customAttack() {\n  attack();\n  moveBackward();\n}'}
            rows={5}
            spellCheck={false}
            $success={submitSuccess}
            $error={!!submitError}
          />
          {submitError && <ErrorText>{submitError}</ErrorText>}
          <SubmitRow>
            <SubmitBtn
              onClick={handleSubmitCode}
              disabled={isSubmitting || !code.trim()}
              $success={submitSuccess}
            >
              {isSubmitting ? 'Submitting…' : submitSuccess ? '✓ Added!' : 'Create Button'}
            </SubmitBtn>
          </SubmitRow>
        </CodeEditorInner>
      </CodeEditorSlide>
    </PanelRoot>
  );
};

/* ─── Sub-component: individual action button ───────────────────────────── */

interface ActionBtnProps {
  action: ActionButton;
  hotkey?: string;
  onTrigger: (id: string) => void;
  isPressed: boolean;
}

const ActionBtn: React.FC<ActionBtnProps> = ({ action, hotkey, onTrigger, isPressed }) => {
  const cooldownFraction = action.isOnCooldown ? action.cooldownRemaining / action.cooldownMs : 0;
  const icon = getActionIcon(action.name);

  return (
    <BtnWrapper
      onClick={() => !action.isOnCooldown && onTrigger(action.id)}
      $disabled={action.isOnCooldown}
      $default={action.isDefault}
      $pressed={isPressed}
    >
      <RadialOverlay $fraction={cooldownFraction} />
      <BtnIcon>{icon}</BtnIcon>
      <BtnName>{action.name}</BtnName>
      {hotkey && <HotkeyBadge>{hotkey}</HotkeyBadge>}
      {action.isOnCooldown && (
        <CooldownText>{(action.cooldownRemaining / 1000).toFixed(1)}s</CooldownText>
      )}
    </BtnWrapper>
  );
};

/* ─── Animations ─────────────────────────────────────────────────────────── */

const pressFlash = keyframes`
  0%   { background: rgba(0, 212, 255, 0.4); }
  100% { background: transparent; }
`;

const readyGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(0, 212, 255, 0.4); }
  50%       { box-shadow: 0 0 20px rgba(0, 212, 255, 0.9), 0 0 40px rgba(0, 212, 255, 0.4); }
`;

/* ─── Styled components ─────────────────────────────────────────────────── */

const PanelRoot = styled.div`
  width: 100%;
  max-width: 1000px;
  background: rgba(6, 11, 40, 0.97);
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 10px;
  overflow: hidden;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  flex-wrap: wrap;
`;

const Divider = styled.div`
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 4px;
`;

interface BtnWrapperProps {
  $disabled: boolean;
  $default: boolean;
  $pressed: boolean;
}

const BtnWrapper = styled.button<BtnWrapperProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 80px;
  padding: 10px 14px 8px;
  border-radius: 8px;
  border: 1px solid ${({ $default }) => ($default ? 'rgba(0,212,255,0.5)' : 'rgba(0,255,136,0.35)')};
  background: ${({ $default }) =>
    $default ? 'rgba(0,212,255,0.08)' : 'rgba(0,255,136,0.06)'};
  color: #fff;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  transition: transform 0.1s, opacity 0.2s;
  overflow: hidden;

  ${({ $pressed }) =>
    $pressed &&
    css`
      animation: ${pressFlash} 0.2s ease-out;
      transform: scale(0.95);
    `}

  ${({ $disabled, $default }) =>
    !$disabled &&
    css`
      animation: ${readyGlow} 2s ease-in-out infinite;
      border-color: ${$default ? 'rgba(0,212,255,0.7)' : 'rgba(0,255,136,0.6)'};
    `}

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.03);
  }
`;

const RadialOverlay = styled.div<{ $fraction: number }>`
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
  font-size: 22px;
  line-height: 1;
  z-index: 2;
`;

const BtnName = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5px;
  z-index: 2;
`;

const HotkeyBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 5px;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  z-index: 3;
`;

const CooldownText = styled.span`
  position: absolute;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  z-index: 3;
`;

const CodeToggle = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255,165,0,0.7)' : 'rgba(255,255,255,0.2)')};
  background: ${({ $active }) => ($active ? 'rgba(255,165,0,0.1)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $active }) => ($active ? '#ffaa00' : 'rgba(255,255,255,0.6)')};
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.15s;
  position: relative;

  &:hover {
    border-color: rgba(255, 165, 0, 0.5);
    color: #ffaa00;
  }
`;

const CodeEditorSlide = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => ($open ? '260px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const CodeEditorInner = styled.div`
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CodeLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #ffaa00;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const CodeTextarea = styled.textarea<{ $success: boolean; $error: boolean }>`
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid ${({ $success, $error }) =>
    $success ? 'rgba(0,255,136,0.6)' : $error ? 'rgba(255,60,60,0.6)' : 'rgba(255,255,255,0.15)'};
  border-radius: 6px;
  color: #e8e8e8;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 10px 12px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ $error }) => ($error ? 'rgba(255,60,60,0.8)' : 'rgba(0,212,255,0.6)')};
  }
`;

const ErrorText = styled.p`
  color: #ff4444;
  font-size: 12px;
  margin: 0;
`;

const SubmitRow = styled.div`
  display: flex;
  align-items: center;
`;

const successFlash = keyframes`
  0%   { background: linear-gradient(135deg, #00ff88, #00d4ff); }
  100% { background: linear-gradient(135deg, #00ff88, #00d4ff); }
`;

const SubmitBtn = styled.button<{ $success: boolean }>`
  padding: 9px 20px;
  background: ${({ $success }) =>
    $success ? 'linear-gradient(135deg, #00ff88, #00d4ff)' : 'linear-gradient(135deg, #0070ff, #00d4ff)'};
  border: none;
  border-radius: 6px;
  color: #0a0e27;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  ${({ $success }) => $success && css`animation: ${successFlash} 0.3s ease;`}

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default ActionPanel;
