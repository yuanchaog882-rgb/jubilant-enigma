import type { Character } from "../types/game";

interface Props {
  character: Character;
  onUseItem: (itemName: string) => void;
}

const InventoryView = ({ character, onUseItem }: Props) => {
  return (
    <div className="page-view inventory-view">
      <section className="panel page-header-card">
        <div className="view-title">
          <h2>背包</h2>
        </div>
      </section>

      <section className="panel inventory-summary">
        <div className="info-row">
          <div>
            <p className="label">当前功法</p>
            <strong>{character.cultivationMethod || "暂无功法"}</strong>
          </div>
          <div>
            <p className="label">当前法宝</p>
            <strong>{character.artifact || "暂无法宝"}</strong>
          </div>
        </div>
      </section>

      <section className="panel inventory-items">
        <div className="view-title">
          <h3>背包物品</h3>
          <span>{character.inventory.length} 项</span>
        </div>
        <div className="shop-grid">
          {character.inventory.length === 0 ? (
            <p className="empty-log">背包中空空如也。</p>
          ) : (
            character.inventory.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                className="secondary small"
                onClick={() => onUseItem(item)}
              >
                <strong>{item}</strong>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default InventoryView;
