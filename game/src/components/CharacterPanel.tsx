import type { Character } from "../types/game";

interface Props {
  character: Character;
  realmDescription: string;
}

const CharacterPanel = ({ character, realmDescription }: Props) => {
  return (
    <section className="panel character-panel">
      <div className="character-header">
        <div>
          <p className="label">姓名</p>
          <h1>{character.name}</h1>
        </div>
        <div className="status-chip">{character.realm}</div>
      </div>

      <div className="portrait-card">
        <div className="portrait-glow" />
        <div className="portrait-body">
          <p className="tag">{character.currentIdentity}</p>
          <div className="portrait-meta">
            <span>{character.age}岁</span>
            <span>{character.origin}</span>
          </div>
          <p className="description">{realmDescription}</p>
        </div>
      </div>

      <div className="attribute-grid">
        <div>
          <p className="label">宗门身份</p>
          <strong>{character.sectRank}</strong>
        </div>
        <div>
          <p className="label">宗门贡献</p>
          <strong>{character.sectContribution}</strong>
        </div>
        <div>
          <p className="label">灵根</p>
          <strong>{character.spiritRoot}</strong>
        </div>
        <div>
          <p className="label">心魔</p>
          <strong>{character.heartDemon}</strong>
        </div>
        <div>
          <p className="label">功法</p>
          <strong>{character.cultivationMethod ?? "暂无"}</strong>
        </div>
        <div>
          <p className="label">法宝</p>
          <strong>{character.artifact ?? "暂无"}</strong>
        </div>
      </div>
    </section>
  );
};

export default CharacterPanel;
