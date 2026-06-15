import { gameEvents } from "../data/events";
import { originTemplates, surnames, givenNames } from "../data/origins";
import { realmOrder, realmBaseMax, realmDescriptions } from "../data/realms";
import { createEnemyByRealm, createCombatState } from "./combatLogic";
import type {
  Character,
  CombatState,
  EventChoice,
  GameEvent,
  EventRequirements,
  GameState,
  RealmKey,
} from "../types/game";

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const MAX_RECENT_EVENTS = 5;

const uniqueRecentEvents = (events: string[] = []) =>
  Array.from(new Set(events.filter(Boolean))).slice(-MAX_RECENT_EVENTS);

const recordRecentEvent = (character: Character, eventId: string): Character => ({
  ...character,
  recentEventIds: uniqueRecentEvents([...(character.recentEventIds ?? []), eventId]),
});

const weightedPick = <T extends { weight?: number }>(items: T[]) => {
  if (items.length === 0) return undefined;
  const totalWeight = items.reduce((sum, item) => sum + Math.max(1, item.weight ?? 1), 0);
  let cursor = Math.random() * totalWeight;
  for (const item of items) {
    cursor -= Math.max(1, item.weight ?? 1);
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
};

const meetsEventRequirements = (character: Character, event: GameEvent) => {
  const requirements: EventRequirements | undefined = event.requirements;
  if (!requirements) return true;

  const realmIndex = realmOrder.indexOf(character.realm);
  if (requirements.minRealm && realmIndex < realmOrder.indexOf(requirements.minRealm)) {
    return false;
  }
  if (requirements.maxRealm && realmIndex > realmOrder.indexOf(requirements.maxRealm)) {
    return false;
  }
  if (
    requirements.minReputation !== undefined &&
    character.reputation < requirements.minReputation
  ) {
    return false;
  }
  if (
    requirements.minSectContribution !== undefined &&
    character.sectContribution < requirements.minSectContribution
  ) {
    return false;
  }
  if (
    requirements.minHeartDemon !== undefined &&
    character.heartDemon < requirements.minHeartDemon
  ) {
    return false;
  }
  if (requirements.minInjury !== undefined && character.injury < requirements.minInjury) {
    return false;
  }
  if (requirements.hasItem && !character.inventory.includes(requirements.hasItem)) {
    return false;
  }
  if (requirements.hasFlag && !character.flags.includes(requirements.hasFlag)) {
    return false;
  }
  if (requirements.notFlag && character.flags.includes(requirements.notFlag)) {
    return false;
  }
  return true;
};

const filterEvents = (character: Character, type?: GameEvent["type"]) =>
  gameEvents.filter((event) => {
    if (type && event.type !== type) return false;
    if (event.requiredFlags && event.requiredFlags.some((flag) => !character.flags.includes(flag))) {
      return false;
    }
    if (event.excludedFlags && event.excludedFlags.some((flag) => character.flags.includes(flag))) {
      return false;
    }
    if (event.requiredRealm && !event.requiredRealm.includes(character.realm)) {
      return false;
    }
    if (event.excludedRealm && event.excludedRealm.includes(character.realm)) {
      return false;
    }
    return meetsEventRequirements(character, event);
  });

const getEventChainWeight = (character: Character, event: GameEvent) => {
  let weight = Math.max(1, event.weight ?? 1);
  const flags = new Set(character.flags);
  const realmIndex = realmOrder.indexOf(character.realm);
  const stage =
    realmIndex <= 4 ? "foundation" : realmIndex <= 8 ? "growth" : realmIndex <= 13 ? "core" : "peak";

  if (stage === "foundation") {
    if (event.type === "cultivation" || event.type === "adventure" || event.type === "sect") {
      weight *= 1.18;
    }
    if (event.type === "breakthrough") {
      weight *= 0.7;
    }
  } else if (stage === "growth") {
    if (event.type === "market" || event.type === "relationship" || event.type === "sect") {
      weight *= 1.15;
    }
    if (event.type === "secretRealm") {
      weight *= 1.08;
    }
  } else if (stage === "core") {
    if (event.type === "secretRealm" || event.type === "breakthrough" || event.type === "relationship") {
      weight *= 1.25;
    }
    if (event.type === "market") {
      weight *= 0.92;
    }
  } else {
    if (event.type === "breakthrough" || event.type === "secretRealm" || event.type === "relationship") {
      weight *= 1.35;
    }
    if (event.type === "market") {
      weight *= 0.8;
    }
  }

  if (flags.has("ancient_cave_found")) {
    if (event.id.startsWith("realm-ancient") || event.id.includes("sword") || event.id.includes("stone")) {
      weight *= 1.8;
    }
  }
  if (flags.has("rival_started")) {
    if (event.id.startsWith("rel-") || event.id.includes("sect-bully") || event.id.includes("senior-duel")) {
      weight *= 1.7;
    }
  }
  if (flags.has("foundation_pill_clue")) {
    if (event.id.includes("foundation") || event.id.includes("auction") || event.id.includes("pill")) {
      weight *= 1.7;
    }
  }
  if (flags.has("demonic_path_tempted")) {
    if (event.id.includes("demon") || event.id.includes("black-pill") || event.id.includes("backlash")) {
      weight *= 1.7;
    }
  }
  if (flags.has("jade_slip_found") || flags.has("jade_slip_studied")) {
    if (event.id.includes("jade") || event.id.includes("scroll") || event.id.includes("nameless")) {
      weight *= 1.8;
    }
  }

  return weight;
};

const pickWeightedEvent = (character: Character, events: GameEvent[]) => {
  if (events.length === 0) return undefined;
  const weighted = events.map((event) => ({
    event,
    weight: getEventChainWeight(character, event),
  }));
  return weightedPick(weighted)?.event ?? events[0];
};

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
    sectContribution: 0,
    heartDemon: randomInt(8, 20),
    mood,
    lifespan,
    year: 1,
    location: template.origin,
    relationships: "师门同门",
    inventory: [],
    cultivationMethod: undefined,
    artifact: undefined,
    sectRank: "杂役弟子",
    injury: 0,
    flags: [],
    recentEventIds: [],
    history: generateInitialHistory(template),
    dead: false,
  };
};

export const createNewGameState = (): GameState => ({
  character: createNewCharacter(),
  currentEvent: undefined,
  notification: "欢迎进入修仙人生模拟器。",
  showLog: false,
  currentExploration: undefined,
  currentCombat: undefined,
});

const isSpiritRoot = (spiritRoot: string, keyword: string) =>
  spiritRoot.toLowerCase().includes(keyword.toLowerCase());

const getSpiritRootCultivationMultiplier = (spiritRoot: string) => {
  if (isSpiritRoot(spiritRoot, "天灵")) return 1.35;
  if (isSpiritRoot(spiritRoot, "双灵")) return 1.2;
  if (isSpiritRoot(spiritRoot, "三灵")) return 1.05;
  if (isSpiritRoot(spiritRoot, "四灵")) return 0.9;
  if (isSpiritRoot(spiritRoot, "五灵")) return 0.75;
  if (isSpiritRoot(spiritRoot, "上品")) return 1.15;
  if (isSpiritRoot(spiritRoot, "中品")) return 1;
  if (isSpiritRoot(spiritRoot, "下品")) return 0.9;
  if (isSpiritRoot(spiritRoot, "凡根")) return 0.85;
  if (isSpiritRoot(spiritRoot, "偏锋")) return 0.95;
  if (isSpiritRoot(spiritRoot, "阴坤")) return 0.9;
  return 1;
};

export const getRandomEvent = (
  character: Character,
  type?: GameEvent["type"]
): GameEvent => {
  const candidates = filterEvents(character, type);
  const recentIds = new Set(character.recentEventIds ?? []);
  const nonRecent = candidates.filter((event) => !recentIds.has(event.id));
  const recentFiltered = nonRecent.length > 0 ? nonRecent : candidates;
  if (recentFiltered.length > 0) {
    return pickWeightedEvent(character, recentFiltered) ?? recentFiltered[0];
  }

  const sameTypeFallback = type
    ? gameEvents.filter((event) => event.type === type && !event.requirements)
    : gameEvents.filter((event) => !event.requirements);
  if (sameTypeFallback.length > 0) {
    return pickWeightedEvent(character, sameTypeFallback) ?? sameTypeFallback[0];
  }

  const fallback = type ? gameEvents.filter((event) => event.type === type) : gameEvents;
  const fallbackPool = fallback.length > 0 ? fallback : gameEvents;
  return pickWeightedEvent(character, fallbackPool) ?? fallbackPool[0];
};

const getRandomSectMissionEvent = (character: Character) => {
  const candidates = filterEvents(character, "sect").filter((event) => event.category === "宗门任务");
  const recentIds = new Set(character.recentEventIds ?? []);
  const nonRecent = candidates.filter((event) => !recentIds.has(event.id));
  const selectedPool = nonRecent.length > 0 ? nonRecent : candidates;
  if (selectedPool.length > 0) {
    return pickWeightedEvent(character, selectedPool) ?? selectedPool[0];
  }
  const fallback = filterEvents(character, "sect");
  if (fallback.length > 0) {
    return pickWeightedEvent(character, fallback) ?? fallback[0];
  }
  return getRandomEvent(character, "sect");
};

const chooseActionEvent = (
  character: Character,
  primaryType: GameEvent["type"],
  relationshipChance = 0
) => {
  const chosenType =
    relationshipChance > 0 && Math.random() < relationshipChance ? "relationship" : primaryType;
  const event = getRandomEvent(character, chosenType);
  return {
    event,
    character: recordRecentEvent(character, event.id),
  };
};

export const describeRealm = (realm: RealmKey) => realmDescriptions[realm];

export const describeEventEffect = (effect: EventChoice["effect"]) => {
  const messages: string[] = [];
  const addNumber = (label: string, value?: number) => {
    if (!value) return;
    messages.push(`${label} ${value > 0 ? "+" : ""}${value}`);
  };

  addNumber("修为", effect.cultivationExp);
  addNumber("修为上限", effect.cultivationMax);
  addNumber("灵石", effect.spiritStones);
  addNumber("声望", effect.reputation);
  addNumber("气运", effect.fate);
  addNumber("悟性", effect.comprehension);
  addNumber("魅力", effect.charm);
  addNumber("心境", effect.mood);
  addNumber("寿元", effect.lifespan);
  addNumber("年份", effect.year);
  addNumber("年龄", effect.age);
  addNumber("宗门贡献", effect.sectContribution);
  addNumber("心魔", effect.heartDemon);
  addNumber("伤势", effect.injury);

  if (effect.inventory?.length) {
    messages.push(`物品：${effect.inventory.join("、")}`);
  }
  if (effect.artifact) {
    messages.push(`法宝：${effect.artifact}`);
  }
  if (effect.cultivationMethod) {
    messages.push(`功法：${effect.cultivationMethod}`);
  }

  return messages;
};

const sectRankOrder = [
  "杂役弟子",
  "外门弟子",
  "内门弟子",
  "亲传弟子",
  "执事",
  "长老",
] as const;

type SectRank = (typeof sectRankOrder)[number];
type PromotionRank = Exclude<SectRank, "杂役弟子">;

const getNextAvailableRank = (character: Character) => {
  const rankIndex = sectRankOrder.findIndex((rank) => rank === character.sectRank);
  if (rankIndex === -1) return "杂役弟子";
  if (rankIndex >= sectRankOrder.length - 1) return character.sectRank;
  const nextRank = sectRankOrder[rankIndex + 1];
  const realmIndex = realmOrder.indexOf(character.realm);

  if (
    nextRank === "外门弟子" &&
    character.reputation >= 18 &&
    character.sectContribution >= 20 &&
    realmIndex >= realmOrder.indexOf("炼气五层")
  ) {
    return nextRank;
  }
  if (
    nextRank === "内门弟子" &&
    character.reputation >= 30 &&
    character.sectContribution >= 40 &&
    realmIndex >= realmOrder.indexOf("筑基中期")
  ) {
    return nextRank;
  }
  if (
    nextRank === "亲传弟子" &&
    character.reputation >= 40 &&
    character.sectContribution >= 60 &&
    realmIndex >= realmOrder.indexOf("筑基后期")
  ) {
    return nextRank;
  }
  if (
    nextRank === "执事" &&
    character.reputation >= 50 &&
    character.sectContribution >= 90 &&
    realmIndex >= realmOrder.indexOf("金丹中期")
  ) {
    return nextRank;
  }
  if (
    nextRank === "长老" &&
    character.reputation >= 60 &&
    character.sectContribution >= 120 &&
    realmIndex >= realmOrder.indexOf("金丹初期")
  ) {
    return nextRank;
  }
  return character.sectRank;
};

const maybePromoteSectRank = (character: Character) => {
  const nextRank = getNextAvailableRank(character);
  if (nextRank !== character.sectRank) {
    return {
      ...character,
      sectRank: nextRank,
      history: [
        ...character.history,
        `${character.age}岁，凭借表现晋升为${nextRank}。`,
      ],
    };
  }
  return character;
};

const cultivationMethods = [
  "归元诀",
  "镇魂诀",
  "长生诀",
  "太虚诀",
  "灵动心经",
  "七星步",
];

const getRandomMethod = () => pick(cultivationMethods);

export const getRealmLifespanBonus = (realm: RealmKey) => {
  const index = realmOrder.indexOf(realm);
  if (index <= 8) return 3;
  if (index <= 11) return 8;
  if (index <= 14) return 14;
  return 20;
};

export const markDeathIfNeeded = (character: Character): Character => {
  if (character.dead || character.age < character.lifespan) return character;
  return {
    ...character,
    dead: true,
    history: [
      ...character.history,
      `${character.age}岁，寿元耗尽，进入坐化状态，修炼之路到此为止。`,
    ],
  };
};

export type BreakthroughFactor = {
  label: string;
  value: number;
  type: "positive" | "negative";
};

export const calculateBreakthroughReadiness = (character: Character) => {
  const factors: BreakthroughFactor[] = [];
  const baseRate = character.cultivationExp >= character.cultivationMax ? 25 : 5;

  if (character.cultivationExp >= character.cultivationMax) {
    factors.push({ label: "修为已圆满", value: 25, type: "positive" });
  } else {
    factors.push({ label: "修为不足", value: -15, type: "negative" });
  }
  factors.push({ label: `心境 ${character.mood}`, value: Math.round((character.mood - 50) * 0.28), type: character.mood >= 60 ? "positive" : "negative" });
  factors.push({ label: `心魔 ${character.heartDemon}`, value: character.heartDemon <= 20 ? 8 : -Math.round((character.heartDemon - 20) * 0.6), type: character.heartDemon <= 20 ? "positive" : "negative" });
  factors.push({ label: `伤势 ${character.injury}`, value: character.injury <= 10 ? 6 : -Math.round((character.injury - 10) * 0.4), type: character.injury <= 10 ? "positive" : "negative" });
  factors.push({ label: `气运 ${character.fate}`, value: Math.round((character.fate - 8) * 1.5), type: character.fate >= 10 ? "positive" : "negative" });
  factors.push({ label: `悟性 ${character.comprehension}`, value: Math.round((character.comprehension - 8) * 1.4), type: character.comprehension >= 10 ? "positive" : "negative" });
  if (character.cultivationMethod) {
    factors.push({ label: `功法(${character.cultivationMethod})`, value: 6, type: "positive" });
  }
  if (character.artifact) {
    factors.push({ label: `法宝(${character.artifact})`, value: 8, type: "positive" });
  }
  const hasFoundationPill = character.inventory.includes("筑基丹");
  if (hasFoundationPill) {
    factors.push({ label: "筑基丹准备", value: 12, type: "positive" });
  }
  const hasHeartPill = character.inventory.includes("护心丹");
  if (hasHeartPill) {
    factors.push({ label: "护心丹保护", value: 8, type: "positive" });
  }

  const total = clamp(
    30 + baseRate + factors.reduce((sum, f) => sum + f.value, 0),
    1,
    99
  );
  const positives = factors.filter((item) => item.type === "positive").slice(0, 4);
  const negatives = factors.filter((item) => item.type === "negative").slice(0, 4);

  return {
    readiness: total,
    positives,
    negatives,
  };
};

export const useItem = (character: Character, itemName: string) => {
  const next = { ...character };
  if (!next.inventory.includes(itemName)) {
    return {
      character: next,
      notification: `背包中没有${itemName}。`,
      history: undefined,
    };
  }
  next.inventory = next.inventory.filter((item) => item !== itemName);
  let notification: string;
  let historyEntry = `使用${itemName}，调整了当前状态。`;

  const addFlags = (...flags: string[]) => {
    next.flags = Array.from(new Set([...next.flags, ...flags]));
  };

  switch (itemName) {
    case "聚气丹":
      next.cultivationExp = clamp(next.cultivationExp + 20, 0, next.cultivationMax);
      notification = "聚气丹帮助你迅速巩固修为。";
      historyEntry = "服用聚气丹，修为增长。";
      break;
    case "凝神丹":
      next.mood = clamp(next.mood + 18, 0, 100);
      next.heartDemon = clamp(next.heartDemon - 8, 0, 100);
      notification = "凝神丹镇静心境，心魔有所收敛。";
      historyEntry = "服用凝神丹，心境平和。";
      break;
    case "小还丹":
      next.injury = clamp(next.injury - 16, 0, 100);
      next.mood = clamp(next.mood + 4, 0, 100);
      notification = "小还丹化开后如暖流入体，伤势明显缓和。";
      historyEntry = "服用小还丹，旧伤渐愈。";
      break;
    case "清心丹":
      next.heartDemon = clamp(next.heartDemon - 14, 0, 100);
      next.mood = clamp(next.mood + 8, 0, 100);
      notification = "清心丹压住了杂念，心湖重新平静。";
      historyEntry = "服用清心丹，心魔稍退。";
      break;
    case "聚灵符":
      next.cultivationExp = clamp(next.cultivationExp + 12, 0, next.cultivationMax);
      next.mood = clamp(next.mood + 1, 0, 100);
      notification = "聚灵符引来一缕灵潮，修为悄然增长。";
      historyEntry = "催动聚灵符，灵气入体。";
      break;
    case "遁逃符":
      addFlags("escape_talisman");
      notification = "遁逃符藏入袖中，若再遇死战，可减少败退代价。";
      historyEntry = "收起遁逃符，留作保命后手。";
      break;
    case "灵兽内丹":
      next.cultivationExp = clamp(next.cultivationExp + 28, 0, next.cultivationMax);
      next.heartDemon = clamp(next.heartDemon + 6, 0, 100);
      next.mood = clamp(next.mood - 2, 0, 100);
      notification = "灵兽内丹药力狂暴，修为暴涨，心底却也多了一丝躁意。";
      historyEntry = "炼化灵兽内丹，修为与心魔一同攀升。";
      break;
    case "延寿丹":
      next.lifespan += 10;
      notification = "延寿丹滋补寿元，续命十年。";
      historyEntry = "服用延寿丹，寿元延长。";
      break;
    case "残破玉简":
      addFlags("jade_slip_found", "jade_slip_studied");
      next.comprehension = clamp(next.comprehension + 1, 1, 20);
      next.cultivationExp = clamp(next.cultivationExp + 8, 0, next.cultivationMax);
      notification = "残破玉简在你掌心震动，断裂纹路里藏着一缕古老法意。";
      historyEntry = "参悟残破玉简，玉简线索逐渐浮出水面。";
      break;
    case "残破飞剑":
      next.artifact = "残破飞剑";
      next.mood = clamp(next.mood + 3, 0, 100);
      notification = "残破飞剑虽有缺口，却仍透着一丝凌厉寒意。";
      historyEntry = "修复并炼化残破飞剑，身法更添锋芒。";
      break;
    case "青木令":
      addFlags("qingmu_token");
      next.fate = clamp(next.fate + 1, 1, 20);
      notification = "青木令泛起微光，似乎与某处秘境的机关彼此呼应。";
      historyEntry = "收起青木令，秘境线索已悄然在手。";
      break;
    case "古修钥匙":
      addFlags("ancient_key");
      next.fate = clamp(next.fate + 1, 1, 20);
      notification = "古修钥匙冰冷沉重，钥齿上像是还沾着岁月的尘。";
      historyEntry = "握住古修钥匙，洞府深处的门似乎已被敲响。";
      break;
    case "宗门令牌":
      next.sectContribution += 16;
      next.reputation += 4;
      notification = "宗门令牌落入手中，你在门内的分量又重了几分。";
      historyEntry = "持有宗门令牌，宗门贡献随之积累。";
      break;
    case "悟道茶":
      next.comprehension = clamp(next.comprehension + 2, 1, 20);
      next.mood = clamp(next.mood + 10, 0, 100);
      next.heartDemon = clamp(next.heartDemon - 4, 0, 100);
      addFlags("inner-clarity");
      notification = "悟道茶入口清苦，回味却像有晨钟暮鼓在脑海里回响。";
      historyEntry = "饮下悟道茶，心境明澈了几分。";
      break;
    case "下品飞剑":
      next.artifact = "下品飞剑";
      notification = "装备下品飞剑，历练与秘境收益有所提升。";
      historyEntry = "装备下品飞剑，身形更为凌厉。";
      break;
    default:
      notification = `使用${itemName}没有明显效果。`;
      break;
  }

  next.history = [...next.history, `${next.age}岁，${historyEntry}`];
  return {
    character: next,
    notification,
    history: historyEntry,
  };
};

const marketItems: Record<string, { price: number; description: string }> = {
  聚气丹: { price: 24, description: "快速巩固修为。" },
  凝神丹: { price: 18, description: "提升心境，降低心魔。" },
  小还丹: { price: 16, description: "缓和伤势，适合长途历练后使用。" },
  清心丹: { price: 20, description: "安抚心神，压制翻涌的杂念。" },
  聚灵符: { price: 14, description: "短时引灵入体，小幅提升修为。" },
  遁逃符: { price: 18, description: "遇险保命，减少败退代价。" },
  灵兽内丹: { price: 42, description: "药力凶猛，增长修为也会撩动心魔。" },
  筑基丹: { price: 40, description: "为下一阶段打下基础。" },
  护心丹: { price: 22, description: "缓解心魔，稳定心境。" },
  延寿丹: { price: 38, description: "延长寿元。" },
  残破玉简: { price: 30, description: "参悟后可触发机缘。" },
  残破飞剑: { price: 72, description: "低阶法宝，足以在前期傍身。" },
  青木令: { price: 34, description: "通往特殊秘境的线索。" },
  古修钥匙: { price: 48, description: "古修洞府的门钥，能开启沉睡机关。" },
  宗门令牌: { price: 28, description: "增加宗门贡献与门内认同。" },
  悟道茶: { price: 26, description: "短暂提升悟性与心境。" },
  下品飞剑: { price: 80, description: "装备后提升历练收益。" },
};

export const getSectPromotionInfo = (character: Character) => {
  const order = sectRankOrder;
  const index = order.findIndex((rank) => rank === character.sectRank);
  if (index === -1 || index >= order.length - 1) {
    return null;
  }
  const nextRank = order[index + 1] as PromotionRank;
  const requirements: Record<PromotionRank, { realm: RealmKey[]; contribution: number; reputation: number }> = {
    "外门弟子": { realm: ["炼气五层", "炼气六层", "炼气七层", "炼气八层", "炼气九层"], contribution: 20, reputation: 18 },
    "内门弟子": { realm: ["筑基中期", "筑基后期", "金丹初期", "金丹中期", "金丹后期", "元婴初期"], contribution: 40, reputation: 30 },
    "亲传弟子": { realm: ["筑基后期", "金丹初期", "金丹中期", "金丹后期", "元婴初期"], contribution: 60, reputation: 40 },
    "执事": { realm: ["金丹中期", "金丹后期", "元婴初期"], contribution: 90, reputation: 50 },
    "长老": { realm: ["金丹初期", "金丹中期", "金丹后期", "元婴初期"], contribution: 120, reputation: 60 },
  };
  const nextReq = requirements[nextRank];
  return {
    nextRank,
    ...nextReq,
    satisfied:
      nextReq.realm.includes(character.realm) &&
      character.sectContribution >= nextReq.contribution &&
      character.reputation >= nextReq.reputation,
  };
};

export const promoteSectRank = (character: Character) => {
  const info = getSectPromotionInfo(character);
  if (!info || !info.satisfied) {
    return {
      character,
      notification: "当前尚未满足下一阶段宗门晋升条件。",
      history: undefined,
    };
  }
  const next = { ...character, sectRank: info.nextRank };
  const historyEntry = `${next.age}岁，晋升为${info.nextRank}。`;
  next.history = [...next.history, historyEntry];
  return {
    character: next,
    notification: `你成功晋升为${info.nextRank}。`,
    history: historyEntry,
  };
};

export const normalizeCharacter = (character: Partial<Character>): Character => {
  return {
    name: character.name || "无名弟子",
    age: character.age ?? 15,
    origin: character.origin || "宗门",
    currentIdentity: character.currentIdentity || "无名徒弟",
    spiritRoot: character.spiritRoot || "凡根",
    comprehension: character.comprehension ?? 8,
    fate: character.fate ?? 8,
    charm: character.charm ?? 6,
    realm: character.realm || "炼气一层",
    cultivationExp: character.cultivationExp ?? 0,
    cultivationMax: character.cultivationMax ?? realmBaseMax(character.realm || "炼气一层"),
    spiritStones: character.spiritStones ?? 10,
    reputation: character.reputation ?? 0,
    sectContribution: character.sectContribution ?? 0,
    heartDemon: character.heartDemon ?? randomInt(8, 20),
    mood: character.mood ?? 60,
    lifespan: character.lifespan ?? 100,
    year: character.year ?? 1,
    location: character.location || "宗门",
    relationships: character.relationships || "师门同门",
    inventory: character.inventory ?? [],
    cultivationMethod: character.cultivationMethod,
    artifact: character.artifact,
    sectRank: character.sectRank || "杂役弟子",
    injury: character.injury ?? 0,
    flags: character.flags ?? [],
    recentEventIds: uniqueRecentEvents(character.recentEventIds ?? []),
    history: character.history ?? generateInitialHistory({
      identity: character.currentIdentity || "无名徒弟",
      origin: character.origin || "宗门",
      spiritRoot: character.spiritRoot || "凡根",
      background: "凭空出现在宗门中。",
    }),
    dead: character.dead ?? false,
  };
};

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
  if (effect.inventory) {
    next.inventory = [...next.inventory, ...effect.inventory];
  }
  if (effect.artifact) {
    next.artifact = effect.artifact;
  }
  if (effect.cultivationMethod) {
    next.cultivationMethod = effect.cultivationMethod;
  }
  if (effect.setFlags) {
    next.flags = Array.from(new Set([...next.flags, ...effect.setFlags]));
  }
  if (effect.clearFlags) {
    next.flags = next.flags.filter((flag) => !effect.clearFlags?.includes(flag));
  }
  if (effect.sectContribution) {
    next.sectContribution = Math.max(0, next.sectContribution + effect.sectContribution);
  }
  if (effect.heartDemon) {
    next.heartDemon = clamp(next.heartDemon + effect.heartDemon, 0, 100);
  }
  if (effect.injury) {
    next.injury = clamp(next.injury + effect.injury, 0, 100);
  }
  return next;
};

export const calculateBreakthroughChance = (character: Character) => {
  const index = realmOrder.indexOf(character.realm);
  const basePower = character.mood * 0.75 + character.fate * 1.1 + character.comprehension * 0.7;
  const methodBonus = character.cultivationMethod ? 5 : 0;
  const artifactBonus = character.artifact ? 8 : 0;
  const injuryPenalty = character.injury > 20 ? (character.injury - 20) * 0.35 : 0;
  const heartDemonPenalty = character.heartDemon > 24 ? (character.heartDemon - 24) * 0.3 : 0;
  const clarityBonus = character.flags.includes("inner-clarity") ? 4 : 0;
  const difficulty = 1 + index * 0.17;
  const rawChance = (basePower + methodBonus + artifactBonus + clarityBonus - injuryPenalty - heartDemonPenalty + 20) / difficulty;
  return clamp(rawChance, 8, 92);
};

export const cultivate = (character: Character) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，不可再继续修炼。",
      event: undefined,
    };
  }

  let next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = randomLocation();

  if (next.cultivationExp >= next.cultivationMax) {
    next = markDeathIfNeeded(next);
    return {
      character: next,
      notification: next.dead
        ? "寿元耗尽，已进入坐化，无需再修炼。"
        : "修为已达到当前上限，先尝试突破方可更进一步。",
      event: undefined,
    };
  }

  next = markDeathIfNeeded(next);
  if (next.dead) {
    return {
      character: next,
      notification: "寿元耗尽，已进入坐化，无需再修炼。",
      event: undefined,
    };
  }

  const eventChance = Math.random();
  if (eventChance < 0.35) {
    const { event, character: tracked } = chooseActionEvent(next, "cultivation", 0.12);
    return {
      character: tracked,
      notification: "修炼中触发了特殊事件。",
      event,
    };
  }

  const spiritMultiplier = getSpiritRootCultivationMultiplier(next.spiritRoot);
  const injuryPenalty = Math.round(next.injury * 0.18);
  const clarityBonus = next.flags.includes("inner-clarity") ? 3 : 0;
  const baseGain = Math.round(
    (12 + next.comprehension * 1.2 + next.fate * 0.4) * spiritMultiplier
  );
  const gain = Math.max(4, baseGain + clarityBonus - injuryPenalty);
  next.injury = clamp(next.injury - 2, 0, 100);
  next.cultivationExp = clamp(next.cultivationExp + gain, 0, next.cultivationMax);
  next.mood = clamp(next.mood + 2, 0, 100);

  if (Math.random() < 0.25) {
    next.history = [
      ...next.history,
      `${next.age}岁，闭关修炼中领悟一丝窍门，修为稍有增长。`,
    ];
  }

  const reached = next.cultivationExp >= next.cultivationMax;
  return {
    character: next,
    notification: reached
      ? "修为已充盈，可尝试突破！"
      : `闭关修炼获得 ${gain} 修为，当前修为 ${next.cultivationExp}/${next.cultivationMax}。`,
    event: undefined,
  };
};

export const startAdventure = (character: Character, route?: string) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无需再外出历练。",
      event: undefined,
    };
  }

  let next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = route || randomLocation();
  next.mood = clamp(next.mood - (route === "妖兽山脉" ? 6 : route === "古修洞府" ? 8 : 3), 0, 100);

  if (route === "妖兽山脉") {
    next.injury = clamp(next.injury + randomInt(4, 10), 0, 100);
  } else if (route === "古修洞府") {
    next.injury = clamp(next.injury + randomInt(2, 7), 0, 100);
  }

  next = markDeathIfNeeded(next);
  if (next.dead) {
    return {
      character: next,
      notification: "寿元耗尽，已进入坐化，历练之路已停止。",
      event: undefined,
    };
  }

  next = maybePromoteSectRank(next);

  const relationshipRoll = Math.random();
  if (relationshipRoll < 0.08) {
    const { event, character: tracked } = chooseActionEvent(next, "relationship");
    return {
      character: tracked,
      notification: `你在${next.location}遇见了旧人旧事，风波将至。`,
      event,
    };
  }

  const adventureEvent = chooseActionEvent(next, "adventure", 0.08);
  return {
    character: adventureEvent.character,
    notification: `你前往${next.location}历练，机缘与险阻并存。`,
    event: adventureEvent.event,
  };
};

export const doSectMission = (character: Character) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无法执行宗门任务。",
      event: undefined,
    };
  }

  const next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = "宗门任务堂";
  next.mood = clamp(next.mood - 2, 0, 100);
  const event =
    Math.random() < 0.15 ? getRandomEvent(next, "relationship") : getRandomSectMissionEvent(next);
  return {
    character: recordRecentEvent(next, event.id),
    notification: "你接下了一件宗门任务，如何处理将决定最终收获与代价。",
    event,
    history: `${next.age}岁，在宗门任务堂接取任务。`,
  };
};

export const doSectContest = (character: Character) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无法参加宗门小比。",
      event: undefined,
    };
  }

  const next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = "宗门擂台";
  next.mood = clamp(next.mood - 5, 0, 100);

  const success = Math.random() < 0.6;
  if (success) {
    const repGain = randomInt(5, 12);
    const contribution = randomInt(6, 14);
    next.reputation += repGain;
    next.sectContribution += contribution;
    next.cultivationExp = clamp(next.cultivationExp + 10, 0, next.cultivationMax);
    next.history = [
      ...next.history,
      `${next.age}岁，参加宗门小比并获得胜利，声望 +${repGain}、宗门贡献 +${contribution}。`,
    ];
    return {
      character: next,
      notification: `宗门小比胜出，声望 +${repGain}、贡献 +${contribution}。`,
      event: undefined,
      history: `${next.age}岁，宗门小比获胜。`,
    };
  }

  const injury = randomInt(3, 9);
  next.injury = clamp(next.injury + injury, 0, 100);
  next.history = [
    ...next.history,
    `${next.age}岁，参加宗门小比失利，受伤 +${injury}。`,
  ];
  return {
    ...chooseActionEvent(next, "sect", 0.08),
    notification: `宗门小比失利，受伤 +${injury}。`,
    history: `${next.age}岁，宗门小比失利。`,
  };
};

export const visitMarket = (character: Character) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无法前往坊市。",
      event: undefined,
    };
  }

  let next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = "坊市";
  next.mood = clamp(next.mood - 3, 0, 100);
  const cost = randomInt(8, 18);
  next.spiritStones = Math.max(0, next.spiritStones - cost);

  next = maybePromoteSectRank(next);

  if (Math.random() < 0.1) {
    const { event, character: tracked } = chooseActionEvent(next, "relationship", 0.2);
    return {
      character: tracked,
      notification: "坊市人潮里暗流涌动，你撞见了一段耐人寻味的关系网。",
      event,
      history: `${next.age}岁，坊市见闻引出一段人际波澜。`,
    };
  }

  return {
    ...chooseActionEvent(next, "market", 0.14),
    notification: "坊市交易开始，机缘与风险并存。",
    history: `${next.age}岁，前往坊市，花费灵石 ${cost}。`,
  };
};

export const getMarketItems = () => marketItems;

export const buyMarketItem = (character: Character, itemName: string) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无法购买物品。",
      history: undefined,
    };
  }

  const item = marketItems[itemName as keyof typeof marketItems];
  if (!item) {
    return {
      character,
      notification: "坊市中没有这种物品。",
      history: undefined,
    };
  }

  if (character.spiritStones < item.price) {
    return {
      character,
      notification: `灵石不足，无法购买${itemName}。`,
      history: undefined,
    };
  }

  const next = { ...character };
  next.spiritStones -= item.price;
  next.inventory = [...next.inventory, itemName];
  next.history = [...next.history, `${next.age}岁，购买了${itemName}。`];

  return {
    character: next,
    notification: `你购买了${itemName}。`,
    history: `${next.age}岁，购买了${itemName}。`,
  };
};

export const exploreSecretRealm = (character: Character, route?: string) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无法进入秘境。",
      event: undefined,
    };
  }

  let next = { ...character };
  next.year += 1;
  next.age += 1;
  next.location = route || "秘境入口";
  next.mood = clamp(
    next.mood - (route === "挑战核心区域" ? 10 : route === "深入秘境" ? 7 : 4),
    0,
    100
  );
  next.lifespan = Math.max(0, next.lifespan - (route === "挑战核心区域" ? 6 : route === "深入秘境" ? 4 : 2));

  if (route === "挑战核心区域") {
    next.injury = clamp(next.injury + randomInt(6, 14), 0, 100);
  } else if (route === "深入秘境") {
    next.injury = clamp(next.injury + randomInt(3, 9), 0, 100);
  }

  next = maybePromoteSectRank(next);

  if (Math.random() < 0.08) {
    const { event, character: tracked } = chooseActionEvent(next, "relationship", 0.1);
    return {
      character: tracked,
      notification: `秘境深处忽有一道熟悉气息闪过，你被卷入一段旧缘。`,
      event,
      history: `${next.age}岁，秘境中牵出旧缘。`,
    };
  }

  return {
    ...chooseActionEvent(next, "secretRealm", 0.08),
    notification: `你进入了${next.location}，秘境机缘难料。`,
    history: `${next.age}岁，探索${next.location}，秘境之旅继续。`,
  };
};

export const adjustMindset = (character: Character) => {
  if (character.dead) {
    return {
      character,
      notification: "你已坐化，无法调整心境。",
      event: undefined,
    };
  }

  let next = { ...character };
  next.year += 1;
  next.age += 1;
  next.mood = clamp(next.mood + 14, 0, 100);
  next.spiritStones = Math.max(0, next.spiritStones - 5);
  next.heartDemon = clamp(next.heartDemon - 6, 0, 100);
  next.cultivationMethod = next.cultivationMethod || getRandomMethod();

  next = maybePromoteSectRank(next);

  if (Math.random() < 0.12) {
    const { event, character: tracked } = chooseActionEvent(next, "relationship");
    return {
      character: tracked,
      notification: "静坐调息时，一段人情往事忽然浮上心头。",
      event,
      history: `${next.age}岁，静修时被旧事牵动。`,
    };
  }

  return {
    character: next,
    notification: "调整心境成功，心境平稳，对突破更加有利。",
    event: undefined,
    history: `${next.age}岁，静心调整心境，心魔压减，修行更为顺畅。`,
  };
};

export const attemptBreakthrough = (character: Character) => {
  if (character.dead) {
    return {
      character,
      success: false,
      notification: "你已坐化，无法继续突破。",
      history: undefined,
    };
  }

  const next = { ...character };
  if (next.cultivationExp < next.cultivationMax) {
    return {
      character: next,
      success: false,
      notification: "修为未达上限，无法突破。",
      history: undefined,
    };
  }

  const currentIndex = realmOrder.indexOf(next.realm);
  if (currentIndex >= realmOrder.length - 1) {
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
    next.lifespan = Math.max(0, next.lifespan + getRealmLifespanBonus(nextRealm));
    const history = `${next.age}岁，在${next.location}突破到${nextRealm}，寿元延续了 ${getRealmLifespanBonus(nextRealm)} 年。`;
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
  const shouldTriggerEvent = Math.random() < 0.4;
  const breakthroughEvent = shouldTriggerEvent ? chooseActionEvent(next, "breakthrough", 0.1) : null;
  return {
    character: breakthroughEvent?.character ?? next,
    success: false,
    notification: `突破失败，修为下降 ${loss}。`,
    history,
    event: breakthroughEvent?.event,
  };
};

export const resolveEventChoice = (
  character: Character,
  event: GameEvent,
  choiceId: string
): { character: Character; notification: string; history?: string; event?: GameEvent; currentCombat?: CombatState } => {
  const next = { ...character };
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) {
    return {
      character: next,
      notification: "选择无效，事件未能继续。",
    };
  }
  const updated = applyEffectToCharacter(next, choice.effect);
  updated.recentEventIds = uniqueRecentEvents([...(updated.recentEventIds ?? []), event.id]);
  updated.location = randomLocation();
  updated.history = [
    ...updated.history,
    `${updated.age}岁，${choice.extraHistory ?? choice.resultText}`,
  ];

  const response: {
    character: Character;
    notification: string;
    history?: string;
    event?: GameEvent;
    currentCombat?: CombatState;
  } = {
    character: updated,
    notification: `${choice.resultText}${
      describeEventEffect(choice.effect).length
        ? `\n结算：${describeEventEffect(choice.effect).join("，")}`
        : ""
    }`,
    history: choice.extraHistory,
  };

  if (choice.triggerCombat && choice.combatScene) {
    const enemy = createEnemyByRealm(updated, choice.combatScene);
    response.currentCombat = createCombatState(updated, enemy);
    response.event = undefined;
  }

  return response;
};
