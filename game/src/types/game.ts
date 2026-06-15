export type RealmKey =
  | "炼气一层"
  | "炼气二层"
  | "炼气三层"
  | "炼气四层"
  | "炼气五层"
  | "炼气六层"
  | "炼气七层"
  | "炼气八层"
  | "炼气九层"
  | "筑基初期"
  | "筑基中期"
  | "筑基后期"
  | "金丹初期"
  | "金丹中期"
  | "金丹后期"
  | "元婴初期";

export interface Character {
  name: string;
  age: number;
  origin: string;
  currentIdentity: string;
  spiritRoot: string;
  comprehension: number;
  fate: number;
  charm: number;
  realm: RealmKey;
  cultivationExp: number;
  cultivationMax: number;
  spiritStones: number;
  reputation: number;
  sectContribution: number;
  heartDemon: number;
  mood: number;
  lifespan: number;
  year: number;
  location: string;
  relationships: string;
  inventory: string[];
  cultivationMethod?: string;
  artifact?: string;
  sectRank: string;
  injury: number;
  flags: string[];
  history: string[];
  recentEventIds?: string[];
  dead?: boolean;
}

export interface EventRequirements {
  minRealm?: RealmKey;
  maxRealm?: RealmKey;
  minReputation?: number;
  minSectContribution?: number;
  minHeartDemon?: number;
  minInjury?: number;
  hasItem?: string;
  hasFlag?: string;
  notFlag?: string;
}

export interface EventEffect {
  cultivationExp?: number;
  cultivationMax?: number;
  spiritStones?: number;
  reputation?: number;
  fate?: number;
  comprehension?: number;
  charm?: number;
  mood?: number;
  lifespan?: number;
  year?: number;
  age?: number;
  inventory?: string[];
  artifact?: string;
  cultivationMethod?: string;
  sectContribution?: number;
  heartDemon?: number;
  injury?: number;
  setFlags?: string[];
  clearFlags?: string[];
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  resultText: string;
  effect: EventEffect;
  triggerCombat?: boolean;
  combatScene?: "adventure" | "sect" | "secretRealm" | "event";
  extraHistory?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  type:
    | "cultivation"
    | "adventure"
    | "sect"
    | "secretRealm"
    | "market"
    | "breakthrough"
    | "relationship";
  requirements?: EventRequirements;
  weight?: number;
  requiredFlags?: string[];
  excludedFlags?: string[];
  requiredRealm?: RealmKey[];
  excludedRealm?: RealmKey[];
  choices: EventChoice[];
}

export interface SecretRealmProgress {
  stage: number;
  phase: string;
  rewards: string[];
}

export interface CombatEnemy {
  id: string;
  name: string;
  realm: RealmKey;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  description: string;
  rewards: {
    cultivationExp?: number;
    spiritStones?: number;
    reputation?: number;
    items?: string[];
  };
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  mpCost?: number;
  damageMultiplier: number;
  heartDemonCost?: number;
  selfInjuryRisk?: number;
  effect?: "bleed" | "stun" | "heal" | "shield" | "none";
}

export interface CombatState {
  enemy: CombatEnemy;
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  round: number;
  logs: string[];
  isPlayerTurn: boolean;
  finished: boolean;
  result?: "win" | "lose" | "escape";
  playerShield?: number;
  enemyStunned?: boolean;
}

export interface GameState {
  character: Character;
  currentEvent?: GameEvent;
  notification?: string;
  showLog: boolean;
  currentExploration?: SecretRealmProgress;
  currentCombat?: CombatState;
  dead?: boolean;
}
