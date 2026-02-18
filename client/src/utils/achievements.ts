import { PlayerStats } from '../stores/statsStore';
import { useAchievementsStore } from '../stores/achievementsStore';

export function checkAchievements(stats: PlayerStats): string[] {
  const { achievements, unlockAchievement, isUnlocked } = useAchievementsStore.getState();
  const newlyUnlocked: string[] = [];

  // First Blood - Win first match
  if (stats.wins >= 1 && !isUnlocked('first-blood')) {
    unlockAchievement('first-blood');
    newlyUnlocked.push('first-blood');
  }

  // Hat Trick - Win 3 in a row
  if (stats.currentWinStreak >= 3 && !isUnlocked('win-streak-3')) {
    unlockAchievement('win-streak-3');
    newlyUnlocked.push('win-streak-3');
  }

  // Unstoppable - Win 5 in a row
  if (stats.currentWinStreak >= 5 && !isUnlocked('win-streak-5')) {
    unlockAchievement('win-streak-5');
    newlyUnlocked.push('win-streak-5');
  }

  // Veteran - Play 50 matches
  if (stats.totalMatches >= 50 && !isUnlocked('veteran')) {
    unlockAchievement('veteran');
    newlyUnlocked.push('veteran');
  }

  // Damage Dealer - Deal 1000 total damage
  if (stats.totalDamageDealt >= 1000 && !isUnlocked('damage-dealer')) {
    unlockAchievement('damage-dealer');
    newlyUnlocked.push('damage-dealer');
  }

  // Tank - Survive 1000 damage
  if (stats.totalDamageTaken >= 1000 && !isUnlocked('tank')) {
    unlockAchievement('tank');
    newlyUnlocked.push('tank');
  }

  return newlyUnlocked;
}

export function getAchievementById(id: string) {
  const { achievements } = useAchievementsStore.getState();
  return achievements.find(a => a.id === id);
}
