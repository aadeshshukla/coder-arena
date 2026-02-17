import styled from 'styled-components';
import { theme } from '../../theme';
import { PublicPlayerData } from '../../../../shared/types/player';
import StatusBadge from '../../components/common/StatusBadge';

interface PlayerCardProps {
  player: PublicPlayerData;
  isCurrentUser?: boolean;
}

const Card = styled.div<{ $isCurrentUser?: boolean }>`
  background: ${props => props.$isCurrentUser ? theme.colors.bg.tertiary : theme.colors.bg.secondary};
  border: 2px solid ${props => props.$isCurrentUser ? theme.colors.accent.success : theme.colors.bg.tertiary};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isCurrentUser ? `0 0 20px ${theme.colors.accent.success}44` : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const Username = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: 18px;
  margin: 0 0 12px 0;
  font-weight: 600;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.bg.tertiary};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 12px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  color: ${theme.colors.text.primary};
  font-size: 16px;
  font-weight: 600;
`;

const CurrentUserBadge = styled.div`
  display: inline-block;
  background: ${theme.colors.accent.success};
  color: ${theme.colors.bg.primary};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  margin-left: 8px;
`;

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isCurrentUser }) => {
  return (
    <Card $isCurrentUser={isCurrentUser}>
      <Username>
        {player.username}
        {isCurrentUser && <CurrentUserBadge>You</CurrentUserBadge>}
      </Username>
      <StatusBadge status={player.status} />
      <Stats>
        <StatItem>
          <StatLabel>Wins</StatLabel>
          <StatValue>{player.stats.wins}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Losses</StatLabel>
          <StatValue>{player.stats.losses}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Matches</StatLabel>
          <StatValue>{player.stats.totalMatches}</StatValue>
        </StatItem>
      </Stats>
    </Card>
  );
};

export default PlayerCard;
