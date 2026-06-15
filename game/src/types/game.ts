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
  mood: number;
  lifespan: number;
  year: number;
  location: string;
  relationships: string;
  history: string[];
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
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  resultText: string;
  effect: EventEffect;
  extraHistory?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  choices: EventChoice[];
}

export interface GameState {
  character: Character;
  currentEvent?: GameEvent;
  notification?: string;
  showLog: boolean;
}
