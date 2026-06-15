import { gameEvents } from "../data/events";
import { originTemplates, surnames, givenNames } from "../data/origins";
import { realmOrder, realmBaseMax, realmDescriptions } from "../data/realms";
import type { Character, EventChoice, GameEvent, GameState, RealmKey } from "../types/game";

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const randomName = () =>
  `${pick(surnames)}${pick(givenNames)}${Math.random() < 0.4 ? pick(givenNames) : ""}`;

const randomLocation = () =>
  pick(["宗门后山", "青云宗", "幽冥谷", "长安城", "神秘古林", "荒野行脚"]);

const generateInitialHistory = (template: {
  identity: string;
  origin: string;
  spiritRoot: string;
  background: string;
}) => [`${template.identity}出身，${template.background}`];

export const getNextRealm = (realm: RealmKey): RealmKey => {
  const index = realmOrder.indexOf(realm);
  return realmOrder[Math.min(index + 1, realmOrder.length - 1)];
};

export const createNewCharacter = (): Character => {
  const template = pick(originTemplates);
  const age = randomInt(14, 18);
  const comprehension = randomInt(7, 12);
  const fate = randomInt(5, 11);
  const charm = randomInt(4, 10);
  const spiritStones = randomInt(20, 40);
  const mood = randomInt(55, 75);
  const lifespan = randomInt(90, 120);

  return {
    name: randomName(),
    age,
    origin: template.origin,
    currentIdentity: template.identity,
    spiritRoot: template.spiritRoot,
    comprehension,
    fate,
    charm,
    realm: "炼气一层",
    cultivationExp: 0,
    cultivationMax: realmBaseMax("炼气一层"),
    spiritStones,
    reputation: randomInt(0, 5),
    mood,
    lifespan,
    year: 1,
    location: template.origin,
    relationships: "师门同门",
    history: generateInitialHistory(template),
  };
};

export const createNewGameState = (): GameState => ({
  character: createNewCharacter(),
  currentEvent: undefined,
  notification: "欢迎进入修仙人生模拟器。",
  showLog: false,
});

export const getRandomEvent = (): GameEvent => pick(gameEvents);

export const describeRealm = (realm: RealmKey) => realmDescriptions[realm];

export const applyEffectToCharacter = (
  character: Character,
  effect: EventChoice["effect"]
): Character => {
  const next = { ...character };
  if (effect.cultivationExp) {
    next.cultivationExp = clamp(
      next.cultivationExp + effect.cultivationExp,
      0,
      next.cultivationMax
    );
  }
  if (effect.cultivationMax) {
    next.cultivationMax = Math.max(0, next.cultivationMax + effect.cultivationMax);
  }
  if (effect.spiritStones) next.spiritStones = Math.max(0, next.spiritStones + effect.spiritStones);
  if (effect.reputation) next.reputation = Math.max(0, next.reputation + effect.reputation);
  if (effect.fate) next.fate = clamp(next.fate + effect.fate, 1, 20);
  if (effect.comprehension) next.comprehension = clamp(next.comprehension + effect.comprehension, 1, 20);
  if (effect.charm) next.charm = clamp(next.charm + effect.charm, 1, 20);
  if (effect.mood) next.mood = clamp(next.mood + effect.mood, 0, 100);
  if (effect.lifespan) next.lifespan = Math.max(0, next.lifespan + effect.lifespan);
  if (effect.year) next.year = Math.max(1, next.year + effect.year);
  if (effect.age) next.age = Math.max(1, next.age + effect.age);
  return next;
};

export const calculateBreakthroughChance = (character: Character) => {
  const index = realmOrder.indexOf(character.realm);
  const baseChance = 18 + character.mood * 0.8 + character.fate * 1.2 + character.comprehension * 0.6;
  const penalty = index * 4;
  return clamp(baseChance - penalty, 10, 95);
};

export const cultivate = (character: Character) => {
  const next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = randomLocation();

  if (next.cultivationExp >= next.cultivationMax) {
    return {
      character: next,
      notification: "修为已达到当前上限，先尝试突破方可更进一步。",
      event: undefined,
    };
  }

  const eventChance = Math.random();
  if (eventChance < 0.35) {
    return {
      character: next,
      notification: "修炼中触发了特殊事件。",
      event: getRandomEvent(),
    };
  }

  const gain = Math.round(12 + next.comprehension * 1.2 + next.fate * 0.4);
  next.cultivationExp = clamp(next.cultivationExp + gain, 0, next.cultivationMax);
  next.mood = clamp(next.mood + 2, 0, 100);

  const reached = next.cultivationExp >= next.cultivationMax;
  return {
    character: next,
    notification: reached
      ? "修为已充盈，可尝试突破！"
      : `闭关修炼获得 ${gain} 修为，当前修为 ${next.cultivationExp}/${next.cultivationMax}。`,
    event: undefined,
  };
};

export const startAdventure = (character: Character) => {
  const next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = randomLocation();
  next.mood = clamp(next.mood - 2, 0, 100);

  return {
    character: next,
    notification: "外出历练触发了一个随机事件。",
    event: getRandomEvent(),
  };
};

export const attemptBreakthrough = (character: Character) => {
  const next = { ...character };
  if (next.cultivationExp < next.cultivationMax) {
    return {
      character: next,
      success: false,
      notification: "修为未达上限，无法突破。",
      history: undefined,
    };
  }

  if (next.realm === "元婴初期") {
    return {
      character: next,
      success: false,
      notification: "你已经达到元婴初期，继续磨练即可。",
      history: undefined,
    };
  }

  const chance = calculateBreakthroughChance(next);
  const roll = Math.random() * 100;
  if (roll <= chance) {
    const nextRealm = getNextRealm(next.realm);
    next.realm = nextRealm;
    next.cultivationExp = 0;
    next.cultivationMax = realmBaseMax(nextRealm);
    next.mood = clamp(next.mood + 8, 0, 100);
    next.reputation = Math.max(0, next.reputation + 2);
    const history = `${next.age}岁，在${next.location}突破到${nextRealm}。`;
    return {
      character: next,
      success: true,
      notification: `突破成功，进入${nextRealm}！`,
      history,
    };
  }

  const loss = Math.round(next.cultivationExp * 0.3);
  next.cultivationExp = Math.max(0, next.cultivationExp - loss);
  next.mood = clamp(next.mood - 12, 0, 100);
  next.lifespan = Math.max(0, next.lifespan - 3);
  const history = `${next.age}岁，突破失败，损失 ${loss} 修为，心境受损。`;
  return {
    character: next,
    success: false,
    notification: `突破失败，修为下降 ${loss}。`,
    history,
  };
};

export const resolveEventChoice = (
  character: Character,
  event: GameEvent,
  choiceId: string
) => {
  const next = { ...character };
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) {
    return {
      character: next,
      notification: "选择无效，事件未能继续。",
      history: undefined,
    };
  }
  const updated = applyEffectToCharacter(next, choice.effect);
  updated.location = randomLocation();
  updated.history = [
    ...updated.history,
    `${updated.age}岁，${choice.extraHistory ?? choice.resultText}`,
  ];
  return {
    character: updated,
    notification: choice.resultText,
    history: choice.extraHistory,
  };
};
