import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${theme.colors.bg.primary};
  padding: 20px;
`;

const LoginBox = styled.div`
  background: ${theme.colors.bg.secondary};
  border: 2px solid ${theme.colors.bg.tertiary};
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  color: ${theme.colors.accent.success};
  font-size: 32px;
  margin: 0 0 8px 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin: 0 0 32px 0;
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.accent.error};
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: ${theme.colors.accent.error}22;
  border-radius: 8px;
`;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username);

    if (result.success) {
      navigate('/lobby');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <Container>
      <LoginBox>
        <Title>⚔️ Coder Arena ⚔️</Title>
        <Subtitle>Enter the digital battleground</Subtitle>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter username (3-20 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={isLoading || username.length < 3}>
            {isLoading ? 'Entering...' : 'Enter Arena'}
          </Button>
        </Form>
      </LoginBox>
    </Container>
  );
};

export default LoginPage;
