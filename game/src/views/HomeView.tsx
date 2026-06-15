import type { Character, GameEvent } from "../types/game";
import StatusDashboard from "../components/StatusDashboard";
import TargetCard from "../components/TargetCard";
import EventCard from "../components/EventCard";

interface BreakthroughFactor {
  label: string;
  value: number;
}

interface BreakthroughReadiness {
  readiness: number;
  positives: BreakthroughFactor[];
  negatives: BreakthroughFactor[];
}

interface Props {
  character: Character;
  notification?: string;
  breakthroughReadiness: BreakthroughReadiness;
  currentEvent?: GameEvent;
  onChooseEvent: (choiceId: string) => void;
  onCultivate: () => void;
  onAdjustMindset: () => void;
  onBreakthrough: () => void;
  onEnterSecretRealm: () => void;
  onOpenLog: () => void;
}

const HomeView = ({
  character,
  notification,
  breakthroughReadiness,
  currentEvent,
  onChooseEvent,
  onCultivate,
  onAdjustMindset,
  onBreakthrough,
  onEnterSecretRealm,
  onOpenLog,
}: Props) => {
  const notificationText = notification || "暂无新的通知。";
  const normalized = notificationText.toLowerCase();
  const notificationMeta = normalized.includes("突破成功")
    ? { icon: "✨", type: "success", label: "突破成功" }
    : normalized.includes("获得") || normalized.includes("得到")
    ? { icon: "🎁", type: "reward", label: "奖励消息" }
    : normalized.includes("失败") || normalized.includes("受伤")
    ? { icon: "⚠️", type: "danger", label: "危险提醒" }
    : { icon: "📜", type: "normal", label: "消息" };

  const quickActions = [
    { title: "闭关修炼", desc: "稳步提升修为", icon: "🧘", onClick: onCultivate, variant: "primary" },
    { title: "调整心境", desc: "化解心魔，稳固心态", icon: "🌙", onClick: onAdjustMindset, variant: "secondary" },
    { title: "尝试突破", desc: "把握时机，冲击下一个境界", icon: "⚡", onClick: onBreakthrough, variant: "primary" },
    { title: "秘境探索", desc: "进入秘境寻找机缘", icon: "🗺️", onClick: onEnterSecretRealm, variant: "secondary" },
    { title: "查看日志", desc: "回顾修行历程", icon: "📜", onClick: onOpenLog, variant: "secondary" },
  ];

  return (
    <div className="home-view">
      <section className="panel home-header-card">
        <div className="header-row">
          <div>
            <p className="label">角色名</p>
            <h2>{character.name}</h2>
          </div>
          <div className="header-badge">
            <span>{character.realm}</span>
          </div>
        </div>
        <div className="info-row">
          <div>
            <p className="label">年龄 / 寿元</p>
            <strong>
              {character.age}岁 · {character.lifespan}寿
            </strong>
          </div>
          <div>
            <p className="label">当前地点</p>
            <strong>{character.location}</strong>
          </div>
        </div>
      </section>

      <StatusDashboard character={character} />

      <section className="section-card readiness-card">
        <div className="section-header">
          <div>
            <p className="section-subtitle">当前瓶颈</p>
            <h2 className="section-title">突破准备</h2>
          </div>
          <span className="readiness-badge">{breakthroughReadiness.readiness}%</span>
        </div>
        <div className="section-content">
          <p className="section-note">
            正负因素一目了然，优先处理负面问题，保存状态后更容易完成下一次突破。
          </p>
          <div className="readiness-list">
            <p className="readiness-item">· 正面：{breakthroughReadiness.positives.map((item) => item.label).join("、")}</p>
            <p className="readiness-item">· 负面：{breakthroughReadiness.negatives.map((item) => item.label).join("、")}</p>
          </div>
        </div>
      </section>

      <TargetCard
        goals={[
          { icon: "✦", title: "稳固修为", description: "继续闭关修炼，积累突破所需修为", highlight: true },
          { icon: "◆", title: "化解心魔", description: "心魔过高时，优先调整心境，稳定情绪" },
          { icon: "✧", title: "准备突破", description: "修为圆满后，可尝试冲击下一个境界" },
        ]}
      />

      <section className={`section-card notification-card notification-type-${notificationMeta.type}`}>
        <div className="section-header">
          <div>
            <p className="section-subtitle">最新通知</p>
            <h2 className="section-title">{notificationMeta.label}</h2>
          </div>
          <div className="notification-icon">{notificationMeta.icon}</div>
        </div>
        <div className="section-content">
          <p className="notification-text">{notificationText}</p>
        </div>
      </section>

      <section className="section-card quick-actions">
        <div className="section-header">
          <div>
            <p className="section-subtitle">快捷行动</p>
            <h2 className="section-title">今日修炼</h2>
          </div>
          <button type="button" className="text-link" onClick={onOpenLog}>
            查看日志
          </button>
        </div>
        <div className="quick-action-grid">
          {quickActions.map((action) => (
            <button
              key={action.title}
              type="button"
              className={`quick-action-card ${action.variant}`}
              onClick={action.onClick}
            >
              <span className="quick-action-icon">{action.icon}</span>
              <div>
                <p className="quick-action-title">{action.title}</p>
                <p className="quick-action-desc">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {currentEvent ? <EventCard event={currentEvent} onChoose={onChooseEvent} /> : null}
    </div>
  );
};

export default HomeView;
