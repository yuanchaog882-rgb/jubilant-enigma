import type { Character } from "../types/game";

interface Props {
  open: boolean;
  character: Character;
  onClose: () => void;
  onUseItem: (itemName: string) => void;
}

const InventoryDialog = ({ open, character, onClose, onUseItem }: Props) => {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-shell" onClick={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <p className="label">背包</p>
            <h2>玉简与灵丹</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭背包">
            ×
          </button>
        </div>
        <div className="dialog-body">
          {character.inventory.length === 0 ? (
            <p className="empty-log">背包中空空如也。</p>
          ) : (
            <div className="inventory-list">
              {character.inventory.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  className="inventory-item"
                  onClick={() => onUseItem(item)}
                >
                  <span>{item}</span>
                  <small>点击使用</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDialog;
