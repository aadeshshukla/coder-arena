export interface CodeTemplate {
  name: string;
  description: string;
  code: string;
}

export const codeTemplates: CodeTemplate[] = [
  {
    name: 'Beginner Bot',
    description: 'Simple approach and attack strategy',
    code: `STRATEGY BeginnerBot {
  RULE "Attack When Close" {
    WHEN distance < 3
    DO ATTACK
  }
  
  RULE "Get Closer" {
    WHEN distance > 3
    DO APPROACH
  }
  
  DEFAULT IDLE
}`
  },
  {
    name: 'Aggressive Bot',
    description: 'Hunt and strike aggressively',
    code: `STRATEGY Aggressor {
  RULE "Finish Weak" {
    WHEN enemy.health < 30
     AND distance < 3
     AND self.attackCooldown == 0
    DO ATTACK
  }
  
  RULE "Hunt" {
    WHEN distance > 2
    DO APPROACH
  }
  
  RULE "Strike" {
    WHEN distance <= 3
     AND self.attackCooldown == 0
    DO ATTACK
  }
  
  DEFAULT APPROACH
}`
  },
  {
    name: 'Defensive Bot',
    description: 'Block and counter strategy',
    code: `STRATEGY Defender {
  RULE "Block When Low" {
    WHEN self.health < 30
    DO BLOCK
  }
  
  RULE "Counter" {
    WHEN enemy.health < self.health
     AND distance < 3
     AND self.attackCooldown == 0
    DO ATTACK
  }
  
  RULE "Keep Distance" {
    WHEN distance < 2
    DO RETREAT
  }
  
  RULE "Approach" {
    WHEN distance > 4
    DO APPROACH
  }
  
  DEFAULT BLOCK
}`
  },
  {
    name: 'Balanced Bot',
    description: 'Adaptive strategy combining offense and defense',
    code: `STRATEGY Balanced {
  RULE "Emergency Block" {
    WHEN self.health < 20
    DO BLOCK
  }
  
  RULE "Finish Move" {
    WHEN enemy.health < 25
     AND distance < 4
     AND self.attackCooldown == 0
    DO ATTACK
  }
  
  RULE "Attack Opening" {
    WHEN distance < 3
     AND self.attackCooldown == 0
     AND self.health > 30
    DO ATTACK
  }
  
  RULE "Close Gap" {
    WHEN distance > 3
    DO APPROACH
  }
  
  RULE "Retreat Low Health" {
    WHEN self.health < 40
     AND distance < 3
    DO RETREAT
  }
  
  DEFAULT APPROACH
}`
  }
];

export const getTemplateByName = (name: string): CodeTemplate | undefined => {
  return codeTemplates.find(t => t.name === name);
};

export const getDefaultTemplate = (): CodeTemplate => {
  return codeTemplates[0]; // Return Beginner Bot by default
};
