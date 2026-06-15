import type { GameEvent } from "../types/game";

export const gameEvents: GameEvent[] = [
  {
    id: "backhill-sound",
    title: "后山异响",
    category: "宗门事件",
    description:
      "你在宗门后山修炼时，听见石壁后传来若有若无的剑鸣声。",
    choices: [
      {
        id: "A",
        label: "上前查看",
        description: "试探石壁后的秘密，或许有机缘。",
        resultText: "你在石壁缝隙间发现一卷残破剑诀，心神一振。",
        effect: { cultivationExp: 15, fate: 3, reputation: 2 },
        extraHistory: "在后山发现了残破剑诀。",
      },
      {
        id: "B",
        label: "立刻离开",
        description: "谨慎为上，避免招惹危险。",
        resultText: "你悄然离开，避开了可能的危机，但未获机缘。",
        effect: { mood: 5, reputation: 1 },
        extraHistory: "选择远离异响，避免险境。",
      },
      {
        id: "C",
        label: "先观察四周",
        description: "稳妥行事，等待最佳时机。",
        resultText: "你发现身后有妖兽潜行，及时退回，保住了性命。",
        effect: { mood: 2, reputation: 2 },
        extraHistory: "观察四周后发现妖兽，及时退回。",
      },
    ],
  },
  {
    id: "hidden-lotus",
    title: "神秘莲台",
    category: "机缘事件",
    description:
      "炼丹房下的古井中浮现淡淡莲光，一个奇异莲台悄然绽放。",
    choices: [
      {
        id: "A",
        label: "伸手摘取",
        description: "大胆一试，或许莲花可补心境。",
        resultText: "你摘下莲台，心境愈发宁静，修炼更顺。",
        effect: { mood: 10, cultivationExp: 10 },
        extraHistory: "获得神秘莲台，心境大幅提升。",
      },
      {
        id: "B",
        label: "观其变化",
        description: "谨慎思索，不让机缘消散。",
        resultText: "莲台释放出的暖意令你收获新的悟性。",
        effect: { comprehension: 3, fate: 2 },
        extraHistory: "观察莲台机缘，悟性小增。",
      },
      {
        id: "C",
        label: "不敢冒险",
        description: "小心谨慎，避免触发古怪。",
        resultText: "你退入阴影，莲台绽放后消失，保持了安全。",
        effect: { mood: 3 },
        extraHistory: "放弃莲台机缘，选择稳妥。",
      },
    ],
  },
  {
    id: "valley-ambush",
    title: "山谷埋伏",
    category: "冒险事件",
    description:
      "你外出历练于幽冥谷间，忽然四周传来低沉兽吼。",
    choices: [
      {
        id: "A",
        label: "迎敌而上",
        description: "以勇气化解危机，拼死一搏。",
        resultText: "你破开包围，获得灵石与声望的回报。",
        effect: { spiritStones: 20, reputation: 5, cultivationExp: 10 },
        extraHistory: "在幽冥谷成功突围，获得灵石与声望。",
      },
      {
        id: "B",
        label: "隐入树林",
        description: "选择撤退，保留实力。",
        resultText: "你避过了危险，但错失了一次机缘。",
        effect: { mood: 5, fate: 1 },
        extraHistory: "在危机中选择撤退，保存实力。",
      },
      {
        id: "C",
        label: "引开妖兽",
        description: "智取为先，不正面冲突。",
        resultText: "你成功引开妖兽，顺利携带灵石离开。",
        effect: { spiritStones: 10, reputation: 3 },
        extraHistory: "巧妙引开妖兽，获得部分灵石。",
      },
    ],
  },
  {
    id: "sect-feast",
    title: "宗门盛宴",
    category: "人际事件",
    description:
      "宗门举办盛宴，长老与同门齐聚，你的表现将被众人察觉。",
    choices: [
      {
        id: "A",
        label: "谦逊有礼",
        description: "稳妥待人，积累口碑。",
        resultText: "你礼貌周到，获得长老的赞赏。",
        effect: { reputation: 6, mood: 5 },
        extraHistory: "在宗门盛宴中礼貌待人，获得赞赏。",
      },
      {
        id: "B",
        label: "高调炫耀",
        description: "展示实力，争取更多关注。",
        resultText: "你吸引了目光，但也招来了嫉妒。",
        effect: { reputation: 4, mood: -5 },
        extraHistory: "在盛宴中高调表现，引起争议。",
      },
      {
        id: "C",
        label: "冷眼旁观",
        description: "观察局势，保持距离。",
        resultText: "你保持冷静，获得稳定的人脉积累。",
        effect: { fate: 2, reputation: 2 },
        extraHistory: "冷眼旁观盛宴，稳住人际关系。",
      },
    ],
  },
  {
    id: "heart-demon",
    title: "心魔侵扰",
    category: "心魔事件",
    description:
      "你闭关时心中出现异样幻象，心魔试图扰乱你的修炼。",
    choices: [
      {
        id: "A",
        label: "镇静心神",
        description: "以意志压制内心动荡。",
        resultText: "你成功克制心魔，心境更加坚韧。",
        effect: { mood: 10, reputation: 2, cultivationExp: 5 },
        extraHistory: "在心魔侵扰下稳住心神，意志更坚。",
      },
      {
        id: "B",
        label: "强行斩断",
        description: "以力量压迫，试图猛力破除。",
        resultText: "你消耗过大，勉强将心魔压下，身体受创。",
        effect: { cultivationExp: -10, mood: -8, lifespan: -3 },
        extraHistory: "以蛮力压制心魔，身心俱疲。",
      },
      {
        id: "C",
        label: "避其锋芒",
        description: "暂避心魔，等待时机。",
        resultText: "你避开心魔侵袭，避免受伤，但未获提升。",
        effect: { mood: 3 },
        extraHistory: "暂避心魔，保住了当前状态。",
      },
    ],
  },
  {
    id: "abandoned-chest",
    title: "荒郊宝箱",
    category: "危机事件",
    description:
      "历练途中在荒郊野外发现一个残破的宝箱，是否打开？",
    choices: [
      {
        id: "A",
        label: "打开宝箱",
        description: "勇敢探索，收获未知。",
        resultText: "宝箱中藏着灵石与古卷，你的修为随之增长。",
        effect: { spiritStones: 30, cultivationExp: 20, reputation: 3 },
        extraHistory: "从荒郊宝箱中获得灵石和古卷。",
      },
      {
        id: "B",
        label: "绕道而行",
        description: "谨慎行事，避免陷阱。",
        resultText: "你避开了潜在危险，但错失一份机缘。",
        effect: { mood: 4, fate: 2 },
        extraHistory: "绕道避过宝箱，保持安全。",
      },
      {
        id: "C",
        label: "暂且观察",
        description: "先审视环境，再做决定。",
        resultText: "你发现宝箱周围有阵法残迹，暂时撤离。",
        effect: { comprehension: 2, mood: 2 },
        extraHistory: "观察宝箱阵法，增添悟性。",
      },
    ],
  },
];
