import { create } from 'zustand';
import { CodeLanguage } from '../../../shared/types/match';

interface ValidationError {
  message: string;
  line?: number;
}

interface EditorState {
  code: string;
  savedCode: string;
  codeLanguage: CodeLanguage;
  isValid: boolean;
  validationErrors: ValidationError[];
  isValidating: boolean;
  lastSaved: Date | null;
  opponentReady: boolean;
  countdown: number;
  
  setCode: (code: string) => void;
  setSavedCode: (code: string) => void;
  setCodeLanguage: (language: CodeLanguage) => void;
  setValidation: (isValid: boolean, errors: ValidationError[]) => void;
  setValidating: (validating: boolean) => void;
  setLastSaved: (date: Date) => void;
  setOpponentReady: (ready: boolean) => void;
  setCountdown: (seconds: number) => void;
  reset: () => void;
}

const DEFAULT_CODE = `STRATEGY BeginnerBot {
  RULE "Attack When Close" {
    WHEN distance < 3
    DO ATTACK
  }
  
  RULE "Get Closer" {
    WHEN distance > 3
    DO APPROACH
  }
  
  DEFAULT IDLE
}`;

export const useEditorStore = create<EditorState>((set) => ({
  code: localStorage.getItem('coder_arena_last_code') || DEFAULT_CODE,
  savedCode: localStorage.getItem('coder_arena_last_code') || DEFAULT_CODE,
  codeLanguage: (localStorage.getItem('coder_arena_code_language') as CodeLanguage) || 'CASL',
  isValid: true,
  validationErrors: [],
  isValidating: false,
  lastSaved: null,
  opponentReady: false,
  countdown: 30,
  
  setCode: (code) => set({ code }),
  setSavedCode: (code) => set({ savedCode: code }),
  setCodeLanguage: (language) => {
    localStorage.setItem('coder_arena_code_language', language);
    set({ codeLanguage: language });
  },
  setValidation: (isValid, errors) => set({ isValid, validationErrors: errors }),
  setValidating: (validating) => set({ isValidating: validating }),
  setLastSaved: (date) => set({ lastSaved: date }),
  setOpponentReady: (ready) => set({ opponentReady: ready }),
  setCountdown: (seconds) => set({ countdown: seconds }),
  reset: () => set({
    code: DEFAULT_CODE,
    savedCode: DEFAULT_CODE,
    codeLanguage: 'CASL',
    isValid: true,
    validationErrors: [],
    isValidating: false,
    lastSaved: null,
    opponentReady: false,
    countdown: 30
  })
}));
