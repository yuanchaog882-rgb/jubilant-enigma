import type { Character } from "../types/game";

interface Props {
  character: Character;
}

const statItems = [
  { key: "mood", label: "心境", max: 100 },
  { key: "heartDemon", label: "心魔", max: 100 },
  { key: "injury", label: "受创", max: 100 },
  { key: "reputation", label: "声望", max: 100 },
  { key: "fate", label: "气运", max: 20 },
  { key: "comprehension", label: "悟性", max: 20 },
];

const StatusDashboard = ({ character }: Props) => {
  return (
    <section className="panel status-dashboard">
      <div className="dashboard-header">
        <p className="label">状态仪表</p>
        <h2>当前修行概况</h2>
      </div>
      <div className="status-grid">
        {statItems.map((stat) => {
          const value = character[stat.key as keyof Character] as number;
          const ratio = Math.min(100, Math.round((value / stat.max) * 100));
          return (
            <div key={stat.key} className="status-card">
              <div className="status-card-top">
                <span>{stat.label}</span>
                <strong>{value}</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatusDashboard;
