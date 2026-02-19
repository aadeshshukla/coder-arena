export type ActionType = 'APPROACH' | 'RETREAT' | 'ATTACK' | 'BLOCK' | 'IDLE';

export interface Action {
  type: ActionType;
}

export interface ActionButton {
  id: string;
  name: string;
  isDefault: boolean;
  cooldownMs: number;
  cooldownRemaining: number;
  isOnCooldown: boolean;
}

export interface ActionTriggerRequest {
  matchId: string;
  actionId: string;
}

export interface ActionTriggerResponse {
  success: boolean;
  cooldownRemaining?: number;
  error?: string;
}

export interface BattleCodeSubmitRequest {
  matchId: string;
  code: string;
  functionName: string;
}

export interface BattleCodeSubmitResponse {
  success: boolean;
  action?: ActionButton;
  errors?: string[];
}
