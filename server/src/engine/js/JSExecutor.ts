import * as vm from 'vm';
import { ActionType } from '../../../../shared/types/actions';
import { Position } from '../../../../shared/types/match';

const EXECUTION_TIMEOUT_MS = 50;

export interface JSGameState {
  distance: number;
  health: number;
  opponentHealth: number;
  position: Position;
  opponentPosition: Position;
  tick: number;
}

const VALID_ACTIONS: ActionType[] = ['ATTACK', 'BLOCK', 'APPROACH', 'RETREAT', 'IDLE'];

/**
 * Executes player-written JavaScript code in an isolated VM context
 */
export class JSExecutor {
  private readonly code: string;

  constructor(code: string) {
    this.code = code;
  }

  /**
   * Execute the JS strategy for one game tick.
   * Returns the action to perform, or 'IDLE' on any error.
   */
  execute(state: JSGameState): ActionType {
    try {
      return this.runInSandbox(state);
    } catch {
      return 'IDLE';
    }
  }

  private runInSandbox(state: JSGameState): ActionType {
    let resolvedAction: ActionType = 'IDLE';

    // Setter injected into sandbox to capture the return value from execute()
    const setAction = (value: string) => {
      if (VALID_ACTIONS.includes(value as ActionType)) {
        resolvedAction = value as ActionType;
      }
    };

    // Build the fighter API — method calls set resolvedAction via closure
    const api = {
      distance: state.distance,
      health: state.health,
      opponentHealth: state.opponentHealth,
      position: state.position,
      opponentPosition: state.opponentPosition,
      tick: state.tick,
      attack:       (): string => { resolvedAction = 'ATTACK';   return 'ATTACK';   },
      block:        (): string => { resolvedAction = 'BLOCK';    return 'BLOCK';    },
      wait:         (): string => { resolvedAction = 'IDLE';     return 'IDLE';     },
      moveTo:       (_x: number, _y: number): string => { resolvedAction = 'APPROACH'; return 'APPROACH'; },
      moveTowards:  (target: string): string => {
        resolvedAction = target === 'enemy' ? 'APPROACH' : 'IDLE';
        return resolvedAction;
      }
    };

    // Restricted sandbox — no Node globals
    const sandbox = Object.create(null) as Record<string, unknown>;
    sandbox.__api__ = api;
    sandbox.__setAction__ = setAction;

    // Wrap user code: create Fighter instance, inject API, call execute(),
    // and capture the return value via __setAction__ if it is a valid action string.
    const wrapper = `
(function () {
  "use strict";
  ${this.code}
  var __instance__ = new Fighter();
  Object.assign(__instance__, __api__);
  var __result__ = __instance__.execute();
  if (typeof __result__ === "string") {
    __setAction__(__result__);
  }
}());
`;

    const script = new vm.Script(wrapper);
    const context = vm.createContext(sandbox);
    script.runInContext(context, { timeout: EXECUTION_TIMEOUT_MS });

    return resolvedAction;
  }
}
