import type { Character, CombatEnemy, CombatSkill, CombatState, RealmKey } from "../types/game";
import { realmOrder } from "../data/realms";

type EnemySceneType = "adventure" | "sect" | "secretRealm" | "event";

const weightedPick = <T extends { weight?: number }>(items: T[]) => {
  if (!items.length) return undefined;
  const total = items.reduce((sum, item) => sum + Math.max(1, item.weight ?? 1), 0);
  let cursor = Math.random() * total;
  for (const item of items) {
    cursor -= Math.max(1, item.weight ?? 1);
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
};

const sceneEnemies: Record<EnemySceneType, Array<{ name: string; weight: number }>> = {
  adventure: [
    { name: "山中妖狼", weight: 6 },
    { name: "赤目虎", weight: 4 },
    { name: "铁背熊", weight: 4 },
    { name: "劫修", weight: 5 },
    { name: "游荡散修", weight: 4 },
    { name: "毒雾妖蛇", weight: 2 },
  ],
  sect: [
    { name: "外门弟子", weight: 5 },
    { name: "内门弟子", weight: 3 },
    { name: "试炼傀儡", weight: 5 },
    { name: "宗门小比对手", weight: 3 },
    { name: "挑衅师兄", weight: 2 },
  ],
  secretRealm: [
    { name: "秘境守护兽", weight: 4 },
    { name: "古修傀儡", weight: 4 },
    { name: "魔道散修", weight: 2 },
    { name: "夺宝修士", weight: 4 },
    { name: "阵灵残影", weight: 3 },
    { name: "石像守卫", weight: 3 },
  ],
  event: [
    { name: "山中妖狼", weight: 4 },
    { name: "劫修", weight: 4 },
    { name: "外门弟子", weight: 3 },
    { name: "夺宝修士", weight: 3 },
    { name: "试炼傀儡", weight: 2 },
    { name: "魔道散修", weight: 2 },
  ],
};

const baseEnemyStats = (realm: RealmKey, scene: EnemySceneType, elite = false): Omit<CombatEnemy, "id" | "name"> => {
  const index = realmOrder.indexOf(realm);
  const factor = 1 + index * 0.1;
  const eliteFactor = elite ? 1.18 : 1;
  const sceneHpBonus =
    scene === "secretRealm" ? 16 : scene === "sect" ? 8 : scene === "adventure" ? 4 : 6;
  const sceneAttackBonus = scene === "secretRealm" ? 5 : scene === "sect" ? 3 : scene === "adventure" ? 2 : 3;
  const sceneDefenseBonus = scene === "sect" ? 3 : scene === "secretRealm" ? 4 : 1;
  const sceneSpeedBonus = scene === "adventure" ? 2 : scene === "event" ? 1 : 0;

  const maxHp = Math.round((40 + index * 8 + factor * 10 + sceneHpBonus) * eliteFactor);
  return {
    realm,
    maxHp,
    hp: maxHp,
    attack: Math.round((8 + index * 2 + sceneAttackBonus) * eliteFactor),
    defense: Math.round((4 + index * 1 + sceneDefenseBonus) * eliteFactor),
    speed: Math.round((6 + index * 1 + sceneSpeedBonus) * eliteFactor),
    description: "",
    rewards: {
      cultivationExp: Math.round((10 + index * 4) * (elite ? 1.25 : 1)),
      spiritStones: Math.round((10 + index * 3) * (elite ? 1.2 : 1)),
      reputation: 2 + Math.floor(index / 3),
      items: [],
    },
  };
};

const enemyTemplates: Record<string, (realm: RealmKey) => CombatEnemy> = {
  山中妖狼: (realm) => ({
    id: "wolf",
    name: "山中妖狼",
    ...baseEnemyStats(realm, "adventure"),
    description: "成群出没的山中妖兽，擅长在夜色里追猎独行修士。",
    rewards: { ...baseEnemyStats(realm, "adventure").rewards, spiritStones: 12 + realmOrder.indexOf(realm) * 3, items: ["小还丹"] },
  }),
  赤目虎: (realm) => ({
    id: "redTiger",
    name: "赤目虎",
    ...baseEnemyStats(realm, "adventure", true),
    description: "双目赤红的猛虎，扑击时带着令人窒息的腥风。",
    rewards: { ...baseEnemyStats(realm, "adventure", true).rewards, cultivationExp: 16 + realmOrder.indexOf(realm) * 4, items: ["清心丹"] },
  }),
  铁背熊: (realm) => ({
    id: "ironBear",
    name: "铁背熊",
    ...baseEnemyStats(realm, "adventure"),
    description: "背甲如铁，血气粗暴，最擅长正面冲撞。",
    rewards: { ...baseEnemyStats(realm, "adventure").rewards, spiritStones: 18 + realmOrder.indexOf(realm) * 4, items: ["聚气丹"] },
  }),
  劫修: (realm) => ({
    id: "bandit",
    name: "劫修",
    ...baseEnemyStats(realm, "adventure"),
    description: "为夺灵石而四处埋伏的散修，手段阴狠。",
    rewards: { ...baseEnemyStats(realm, "adventure").rewards, spiritStones: 20 + realmOrder.indexOf(realm) * 5, items: ["遁逃符"] },
  }),
  游荡散修: (realm) => ({
    id: "wanderer",
    name: "游荡散修",
    ...baseEnemyStats(realm, "adventure"),
    description: "游走四方的孤身修士，似敌似友，出手全看利害。",
    rewards: { ...baseEnemyStats(realm, "adventure").rewards, reputation: 3, items: ["悟道茶"] },
  }),
  毒雾妖蛇: (realm) => ({
    id: "poisonSerpent",
    name: "毒雾妖蛇",
    ...baseEnemyStats(realm, "adventure", true),
    description: "蛇身缠雾，毒息入骨，稍有不慎便会伤及心脉。",
    rewards: { ...baseEnemyStats(realm, "adventure", true).rewards, cultivationExp: 18, items: ["清心丹"] },
  }),
  外门弟子: (realm) => ({
    id: "outerDisciple",
    name: "外门弟子",
    ...baseEnemyStats(realm, "sect"),
    description: "因资源倾斜而心生怨气的外门弟子，出手颇重。",
    rewards: { ...baseEnemyStats(realm, "sect").rewards, reputation: 4, items: ["宗门令牌"] },
  }),
  内门弟子: (realm) => ({
    id: "innerDisciple",
    name: "内门弟子",
    ...baseEnemyStats(realm, "sect", true),
    description: "内门同辈中颇有名气的修士，术法和身法都更老练。",
    rewards: { ...baseEnemyStats(realm, "sect", true).rewards, reputation: 6, items: ["聚灵符"] },
  }),
  试炼傀儡: (realm) => ({
    id: "trialGolem",
    name: "试炼傀儡",
    ...baseEnemyStats(realm, "sect"),
    description: "宗门布置的试炼傀儡，专为磨炼弟子而设。",
    rewards: { ...baseEnemyStats(realm, "sect").rewards, cultivationExp: 14, items: ["聚气丹"] },
  }),
  宗门小比对手: (realm) => ({
    id: "contestRival",
    name: "宗门小比对手",
    ...baseEnemyStats(realm, "sect", true),
    description: "宗门小比中的劲敌，招式凶悍，赢了也会记住你。",
    rewards: { ...baseEnemyStats(realm, "sect", true).rewards, reputation: 7, items: ["宗门令牌"] },
  }),
  挑衅师兄: (realm) => ({
    id: "provokingSenior",
    name: "挑衅师兄",
    ...baseEnemyStats(realm, "sect", true),
    description: "倚仗资历压人的师兄，常在门中挑起争端。",
    rewards: { ...baseEnemyStats(realm, "sect", true).rewards, reputation: 5, items: ["清心丹"] },
  }),
  秘境守护兽: (realm) => ({
    id: "guardianBeast",
    name: "秘境守护兽",
    ...baseEnemyStats(realm, "secretRealm"),
    description: "守护秘境入口的异兽，伤人之前总会先逼你现形。",
    rewards: { ...baseEnemyStats(realm, "secretRealm").rewards, spiritStones: 24 + realmOrder.indexOf(realm) * 4, items: ["青木令"] },
  }),
  古修傀儡: (realm) => ({
    id: "ancientGolem",
    name: "古修傀儡",
    ...baseEnemyStats(realm, "secretRealm"),
    description: "古修洞府中沉眠的傀儡，法阵越老，它越像活物。",
    rewards: { ...baseEnemyStats(realm, "secretRealm").rewards, cultivationExp: 20, items: ["古修钥匙"] },
  }),
  魔道散修: (realm) => ({
    id: "heretic",
    name: "魔道散修",
    ...baseEnemyStats(realm, "secretRealm", true),
    description: "踏入邪途的修士，常以秘法和心魔为刃。",
    rewards: { ...baseEnemyStats(realm, "secretRealm", true).rewards, reputation: 1, items: ["灵兽内丹"] },
  }),
  夺宝修士: (realm) => ({
    id: "treasureSeeker",
    name: "夺宝修士",
    ...baseEnemyStats(realm, "secretRealm"),
    description: "为争夺秘宝而来的修士，眼里只有输赢与代价。",
    rewards: { ...baseEnemyStats(realm, "secretRealm").rewards, reputation: 5, items: ["残破飞剑"] },
  }),
  阵灵残影: (realm) => ({
    id: "arraySpirit",
    name: "阵灵残影",
    ...baseEnemyStats(realm, "secretRealm", true),
    description: "残阵深处凝成的灵影，像阵法本身在反击外来者。",
    rewards: { ...baseEnemyStats(realm, "secretRealm", true).rewards, cultivationExp: 18, items: ["悟道茶"] },
  }),
  石像守卫: (realm) => ({
    id: "stoneGuard",
    name: "石像守卫",
    ...baseEnemyStats(realm, "secretRealm", true),
    description: "沉睡百年的石像守卫，一旦苏醒便是死斗。",
    rewards: { ...baseEnemyStats(realm, "secretRealm", true).rewards, spiritStones: 28, items: ["小还丹"] },
  }),
};

const skillTemplates: Record<string, CombatSkill[]> = {
  青云诀: [
    { id: "qingyun-sword", name: "青云剑气", description: "中等伤害，消耗灵力。", mpCost: 10, damageMultiplier: 1.2, effect: "none" },
    { id: "yunyin-step", name: "云隐步", description: "降低下一次受到的伤害。", mpCost: 6, damageMultiplier: 0, effect: "shield" },
  ],
  长春功: [
    { id: "rejuvenate", name: "回春术", description: "恢复生命。", mpCost: 8, damageMultiplier: 0, effect: "heal" },
    { id: "spirit-breath", name: "长春灵息", description: "回复灵力并降低心魔。", mpCost: 6, damageMultiplier: 0, effect: "heal" },
  ],
  烈阳剑诀: [
    { id: "lieshan-strike", name: "烈阳斩", description: "高伤害，可能自损。", mpCost: 12, damageMultiplier: 1.4, selfInjuryRisk: 8, effect: "none" },
    { id: "burning-heart", name: "焚心一击", description: "更高伤害，增加心魔。", mpCost: 14, damageMultiplier: 1.6, heartDemonCost: 6, effect: "none" },
  ],
  玄阴诀: [
    { id: "xuanyin-finger", name: "玄阴指", description: "中高伤害，并可能降低敌攻。", mpCost: 11, damageMultiplier: 1.3, effect: "bleed" },
    { id: "yin-sin", name: "阴煞反噬", description: "高伤害，但增加心魔。", mpCost: 15, damageMultiplier: 1.7, heartDemonCost: 8, effect: "none" },
  ],
  无名残卷: [
    { id: "scroll-strike", name: "残卷杀招", description: "高伤害，可能反噬。", mpCost: 14, damageMultiplier: 1.8, selfInjuryRisk: 12, effect: "none" },
    { id: "talisman-awakening", name: "道纹顿悟", description: "小概率重创敌人，也可能受伤。", mpCost: 16, damageMultiplier: 2.2, selfInjuryRisk: 10, effect: "none" },
  ],
};

export const createEnemyByRealm = (character: Character, sceneType: EnemySceneType) => {
  const pool = sceneEnemies[sceneType];
  const name = weightedPick(pool)?.name ?? pool[0].name;
  const enemy = enemyTemplates[name](character.realm);
  return { ...enemy, hp: enemy.maxHp };
};

export const createCombatState = (character: Character, enemy: CombatEnemy): CombatState => {
  const realmIndex = realmOrder.indexOf(character.realm);
  const baseHp = 80 + realmIndex * 6 - Math.round(character.injury * 0.6);
  const playerMaxHp = Math.max(40, baseHp + (character.artifact === "下品飞剑" || character.artifact === "残破飞剑" ? 10 : 0));
  const playerMaxMp = 50 + character.comprehension * 5 + (character.artifact === "下品飞剑" || character.artifact === "残破飞剑" ? 4 : 0);

  return {
    enemy: { ...enemy },
    playerHp: playerMaxHp,
    playerMaxHp,
    playerMp: playerMaxMp,
    playerMaxMp,
    round: 1,
    logs: [`战斗开始：遇到${enemy.name}。`],
    isPlayerTurn: character.fate >= enemy.speed,
    finished: false,
    playerShield: 0,
    enemyStunned: false,
  };
};

export const getAvailableSkills = (character: Character): CombatSkill[] => {
  const skills: CombatSkill[] = [
    { id: "basic-attack", name: "普通攻击", description: "基础打击，稳定输出。", damageMultiplier: 1, effect: "none" },
    { id: "guard-breath", name: "防御调息", description: "减少下一次受到的伤害，恢复少量灵力。", mpCost: 0, damageMultiplier: 0, effect: "shield" },
  ];

  if (character.cultivationMethod && skillTemplates[character.cultivationMethod]) {
    skills.push(...skillTemplates[character.cultivationMethod]);
  }
  if (character.flags.includes("jade_slip_studied") || character.flags.includes("nameless_scroll_unlocked")) {
    skills.push(...skillTemplates["无名残卷"]);
  }
  if (character.artifact === "下品飞剑" || character.artifact === "残破飞剑") {
    skills.push({
      id: "flying-sword",
      name: "飞剑突袭",
      description: "法宝突袭，消耗灵力。", mpCost: 8,
      damageMultiplier: 1.25,
      effect: "none",
    });
  }

  return skills;
};

export const playerUseSkill = (
  character: Character,
  combatState: CombatState,
  skillId: string
): CombatState => {
  const skills = getAvailableSkills(character);
  const skill = skills.find((item) => item.id === skillId) ?? skills[0];
  const next = { ...combatState };
  const mpCost = skill.mpCost ?? 0;
  next.playerMp = Math.max(0, next.playerMp - mpCost);
  let damage = Math.round((character.comprehension + 6) * skill.damageMultiplier + 2);
  if (skill.effect === "heal") {
    const healAmount = 10 + Math.round(character.comprehension * 1.2);
    next.playerHp = Math.min(next.playerMaxHp, next.playerHp + healAmount);
    next.logs.push(`你使用${skill.name}，回复了${healAmount}点气血。`);
  } else if (skill.effect === "shield") {
    next.playerShield = Math.max(next.playerShield ?? 0, 8 + Math.round(character.fate * 0.4));
    next.playerMp = Math.min(next.playerMaxMp, next.playerMp + 6);
    next.logs.push(`你使用${skill.name}，凝聚护盾并恢复灵力。`);
  } else {
    const crit = Math.random() < 0.1 ? 1.2 : 1;
    damage = Math.round(damage * crit);
    const enemyDefense = next.enemy.defense;
    const finalDamage = Math.max(1, damage - Math.round(enemyDefense * 0.3));
    next.enemy.hp = Math.max(0, next.enemy.hp - finalDamage);
    next.logs.push(`你使用${skill.name}，对${next.enemy.name}造成${finalDamage}点伤害。`);
    if (crit > 1) {
      next.logs.push("爆击！伤害提高。");
    }
    if (skill.selfInjuryRisk && Math.random() < skill.selfInjuryRisk / 100) {
      const selfInjury = Math.round(skill.selfInjuryRisk);
      next.logs.push(`技能反噬，你受到了${selfInjury}点内伤。`);
    }
  }

  if (skill.heartDemonCost) {
    character.heartDemon = Math.min(100, character.heartDemon + skill.heartDemonCost);
  }
  if (skill.selfInjuryRisk && Math.random() < skill.selfInjuryRisk / 100) {
    const injury = Math.round(skill.selfInjuryRisk);
    next.logs.push(`你使用${skill.name}时自损${injury}点伤势。`);
  }

  if (next.enemy.hp <= 0) {
    next.finished = true;
    next.result = "win";
    next.logs.push(`你击败了${next.enemy.name}。`);
  } else {
    next.isPlayerTurn = false;
  }
  return next;
};

const calculateEnemyDamage = (enemy: CombatEnemy, playerShield: number) => {
  const raw = enemy.attack + Math.round(Math.random() * 4);
  const blocked = Math.min(playerShield, Math.round(raw * 0.4));
  return Math.max(1, raw - blocked);
};

export const enemyTakeTurn = (combatState: CombatState): CombatState => {
  const next = { ...combatState };
  if (next.enemyStunned) {
    next.logs.push(`${next.enemy.name}被震慑，本回合行动受阻。`);
    next.enemyStunned = false;
  } else {
    const damage = calculateEnemyDamage(next.enemy, next.playerShield ?? 0);
    next.playerHp = Math.max(0, next.playerHp - damage);
    next.logs.push(`${next.enemy.name}发动攻击，造成${damage}点伤害。`);
    next.playerShield = 0;
  }
  next.round += 1;
  if (next.playerHp <= 0) {
    next.finished = true;
    next.result = "lose";
    next.logs.push("你被击倒，战斗失败。");
  } else {
    next.isPlayerTurn = true;
  }
  return next;
};

export const skipCombat = (character: Character, combatState: CombatState): CombatState => {
  const next = { ...combatState };
  next.logs.push("你选择快速结束战斗。");
  for (let i = 0; i < 30 && !next.finished; i += 1) {
    if (next.isPlayerTurn) {
      const skills = getAvailableSkills(character);
      const attack = skills.find((item) => item.effect === "none" && item.id !== "basic-attack") || skills[0];
      const info = playerUseSkill(character, next, attack.id);
      Object.assign(next, info);
    } else {
      Object.assign(next, enemyTakeTurn(next));
    }
  }
  if (!next.finished) {
    next.finished = true;
    next.result = next.enemy.hp <= next.playerHp ? "win" : "lose";
    next.logs.push(`最终战斗结束，结果为${next.result === "win" ? "胜利" : "失败"}。`);
  }
  return next;
};

export const getCombatOutcomeMessages = (combatState: CombatState) => {
  if (combatState.result === "win") {
    const reward = combatState.enemy.rewards;
    const messages = [
      `修为 +${reward.cultivationExp ?? 0}`,
      `灵石 +${reward.spiritStones ?? 0}`,
      `声望 +${reward.reputation ?? 0}`,
    ];

    if (reward.items?.length) {
      messages.push(`物品：${reward.items.join("、")}`);
    }

    return messages;
  }

  if (combatState.result === "lose" || combatState.result === "escape") {
    return ["伤势 +8~14", "心魔 +6", "灵石 -8", "心境 -10"];
  }

  return [];
};

export const applyCombatResult = (character: Character, combatState: CombatState) => {
  const next = { ...character };
  if (combatState.result === "win") {
    const reward = combatState.enemy.rewards;
    next.cultivationExp = Math.min(next.cultivationMax, next.cultivationExp + (reward.cultivationExp ?? 0));
    next.spiritStones += reward.spiritStones ?? 0;
    next.reputation += reward.reputation ?? 0;
    if (reward.items?.length) {
      next.inventory = [...next.inventory, ...reward.items];
    }
    next.history = [...next.history, `${next.age}岁，击败${combatState.enemy.name}，获得机缘。`];
    next.location = "战场";
  } else {
    const hasEscapeCharm = next.flags.includes("escape_talisman");
    next.flags = next.flags.filter((flag) => flag !== "escape_talisman");
    const injuryGain = hasEscapeCharm ? 4 + Math.round(Math.random() * 3) : 8 + Math.round(Math.random() * 6);
    const heartDemonGain = hasEscapeCharm ? 3 : 6;
    const stoneLoss = hasEscapeCharm ? 3 : 8;
    const moodLoss = hasEscapeCharm ? 6 : 10;
    next.injury = Math.min(100, next.injury + injuryGain);
    next.heartDemon = Math.min(100, next.heartDemon + heartDemonGain);
    next.spiritStones = Math.max(0, next.spiritStones - stoneLoss);
    next.mood = Math.max(0, next.mood - moodLoss);
    next.history = [
      ...next.history,
      hasEscapeCharm
        ? `${next.age}岁，败退时借遁逃符脱身，仍有余伤但损失大幅减轻。`
        : `${next.age}岁，战败退却，受创颇深。`,
    ];
    next.location = "退路";
  }
  return next;
};
