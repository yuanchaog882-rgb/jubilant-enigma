import type { Character } from "../types/game";

interface Props {
  character: Character;
}

const LogView = ({ character }: Props) => {
  return (
    <div className="page-view log-view">
      <section className="panel page-header-card">
        <div className="view-title">
          <h2>人生日志</h2>
        </div>
        <p className="page-description">查看你修仙历程中的重要节点与事件。</p>
      </section>

      <section className="panel log-panel">
        <div className="log-list">
          {character.history.length === 0 ? (
            <p className="empty-log">暂无重要经历。</p>
          ) : (
            character.history.map((item, index) => (
              <div key={`${item}-${index}`} className="log-item">
                <span>{index + 1}.</span>
                <p>{item}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LogView;
