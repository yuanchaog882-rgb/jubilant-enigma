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
          <p className="label">灵根</p>
          <strong>{character.spiritRoot}</strong>
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
          <p className="label">魅力</p>
          <strong>{character.charm}</strong>
        </div>
      </div>
    </section>
  );
};

export default CharacterPanel;
