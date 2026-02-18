import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleNotifications: () => void;
}

const defaultSettings: Settings = {
  soundEnabled: true,
  animationsEnabled: true,
  notificationsEnabled: true,
  theme: 'dark'
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }));
      },
      
      toggleSound: () => {
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled }
        }));
      },
      
      toggleAnimations: () => {
        set((state) => ({
          settings: { ...state.settings, animationsEnabled: !state.settings.animationsEnabled }
        }));
      },
      
      toggleNotifications: () => {
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled }
        }));
      }
    }),
    {
      name: 'coder-arena-settings',
      version: 1
    }
  )
);
