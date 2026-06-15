interface Props {
  history: string[];
}

const LogPanel = ({ history }: Props) => {
  return (
    <section className="panel log-panel">
      <div className="log-header">
        <p className="label">经历日志</p>
        <h2>修仙足迹</h2>
      </div>
      <div className="log-list">
        {history.length === 0 ? (
          <p className="empty-log">暂无重要经历。</p>
        ) : (
          history.map((item, index) => (
            <div key={`${item}-${index}`} className="log-item">
              <span>{index + 1}.</span>
              <p>{item}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default LogPanel;
