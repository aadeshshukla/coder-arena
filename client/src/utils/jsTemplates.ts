export interface JSCodeTemplate {
  name: string;
  description: string;
  code: string;
}

export const jsTemplates: JSCodeTemplate[] = [
  {
    name: 'Aggressive',
    description: 'Rush the enemy and attack',
    code: `class Fighter {
  execute() {
    if (this.distance < 3) {
      return this.attack();
    }
    return this.moveTowards('enemy');
  }
}`
  },
  {
    name: 'Defensive',
    description: 'Block when hurt, then counter',
    code: `class Fighter {
  execute() {
    if (this.health < 30) {
      return this.block();
    }
    if (this.distance < 3) {
      return this.attack();
    }
    return this.moveTowards('enemy');
  }
}`
  },
  {
    name: 'Balanced',
    description: 'Adaptive offense and defense',
    code: `class Fighter {
  execute() {
    if (this.opponentHealth < 20 && this.distance < 3) {
      return this.attack();
    }
    if (this.health < this.opponentHealth * 0.5) {
      return this.block();
    }
    if (this.distance > 5) {
      return this.moveTowards('enemy');
    }
    return this.attack();
  }
}`
  }
];

export const getJSTemplateByName = (name: string): JSCodeTemplate | undefined => {
  return jsTemplates.find(t => t.name === name);
};

export const getDefaultJSTemplate = (): JSCodeTemplate => {
  return jsTemplates[0];
};
