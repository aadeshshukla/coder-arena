import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useLobbyStore } from '../../stores/lobbyStore';
import Button from '../../components/common/Button';
import PlayerList from './PlayerList';
import { LobbyState } from '../../../../shared/types/events';

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
`;

const LobbyPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { players, playerCount, updatePlayers } = useLobbyStore();

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
      updatePlayers(state.players);
    });

    return () => {
      socket.off('lobby:update');
      socket.emit('lobby:leave');
    };
  }, [socket, user, updatePlayers]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>⚔️ Coder Arena Lobby ⚔️</Title>
          <Subtitle>Welcome, {user?.username}!</Subtitle>
          <PlayerCount>{playerCount} player{playerCount !== 1 ? 's' : ''} online</PlayerCount>
        </HeaderLeft>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Header>
      <Content>
        <PlayerList players={players} currentUserId={user?.id} />
      </Content>
    </Container>
  );
};

export default LobbyPage;
