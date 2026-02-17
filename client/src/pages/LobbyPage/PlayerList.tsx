import styled from 'styled-components';
import { PublicPlayerData } from '../../../../shared/types/player';
import PlayerCard from './PlayerCard';

interface PlayerListProps {
  players: PublicPlayerData[];
  currentUserId?: string;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #a8b2d1;
  padding: 40px;
  font-size: 16px;
`;

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUserId }) => {
  if (players.length === 0) {
    return <EmptyMessage>No players online yet. Be the first!</EmptyMessage>;
  }

  return (
    <Grid>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isCurrentUser={player.id === currentUserId}
        />
      ))}
    </Grid>
  );
};

export default PlayerList;
