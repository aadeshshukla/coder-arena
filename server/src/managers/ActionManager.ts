import { ActionType } from '../../../shared/types/actions';

export interface ActionButton {
  id: string;
  playerId: string;
  matchId: string;
  name: string;
  code: string;
  cooldownMs: number;
  lastUsedAt: number;
  isDefault: boolean;
  /** The action type(s) this button executes */
  actions: ActionType[];
}

// Default cooldown for built-in actions (1.5 seconds)
const DEFAULT_ACTION_COOLDOWN_MS = 1500;
// Cooldown for custom (code-submitted) actions (5 seconds)
const CUSTOM_ACTION_COOLDOWN_MS = 5000;

interface DefaultActionDef {
  id: string;
  name: string;
  action: ActionType;
}

const DEFAULT_ACTIONS: DefaultActionDef[] = [
  { id: 'moveForward',  name: 'Move Forward',  action: 'APPROACH' },
  { id: 'moveBackward', name: 'Move Backward', action: 'RETREAT'  },
  { id: 'attack',       name: 'Attack',        action: 'ATTACK'   },
  { id: 'defend',       name: 'Defend',        action: 'BLOCK'    },
];

/**
 * Manages per-player action buttons and their cooldowns.
 */
export class ActionManager {
  /** playerId → list of action buttons */
  private actions: Map<string, ActionButton[]> = new Map();

  /**
   * Initialise the four default action buttons for a player.
   * Called when a player enters a match.
   */
  initDefaultActions(playerId: string, matchId: string): void {
    const buttons: ActionButton[] = DEFAULT_ACTIONS.map(def => ({
      id: def.id,
      playerId,
      matchId,
      name: def.name,
      code: '',
      cooldownMs: DEFAULT_ACTION_COOLDOWN_MS,
      lastUsedAt: 0,
      isDefault: true,
      actions: [def.action],
    }));
    this.actions.set(playerId, buttons);
  }

  /**
   * Register a new custom action button for a player.
   * Returns the created ActionButton.
   */
  registerAction(
    playerId: string,
    matchId: string,
    name: string,
    code: string,
    actionTypes: ActionType[] = ['ATTACK'],
  ): ActionButton {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const button: ActionButton = {
      id,
      playerId,
      matchId,
      name,
      code,
      cooldownMs: CUSTOM_ACTION_COOLDOWN_MS,
      lastUsedAt: 0,
      isDefault: false,
      actions: actionTypes,
    };

    const existing = this.actions.get(playerId) ?? [];
    this.actions.set(playerId, [...existing, button]);
    return button;
  }

  /**
   * Attempt to trigger an action for a player.
   * Returns success:true and updates lastUsedAt, or
   * success:false with the remaining cooldown in ms.
   */
  triggerAction(
    playerId: string,
    actionId: string,
  ): { success: boolean; cooldownRemaining?: number; actions?: ActionType[] } {
    const buttons = this.actions.get(playerId);
    if (!buttons) {
      return { success: false };
    }

    const button = buttons.find(b => b.id === actionId);
    if (!button) {
      return { success: false };
    }

    const now = Date.now();
    const elapsed = now - button.lastUsedAt;
    if (button.lastUsedAt > 0 && elapsed < button.cooldownMs) {
      return { success: false, cooldownRemaining: button.cooldownMs - elapsed };
    }

    button.lastUsedAt = now;
    return { success: true, actions: button.actions };
  }

  /**
   * Check whether an action is currently on cooldown.
   */
  isOnCooldown(playerId: string, actionId: string): boolean {
    const buttons = this.actions.get(playerId);
    if (!buttons) return false;
    const button = buttons.find(b => b.id === actionId);
    if (!button) return false;
    return button.lastUsedAt > 0 && Date.now() - button.lastUsedAt < button.cooldownMs;
  }

  /**
   * Return all action buttons available for a player.
   */
  getAvailableActions(playerId: string): ActionButton[] {
    return this.actions.get(playerId) ?? [];
  }

  /**
   * Remove all action buttons for a player (e.g. on match end).
   */
  clearActions(playerId: string): void {
    this.actions.delete(playerId);
  }
}
