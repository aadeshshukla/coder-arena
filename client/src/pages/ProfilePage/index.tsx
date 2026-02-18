import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useStatsStore } from '../../stores/statsStore';
import { useAchievementsStore } from '../../stores/achievementsStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, getWinRate } = useStatsStore();
  const { achievements, getUnlockedCount } = useAchievementsStore();

  const winRate = getWinRate();
  const unlockedCount = getUnlockedCount();

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/lobby')}>
          ← Back to Lobby
        </BackButton>
        <Title>Player Profile</Title>
      </Header>

      <Content>
        <Section>
          <SectionTitle>👤 {user?.username}</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalMatches}</StatValue>
              <StatLabel>Total Matches</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.wins}</StatValue>
              <StatLabel>Wins</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.losses}</StatValue>
              <StatLabel>Losses</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.draws}</StatValue>
              <StatLabel>Draws</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{winRate}%</StatValue>
              <StatLabel>Win Rate</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.longestWinStreak}</StatValue>
              <StatLabel>Best Win Streak</StatLabel>
            </StatCard>
          </StatsGrid>
        </Section>

        <Section>
          <SectionTitle>⚔️ Combat Stats</SectionTitle>
          <StatsList>
            <StatsRow>
              <StatsLabel>Total Damage Dealt:</StatsLabel>
              <StatsValue>{Math.round(stats.totalDamageDealt)}</StatsValue>
            </StatsRow>
            <StatsRow>
              <StatsLabel>Total Damage Taken:</StatsLabel>
              <StatsValue>{Math.round(stats.totalDamageTaken)}</StatsValue>
            </StatsRow>
            <StatsRow>
              <StatsLabel>Average Damage/Match:</StatsLabel>
              <StatsValue>
                {stats.totalMatches > 0 ? Math.round(stats.totalDamageDealt / stats.totalMatches) : 0}
              </StatsValue>
            </StatsRow>
          </StatsList>
        </Section>

        <Section>
          <SectionTitle>🏆 Achievements ({unlockedCount}/{achievements.length})</SectionTitle>
          <AchievementsGrid>
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} $unlocked={achievement.unlocked}>
                <AchievementIcon>{achievement.icon}</AchievementIcon>
                <AchievementName>{achievement.name}</AchievementName>
                <AchievementDesc>{achievement.description}</AchievementDesc>
                {achievement.unlocked && achievement.unlockedAt && (
                  <UnlockedDate>
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </UnlockedDate>
                )}
              </AchievementCard>
            ))}
          </AchievementsGrid>
        </Section>

        <Section>
          <SectionTitle>📜 Recent Matches</SectionTitle>
          {stats.matchHistory.length === 0 ? (
            <EmptyMessage>No matches played yet</EmptyMessage>
          ) : (
            <MatchHistory>
              {stats.matchHistory.slice(0, 10).map((match, index) => (
                <MatchCard key={match.matchId || index}>
                  <MatchResult $result={match.result}>
                    {match.result === 'win' ? '🏆' : match.result === 'loss' ? '💀' : '🤝'}
                    {match.result.toUpperCase()}
                  </MatchResult>
                  <MatchDetails>
                    <MatchInfo>vs {match.opponent}</MatchInfo>
                    <MatchInfo>
                      💥 {Math.round(match.damageDealt)} dealt • 💔 {Math.round(match.damageTaken)} taken
                    </MatchInfo>
                    <MatchInfo>⏱️ {Math.floor(match.duration / 1000)}s</MatchInfo>
                  </MatchDetails>
                  <MatchDate>
                    {new Date(match.timestamp).toLocaleDateString()}
                  </MatchDate>
                </MatchCard>
              ))}
            </MatchHistory>
          )}
        </Section>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #0a0e27;
  padding: 20px;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  color: #00ff88;
  font-size: 36px;
  font-weight: 700;
  margin: 0;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  color: #00d4ff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: rgba(0, 255, 136, 0.1);
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  color: #00ff88;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatsLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
`;

const StatsValue = styled.div`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const AchievementCard = styled.div<{ $unlocked: boolean }>`
  background: ${props => props.$unlocked ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.$unlocked ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  opacity: ${props => props.$unlocked ? 1 : 0.5};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    opacity: 1;
  }
`;

const AchievementIcon = styled.div`
  font-size: 48px;
  margin-bottom: 0.5rem;
`;

const AchievementName = styled.div`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AchievementDesc = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const UnlockedDate = styled.div`
  color: #00ff88;
  font-size: 12px;
  margin-top: 0.5rem;
`;

const MatchHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MatchCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const MatchResult = styled.div<{ $result: string }>`
  color: ${props => {
    switch (props.$result) {
      case 'win': return '#00ff88';
      case 'loss': return '#ff3366';
      default: return '#ffaa00';
    }
  }};
  font-size: 18px;
  font-weight: 700;
  min-width: 100px;
  text-align: center;
`;

const MatchDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MatchInfo = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const MatchDate = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  min-width: 100px;
  text-align: right;
`;

const EmptyMessage = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  text-align: center;
  padding: 2rem;
`;
