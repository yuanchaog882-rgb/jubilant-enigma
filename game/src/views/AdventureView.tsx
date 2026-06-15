import type { Character, GameEvent } from "../types/game";
import EventCard from "../components/EventCard";

interface Props {
  character: Character;
  currentEvent?: GameEvent;
  onChooseEvent: (choiceId: string) => void;
  onChooseAdventureRoute: (route: string) => void;
}

const AdventureView = ({
  character,
  currentEvent,
  onChooseEvent,
  onChooseAdventureRoute,
}: Props) => {
  const options = [
    {
      route: "宗门后山",
      title: "宗门后山",
      risk: "低",
      reward: "修为 + 少量材料",
      desc: "适合稳妥历练，保持当前状态。",
      riskClass: "risk-low",
    },
    {
      route: "妖兽山脉",
      title: "妖兽山脉",
      risk: "中",
      reward: "修为、灵石、战斗机会",
      desc: "可能遭遇妖兽或劫修，需多加小心。",
      riskClass: "risk-mid",
    },
    {
      route: "古修洞府",
      title: "古修洞府",
      risk: "高",
      reward: "功法、法宝、机缘",
      desc: "高风险高收益，适合实力足够时挑战。",
      riskClass: "risk-high",
    },
  ];

  return (
    <div className="page-view adventure-view">
      <section className="panel page-header-card">
        <div className="view-title">
          <h2>外出历练</h2>
        </div>
        <p className="page-description">
          选择历练路线，前往不同地点寻找机缘与挑战。风险越高，机缘越大。
        </p>
        <div className="info-row">
          <div>
            <p className="label">当前地点</p>
            <strong>{character.location}</strong>
          </div>
          <div>
            <p className="label">年龄</p>
            <strong>{character.age}岁</strong>
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
              onClick={() => onChooseAdventureRoute(option.route)}
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

export default AdventureView;
