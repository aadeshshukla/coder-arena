import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useLobbyStore } from '../../stores/lobbyStore';
import { useMatchmakingStore } from '../../stores/matchmakingStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PlayerList from './PlayerList';
import { LobbyState } from '../../../../shared/types/events';
import {
  QueueJoinedResponse,
  RoomCreatedResponse,
  RoomJoinedResponse
} from '../../../../shared/types/matchmaking';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg.primary};
  padding: 20px;
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 32px;
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

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Title = styled.h1`
  color: ${theme.colors.accent.success};
  font-size: 28px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0;
  font-size: 14px;
`;

const PlayerCount = styled.div`
  color: ${theme.colors.accent.blue};
  font-size: 16px;
  font-weight: 600;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ActionPanel = styled.div`
  background: ${theme.colors.bg.secondary};
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 12px;
  padding: 32px;
`;

const ActionTitle = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: 20px;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ActionCard = styled.div`
  background: ${theme.colors.bg.tertiary};
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionCardTitle = styled.h3`
  color: ${theme.colors.accent.success};
  font-size: 18px;
  margin: 0;
`;

const ActionCardDesc = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin: 0;
  flex: 1;
`;

const RoomCodeDisplay = styled.div`
  background: ${theme.colors.bg.primary};
  border: 2px solid ${theme.colors.accent.success};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 16px;
`;

const RoomCode = styled.div`
  color: ${theme.colors.accent.success};
  font-size: 32px;
  font-weight: bold;
  font-family: monospace;
  letter-spacing: 4px;
`;

const RoomCodeLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 12px;
  margin-top: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${theme.colors.bg.secondary};
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
`;

const ModalTitle = styled.h2`
  color: ${theme.colors.accent.success};
  font-size: 24px;
  margin: 0 0 24px 0;
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const LobbyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { players, playerCount, setPlayers } = useLobbyStore();
  const { setInQueue } = useMatchmakingStore();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joiningRoom, setJoiningRoom] = useState(false);

  useEffect(() => {
    if (!socket || !user) return;

    // Join lobby on mount
    socket.emit('lobby:join', { token: localStorage.getItem('token') }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        console.error('Failed to join lobby:', response.error);
      }
    });

    // Listen for lobby updates
    socket.on('lobby:update', (state: LobbyState) => {
      setPlayers(state.players);
    });

    return () => {
      socket.off('lobby:update');
      socket.emit('lobby:leave');
    };
  }, [socket, user, setPlayers]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickMatch = () => {
    if (!socket) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    socket.emit('queue:join', { token }, (response: QueueJoinedResponse) => {
      if (response.success) {
        setInQueue(true);
        navigate('/queue');
      } else {
        alert(response.error || 'Failed to join queue');
      }
    });
  };

  const handleCreateRoom = () => {
    if (!socket) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    socket.emit('room:create', { token }, (response: RoomCreatedResponse) => {
      if (response.success && response.roomCode) {
        setRoomCode(response.roomCode);
        setShowRoomModal(true);
      } else {
        alert(response.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!socket || !joinRoomCode.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setJoiningRoom(true);

    socket.emit('room:join', { token, roomCode: joinRoomCode.toUpperCase() }, (response: RoomJoinedResponse) => {
      setJoiningRoom(false);
      
      if (response.success && response.matchId) {
        setShowJoinModal(false);
        navigate(`/editor/${response.matchId}`);
      } else {
        alert(response.error || 'Failed to join room');
      }
    });
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied to clipboard!');
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>⚔️ Coder Arena Lobby ⚔️</Title>
          <Subtitle>Welcome, {user?.username}!</Subtitle>
          <PlayerCount>{playerCount} player{playerCount !== 1 ? 's' : ''} online</PlayerCount>
        </HeaderLeft>
        <HeaderRight>
          <Button $variant="tertiary" onClick={() => navigate('/profile')}>
            👤 Profile
          </Button>
          <Button $variant="primary" onClick={() => navigate('/spectator')}>
            👁 Watch Battles
          </Button>
          <Button $variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </HeaderRight>
      </Header>
      
      <Content>
        <ActionPanel>
          <ActionTitle>Start a Match</ActionTitle>
          <ActionGrid>
            <ActionCard>
              <ActionCardTitle>⚡ Quick Match</ActionCardTitle>
              <ActionCardDesc>
                Join the matchmaking queue and get paired with another player
              </ActionCardDesc>
              <Button $variant="primary" onClick={handleQuickMatch}>
                Find Opponent
              </Button>
            </ActionCard>

            <ActionCard>
              <ActionCardTitle>🔒 Create Private Room</ActionCardTitle>
              <ActionCardDesc>
                Create a room and share the code with a friend
              </ActionCardDesc>
              <Button $variant="primary" onClick={handleCreateRoom}>
                Create Room
              </Button>
            </ActionCard>

            <ActionCard>
              <ActionCardTitle>🔑 Join Private Room</ActionCardTitle>
              <ActionCardDesc>
                Enter a room code to join a friend's match
              </ActionCardDesc>
              <Button $variant="primary" onClick={() => setShowJoinModal(true)}>
                Enter Code
              </Button>
            </ActionCard>
          </ActionGrid>
        </ActionPanel>

        <PlayerList players={players} currentUserId={user?.id} />
      </Content>

      {/* Room Created Modal */}
      <Modal $show={showRoomModal}>
        <ModalContent>
          <ModalTitle>🔒 Room Created!</ModalTitle>
          <RoomCodeDisplay>
            <RoomCode>{roomCode}</RoomCode>
            <RoomCodeLabel>Share this code with your friend</RoomCodeLabel>
          </RoomCodeDisplay>
          <ModalActions>
            <Button $variant="primary" onClick={handleCopyRoomCode} style={{ flex: 1 }}>
              Copy Code
            </Button>
            <Button $variant="secondary" onClick={() => setShowRoomModal(false)} style={{ flex: 1 }}>
              Close
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>

      {/* Join Room Modal */}
      <Modal $show={showJoinModal}>
        <ModalContent>
          <ModalTitle>🔑 Join Private Room</ModalTitle>
          <InputGroup>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{ flex: 1 }}
            />
          </InputGroup>
          <ModalActions>
            <Button
              $variant="primary"
              onClick={handleJoinRoom}
              disabled={joinRoomCode.length !== 6 || joiningRoom}
              style={{ flex: 1 }}
            >
              {joiningRoom ? 'Joining...' : 'Join Room'}
            </Button>
            <Button $variant="secondary" onClick={() => setShowJoinModal(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default LobbyPage;
