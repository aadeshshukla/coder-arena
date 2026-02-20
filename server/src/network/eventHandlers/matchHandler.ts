import { Socket } from 'socket.io';
import { AuthManager } from '../../managers/AuthManager';
import { MatchManager } from '../../managers/MatchManager';
import { ActionManager } from '../../managers/ActionManager';
import { ActionButtonParser } from '../../engine/js/ActionButton';
import {
  MatchLeaveRequest,
} from '../../../../shared/types/match';
import {
  ActionTriggerRequest,
  ActionTriggerResponse,
  BattleCodeSubmitRequest,
  BattleCodeSubmitResponse,
} from '../../../../shared/types/actions';

export function registerMatchHandlers(
  socket: Socket,
  authManager: AuthManager,
  matchManager: MatchManager,
  actionManager?: ActionManager,
): void {

  /**
   * Handle leaving a match
   */
  socket.on('match:leave', (data: MatchLeaveRequest, callback?: (response: { success: boolean }) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);
    
    if (!player) {
      if (callback) {
        callback({ success: false });
      }
      return;
    }

    const { matchId } = data;
    const success = matchManager.leaveMatch(player.id, matchId);

    if (callback) {
      callback({ success });
    }
  });

  /**
   * Handle live code submission during battle → creates a new action button
   */
  socket.on('battle:submitCode', (data: BattleCodeSubmitRequest, callback?: (response: BattleCodeSubmitResponse) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);

    if (!player) {
      if (callback) callback({ success: false, errors: ['Player not found'] });
      return;
    }

    if (!actionManager) {
      if (callback) callback({ success: false, errors: ['Action system unavailable'] });
      return;
    }

    const { matchId, code, functionName } = data;

    // Validate submitted code
    const validation = ActionButtonParser.validateCode(code);
    if (!validation.valid) {
      if (callback) callback({ success: false, errors: validation.errors });
      return;
    }

    // Parse the code to extract action types and a display name
    const parsed = ActionButtonParser.parse(code);
    const name = functionName
      ? ActionButtonParser.humanizeName(functionName)
      : parsed.name;

    // Register the new action button
    const button = actionManager.registerAction(player.id, matchId, name, code, parsed.actions);

    const actionButton = {
      id: button.id,
      name: button.name,
      isDefault: false,
      cooldownMs: button.cooldownMs,
      cooldownRemaining: 0,
      isOnCooldown: false,
    };

    // Notify the player that a new action button is available
    socket.emit('battle:actionAvailable', { action: actionButton });

    if (callback) callback({ success: true, action: actionButton });
  });

  /**
   * Handle action button trigger during battle
   */
  socket.on('battle:triggerAction', (data: ActionTriggerRequest, callback?: (response: ActionTriggerResponse) => void) => {
    const player = authManager.getPlayerBySocketId(socket.id);

    if (!player) {
      if (callback) callback({ success: false, error: 'Player not found' });
      return;
    }

    if (!actionManager) {
      if (callback) callback({ success: false, error: 'Action system unavailable' });
      return;
    }

    const { matchId, actionId } = data;

    const result = actionManager.triggerAction(player.id, actionId);

    if (!result.success) {
      const response: ActionTriggerResponse = {
        success: false,
        cooldownRemaining: result.cooldownRemaining,
        error: result.cooldownRemaining ? 'Action is on cooldown' : 'Action not found',
      };
      // Notify player of cooldown
      if (result.cooldownRemaining) {
        socket.emit('battle:cooldown', { actionId, cooldownRemaining: result.cooldownRemaining });
      }
      if (callback) callback(response);
      return;
    }

    // Apply the first action to the match
    if (result.actions && result.actions.length > 0) {
      const match = matchManager.getMatch(matchId);
      if (match) {
        match.setPendingAction(player.id, result.actions[0]);
      }
    }

    if (callback) callback({ success: true });
  });
}
