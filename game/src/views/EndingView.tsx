import type { Character } from "../types/game";

interface Props {
  character: Character;
  onRestart: () => void;
}

const getEndingTitle = (character: Character) => {
  if (character.realm.includes("元婴")) return "元婴初成，终入传说";
  if (character.realm.includes("金丹")) return "金丹留名，道途未尽";
  if (character.realm.includes("筑基")) return "筑基一生，根基犹存";
  return "炼气一梦，尘缘已尽";
};

const getEndingRating = (character: Character) => {
  const score =
    character.reputation +
    character.sectContribution +
    character.inventory.length * 8 +
    (character.cultivationMethod ? 16 : 0) +
    (character.artifact ? 18 : 0);

  if (score >= 220) return "宗门传奇";
  if (score >= 140) return "一方名士";
  if (score >= 80) return "小有声名";
  return "无名修士";
};

const EndingView = ({ character, onRestart }: Props) => {
  const finalHistory = character.history.slice(-8).reverse();

  return (
    <div className="page-view ending-view">
      <section className="panel ending-hero">
        <p className="label">人生终章</p>
        <h2>{getEndingTitle(character)}</h2>
        <p className="page-description">
          {character.name}的修行之路到此告一段落。此生虽有遗憾，也留下了属于自己的痕迹。
        </p>
        <div className="ending-rating">{getEndingRating(character)}</div>
      </section>

      <section className="panel ending-summary">
        <div className="view-title">
          <h3>最终结算</h3>
        </div>
        <div className="ending-stat-grid">
          <div>
            <p className="label">最终境界</p>
            <strong>{character.realm}</strong>
          </div>
          <div>
            <p className="label">寿数</p>
            <strong>{character.age}岁 / {character.lifespan}寿</strong>
          </div>
          <div>
            <p className="label">宗门身份</p>
            <strong>{character.sectRank}</strong>
          </div>
          <div>
            <p className="label">声望</p>
            <strong>{character.reputation}</strong>
          </div>
          <div>
            <p className="label">宗门贡献</p>
            <strong>{character.sectContribution}</strong>
          </div>
          <div>
            <p className="label">遗留灵石</p>
            <strong>{character.spiritStones}</strong>
          </div>
        </div>
      </section>

      <section className="panel ending-legacy">
        <div className="view-title">
          <h3>遗留传承</h3>
        </div>
        <div className="ending-legacy-list">
          <div>
            <p className="label">功法</p>
            <strong>{character.cultivationMethod || "未得传承"}</strong>
          </div>
          <div>
            <p className="label">法宝</p>
            <strong>{character.artifact || "未留法宝"}</strong>
          </div>
          <div>
            <p className="label">遗物</p>
            <strong>{character.inventory.length > 0 ? character.inventory.join("、") : "无"}</strong>
          </div>
        </div>
      </section>

      <section className="panel ending-history">
        <div className="view-title">
          <h3>最后回望</h3>
        </div>
        <div className="log-list">
          {finalHistory.length > 0 ? (
            finalHistory.map((item, index) => (
              <div key={`${item}-${index}`} className="log-item">
                <span>{finalHistory.length - index}</span>
                <p>{item}</p>
              </div>
            ))
          ) : (
            <p className="empty-log">此生未留下重要记录。</p>
          )}
        </div>
      </section>

      <section className="panel ending-actions">
        <button type="button" className="game-button primary" onClick={onRestart}>
          重开一世
        </button>
      </section>
    </div>
  );
};

export default EndingView;
