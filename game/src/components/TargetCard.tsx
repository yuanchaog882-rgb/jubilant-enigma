interface Goal {
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
}

interface Props {
  goals: Goal[];
}

const TargetCard = ({ goals }: Props) => {
  return (
    <section className="section-card target-card">
      <div className="section-header">
        <div>
          <p className="section-subtitle">当前目标</p>
          <h2 className="section-title">修行指引</h2>
        </div>
      </div>

      <div className="goal-list">
        {goals.map((goal) => (
          <div
            key={goal.title}
            className={goal.highlight ? "goal-item primary" : "goal-item"}
          >
            <div className="goal-icon">{goal.icon}</div>
            <div className="goal-text">
              <p className="goal-title">{goal.title}</p>
              <p className="goal-desc">{goal.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TargetCard;
