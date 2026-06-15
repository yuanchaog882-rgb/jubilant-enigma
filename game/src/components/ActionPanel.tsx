interface Props {
  onCultivate: () => void;
  onAdventure: () => void;
  onBreakthrough: () => void;
  onToggleLog: () => void;
  onRestart: () => void;
  character: {
    cultivationExp: number;
    cultivationMax: number;
    spiritStones: number;
    reputation: number;
    fate: number;
    comprehension: number;
    mood: number;
    lifespan: number;
    year: number;
    location: string;
  };
  showLog: boolean;
}

const ActionPanel = ({
  onCultivate,
  onAdventure,
  onBreakthrough,
  onToggleLog,
  onRestart,
  character,
  showLog,
}: Props) => {
  return (
    <section className="panel action-panel">
      <div className="stat-grid">
        <div>
          <p className="label">修为</p>
          <strong>
            {character.cultivationExp}/{character.cultivationMax}
          </strong>
        </div>
        <div>
          <p className="label">灵石</p>
          <strong>{character.spiritStones}</strong>
        </div>
        <div>
          <p className="label">气运</p>
          <strong>{character.fate}</strong>
        </div>
        <div>
          <p className="label">悟性</p>
          <strong>{character.comprehension}</strong>
        </div>
        <div>
          <p className="label">心境</p>
          <strong>{character.mood}</strong>
        </div>
        <div>
          <p className="label">声望</p>
          <strong>{character.reputation}</strong>
        </div>
        <div>
          <p className="label">寿元</p>
          <strong>{character.lifespan}</strong>
        </div>
        <div>
          <p className="label">年份</p>
          <strong>{character.year}</strong>
        </div>
        <div>
          <p className="label">地点</p>
          <strong>{character.location}</strong>
        </div>
      </div>

      <div className="button-grid">
        <button className="primary" onClick={onCultivate}>
          闭关修炼
        </button>
        <button className="secondary" onClick={onAdventure}>
          外出历练
        </button>
        <button className="secondary" onClick={onBreakthrough}>
          尝试突破
        </button>
        <button className="tertiary" onClick={onToggleLog}>
          {showLog ? "隐藏经历" : "查看经历"}
        </button>
        <button className="tertiary" onClick={onRestart}>
          重新开局
        </button>
      </div>
    </section>
  );
};

export default ActionPanel;
