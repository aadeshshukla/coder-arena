import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { useSocket } from '../../contexts/SocketContext';
import { useMatchmakingStore } from '../../stores/matchmakingStore';
import { useEditorStore } from '../../stores/editorStore';
import Button from '../../components/common/Button';
import MonacoWrapper from '../../components/editor/MonacoWrapper';
import TemplateSelector from '../../components/editor/TemplateSelector';
import { CodeTemplate } from '../../utils/codeTemplates';
import {
  CodeValidatedResponse,
  MatchCountdownEvent,
  MatchPrepareEvent,
  MatchStartEvent,
  OpponentReadyEvent
} from '../../../../shared/types/match';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg.primary};
  padding: 20px;
`;

const Header = styled.header`
  max-width: 1400px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: ${theme.colors.bg.secondary};
  border-radius: 12px;
  border: 2px solid ${theme.colors.bg.tertiary};
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  color: ${theme.colors.accent.success};
  font-size: 24px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0;
  font-size: 14px;
`;

const Timer = styled.div<{ $warning?: boolean }>`
  color: ${props => props.$warning ? theme.colors.accent.danger : theme.colors.accent.blue};
  font-size: 32px;
  font-weight: bold;
  font-family: monospace;
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: calc(100vh - 180px);
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EditorContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Panel = styled.div`
  background: ${theme.colors.bg.secondary};
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 12px;
  padding: 20px;
`;

const PanelTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: 16px;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ValidationStatus = styled.div<{ $valid: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.$valid ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$valid ? theme.colors.accent.success : theme.colors.accent.danger};
  border-radius: 8px;
  color: ${props => props.$valid ? theme.colors.accent.success : theme.colors.accent.danger};
  font-weight: 600;
  margin-bottom: 16px;
`;

const ErrorList = styled.ul`
  margin: 8px 0 0 0;
  padding: 0 0 0 20px;
  color: ${theme.colors.accent.danger};
  font-size: 14px;
`;

const ErrorItem = styled.li`
  margin-bottom: 4px;
`;

const OpponentStatus = styled.div`
  padding: 12px;
  background: ${theme.colors.bg.tertiary};
  border-radius: 8px;
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 16px;
`;

const OpponentName = styled.div`
  color: ${theme.colors.accent.blue};
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatusText = styled.div<{ $ready?: boolean }>`
  color: ${props => props.$ready ? theme.colors.accent.success : theme.colors.text.secondary};
`;

const LastSaved = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 12px;
  margin-top: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EditorPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { opponent } = useMatchmakingStore();
  const {
    code,
    isValid,
    validationErrors,
    opponentReady,
    countdown,
    lastSaved,
    setCode,
    setSavedCode,
    setValidation,
    setOpponentReady,
    setCountdown,
    setLastSaved
  } = useEditorStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!socket || !matchId) return;

    // Listen for match preparation
    socket.on('match:prepare', (data: MatchPrepareEvent) => {
      console.log('Match preparation started:', data);
      setCountdown(data.countdown);
    });

    // Listen for countdown updates
    socket.on('match:countdown', (data: MatchCountdownEvent) => {
      setCountdown(data.secondsRemaining);
    });

    // Listen for opponent ready
    socket.on('opponent:ready', (data: OpponentReadyEvent) => {
      setOpponentReady(data.ready);
    });

    // Listen for match start
    socket.on('match:start', (data: MatchStartEvent) => {
      console.log('Match starting:', data);
      // TODO: Navigate to battle page in Phase 4
      alert('Match is starting! (Battle phase not yet implemented)');
    });

    return () => {
      socket.off('match:prepare');
      socket.off('match:countdown');
      socket.off('opponent:ready');
      socket.off('match:start');
    };
  }, [socket, matchId, setCountdown, setOpponentReady]);

  // Auto-save code to localStorage
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (code) {
        localStorage.setItem('coder_arena_last_code', code);
        setSavedCode(code);
        setLastSaved(new Date());
      }
    }, 2000);

    return () => clearInterval(saveTimer);
  }, [code, setSavedCode, setLastSaved]);

  // Validation debounce
  useEffect(() => {
    const validateTimer = setTimeout(() => {
      // Simple client-side validation (basic checks)
      const hasStrategy = code.includes('STRATEGY');
      const hasDefault = code.includes('DEFAULT');
      
      if (!hasStrategy) {
        setValidation(false, [{ message: 'Missing STRATEGY declaration' }]);
      } else if (!hasDefault) {
        setValidation(false, [{ message: 'Missing DEFAULT action' }]);
      } else {
        setValidation(true, []);
      }
    }, 500);

    return () => clearTimeout(validateTimer);
  }, [code, setValidation]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleTemplateSelect = (template: CodeTemplate) => {
    setCode(template.code);
  };

  const handleSubmitCode = () => {
    if (!socket || !matchId || !isValid) return;

    setIsSubmitting(true);

    socket.emit('code:submit', { matchId, code }, (response: CodeValidatedResponse) => {
      setIsSubmitting(false);

      if (response.success) {
        setHasSubmitted(true);
        setValidation(true, []);
      } else {
        setValidation(false, response.errors || []);
      }
    });
  };

  const handleReady = () => {
    if (!socket || !matchId || !hasSubmitted) return;

    socket.emit('player:ready', { matchId }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        alert(response.error || 'Failed to mark ready');
      }
    });
  };

  const handleLeave = () => {
    if (!socket || !matchId) return;

    socket.emit('match:leave', { matchId });
    navigate('/lobby');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastSaved = (): string => {
    if (!lastSaved) return 'Not saved';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>⚔️ Preparation Phase ⚔️</Title>
          <Subtitle>Write your CASL strategy</Subtitle>
        </HeaderLeft>
        <Timer $warning={countdown <= 10}>
          ⏱️ {formatTime(countdown)}
        </Timer>
      </Header>

      <Content>
        <EditorSection>
          <TemplateSelector onSelect={handleTemplateSelect} />
          <EditorContainer>
            <MonacoWrapper value={code} onChange={handleCodeChange} />
          </EditorContainer>
        </EditorSection>

        <SidePanel>
          <Panel>
            <PanelTitle>Validation</PanelTitle>
            <ValidationStatus $valid={isValid}>
              {isValid ? '✅ Code is valid' : '❌ Code has errors'}
            </ValidationStatus>
            {!isValid && validationErrors.length > 0 && (
              <ErrorList>
                {validationErrors.map((error, i) => (
                  <ErrorItem key={i}>{error.message}</ErrorItem>
                ))}
              </ErrorList>
            )}
            <LastSaved>Last saved: {formatLastSaved()}</LastSaved>
          </Panel>

          <Panel>
            <PanelTitle>Opponent</PanelTitle>
            <OpponentStatus>
              <OpponentName>{opponent?.username || 'Unknown'}</OpponentName>
              <StatusText $ready={opponentReady}>
                {opponentReady ? '✅ Ready!' : '✍️ Writing code...'}
              </StatusText>
            </OpponentStatus>
          </Panel>

          <Panel>
            <PanelTitle>Actions</PanelTitle>
            <ButtonGroup>
              <Button
                $variant="primary"
                onClick={handleSubmitCode}
                disabled={!isValid || isSubmitting || hasSubmitted}
              >
                {hasSubmitted ? '✅ Code Submitted' : 'Submit Code'}
              </Button>
              <Button
                $variant="success"
                onClick={handleReady}
                disabled={!hasSubmitted}
              >
                Ready 🚀
              </Button>
              <Button $variant="secondary" onClick={handleLeave}>
                Leave Match
              </Button>
            </ButtonGroup>
          </Panel>
        </SidePanel>
      </Content>
    </Container>
  );
};

export default EditorPage;
