import type { Character, GameEvent } from "../types/game";
import EventCard from "../components/EventCard";

interface Props {
  character: Character;
  currentEvent?: GameEvent;
  onChooseEvent: (choiceId: string) => void;
  onBuyItem: (itemName: string) => void;
  onVisitMarket: () => void;
}

const marketList = [
  { name: "聚气丹", price: 24, description: "快速巩固修为。" },
  { name: "凝神丹", price: 18, description: "提升心境，降低心魔。" },
  { name: "筑基丹", price: 40, description: "为突破打下基础。" },
  { name: "护心丹", price: 22, description: "缓解心魔，稳定心境。" },
  { name: "延寿丹", price: 38, description: "延长寿元。" },
  { name: "残破玉简", price: 30, description: "参悟后可触发机缘。" },
  { name: "下品飞剑", price: 80, description: "装备后提升历练收益。" },
];

const MarketView = ({ character, currentEvent, onChooseEvent, onBuyItem, onVisitMarket }: Props) => {
  return (
    <div className="page-view market-view">
      <section className="panel page-header-card">
        <div className="view-title">
          <h2>坊市</h2>
        </div>
        <div className="info-row">
          <div>
            <p className="label">当前灵石</p>
            <strong>{character.spiritStones}</strong>
          </div>
          <div>
            <p className="label">心境</p>
            <strong>{character.mood}</strong>
          </div>
        </div>
      </section>

      <section className="panel market-items">
        <div className="view-title">
          <h3>可购买物品</h3>
          <button type="button" className="text-link" onClick={onVisitMarket}>
            逛一逛坊市
          </button>
        </div>
        <div className="shop-grid">
          {marketList.map((item) => (
            <div key={item.name} className="shop-card">
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
              <button
                type="button"
                className="secondary small"
                onClick={() => onBuyItem(item.name)}
              >
                {item.price}灵石
              </button>
            </div>
          ))}
        </div>
      </section>

      {currentEvent ? <EventCard event={currentEvent} onChoose={onChooseEvent} /> : null}
    </div>
  );
};

export default MarketView;
