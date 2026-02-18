import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

interface AchievementsStore {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  getUnlockedCount: () => number;
}

const initialAchievements: Achievement[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Win your first match',
    icon: '🥇',
    unlocked: false
  },
  {
    id: 'win-streak-3',
    name: 'Hat Trick',
    description: 'Win 3 matches in a row',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'win-streak-5',
    name: 'Unstoppable',
    description: 'Win 5 matches in a row',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 50 matches',
    icon: '🎖️',
    unlocked: false
  },
  {
    id: 'damage-dealer',
    name: 'Damage Dealer',
    description: 'Deal 1000 total damage',
    icon: '⚔️',
    unlocked: false
  },
  {
    id: 'tank',
    name: 'Tank',
    description: 'Survive 1000 total damage taken',
    icon: '🛡️',
    unlocked: false
  }
];

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      achievements: initialAchievements,
      
      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === id && !achievement.unlocked
              ? { ...achievement, unlocked: true, unlockedAt: Date.now() }
              : achievement
          )
        }));
      },
      
      isUnlocked: (id) => {
        const achievement = get().achievements.find(a => a.id === id);
        return achievement?.unlocked ?? false;
      },
      
      getUnlockedCount: () => {
        return get().achievements.filter(a => a.unlocked).length;
      }
    }),
    {
      name: 'coder-arena-achievements',
      version: 1
    }
  )
);
