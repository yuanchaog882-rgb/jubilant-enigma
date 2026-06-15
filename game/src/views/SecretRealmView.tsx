import type { Character, GameEvent } from "../types/game";
import EventCard from "../components/EventCard";

interface Props {
  character: Character;
  currentEvent?: GameEvent;
  onChooseEvent: (choiceId: string) => void;
  onExploreRoute: (route: string) => void;
}

const SecretRealmView = ({
  character,
  currentEvent,
  onChooseEvent,
  onExploreRoute,
}: Props) => {
  const options = [
    {
      route: "探索外围",
      title: "探索外围",
      risk: "低",
      reward: "安全探索，获得灵石与材料",
      desc: "适合保存状态时进行，风险较低。",
      riskClass: "risk-low",
    },
    {
      route: "深入秘境",
      title: "深入秘境",
      risk: "中",
      reward: "可获得稀有资源与经验",
      desc: "需注意自身伤势与心魔。",
      riskClass: "risk-mid",
    },
    {
      route: "挑战核心区域",
      title: "挑战核心区域",
      risk: "高",
      reward: "高阶功法、法宝、机缘",
      desc: "高风险高回报，适合准备充足时挑战。",
      riskClass: "risk-high",
    },
  ];

  return (
    <div className="page-view secret-view">
      <section className="panel page-header-card">
        <div className="view-title">
          <h2>秘境探索</h2>
        </div>
        <p className="page-description">
          秘境充满危险与机缘，选择探索深度，小心掌控自身状态。
        </p>
        <div className="info-row">
          <div>
            <p className="label">当前伤势</p>
            <strong>{character.injury}</strong>
          </div>
          <div>
            <p className="label">心魔</p>
            <strong>{character.heartDemon}</strong>
          </div>
        </div>
      </section>

      <section className="panel decision-options">
        <div className="decision-grid">
          {options.map((option) => (
            <button
              key={option.route}
              type="button"
              className={`decision-card ${option.riskClass}`}
              onClick={() => onExploreRoute(option.route)}
            >
              <div className="decision-card-header">
                <div>
                  <p className="decision-title">{option.title}</p>
                  <p className="decision-desc">{option.desc}</p>
                </div>
                <span className={`risk-chip ${option.riskClass}`}>{option.risk}风险</span>
              </div>
              <div className="decision-reward">收益：{option.reward}</div>
            </button>
          ))}
        </div>
      </section>

      {currentEvent ? <EventCard event={currentEvent} onChoose={onChooseEvent} /> : null}
    </div>
  );
};

export default SecretRealmView;
