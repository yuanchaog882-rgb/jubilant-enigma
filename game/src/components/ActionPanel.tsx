import type { Character } from "../types/game";
import type { BreakthroughFactor } from "../utils/gameLogic";

interface BreakthroughReadiness {
  readiness: number;
  positives: BreakthroughFactor[];
  negatives: BreakthroughFactor[];
}

type PromotionInfo =
  | {
      nextRank: string;
      realm: readonly string[];
      contribution: number;
      reputation: number;
      satisfied: boolean;
    }
  | null;

interface Props {
  onCultivate: () => void;
  onAdventure: () => void;
  onBreakthrough: () => void;
  onSectMission: () => void;
  onVisitMarket: () => void;
  onExploreSecretRealm: () => void;
  onAdjustMindset: () => void;
  onPromoteRank: () => void;
  onToggleLog: () => void;
  onRestart: () => void;
  onOpenInventory: () => void;
  character: Character;
  breakthroughReadiness: BreakthroughReadiness;
  promotionInfo: PromotionInfo;
  showLog: boolean;
}

const ActionPanel = ({
  onCultivate,
  onAdventure,
  onBreakthrough,
  onSectMission,
  onVisitMarket,
  onExploreSecretRealm,
  onAdjustMindset,
  onPromoteRank,
  onOpenInventory,
  onToggleLog,
  onRestart,
  character,
  breakthroughReadiness,
  promotionInfo,
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

      <div className="breakthrough-summary">
        <p className="label">当前突破准备度</p>
        <strong>{breakthroughReadiness.readiness}%</strong>
        <div className="breakthrough-details">
          <div>
            <p className="label">主要加成</p>
            <ul>
              {breakthroughReadiness.positives.map((item) => (
                <li key={item.label}>{item.label} +{item.value}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">主要风险</p>
            <ul>
              {breakthroughReadiness.negatives.map((item) => (
                <li key={item.label}>{item.label} {item.value}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="promotion-summary">
        <p className="label">下一身份</p>
        {promotionInfo ? (
          <div>
            <strong>{promotionInfo.nextRank}</strong>
            <p>要求境界：{promotionInfo.realm.join("、")}</p>
            <p>宗门贡献：{promotionInfo.contribution}</p>
            <p>声望：{promotionInfo.reputation}</p>
            <button
              className="secondary"
              onClick={onPromoteRank}
              disabled={!promotionInfo.satisfied || character.dead}
            >
              {promotionInfo.satisfied ? "晋升宗门身份" : "未满足晋升条件"}
            </button>
          </div>
        ) : (
          <p>已是最高身份。</p>
        )}
      </div>

      <div className="inventory-grid">
        <p className="label">玉简背包</p>
        <div className="inventory-summary">
          <strong>{character.inventory.length}</strong>
          <span>项</span>
        </div>
        <button className="inventory-open" onClick={onOpenInventory} disabled={character.dead}>
          打开背包
        </button>
      </div>

      <div className="button-grid">
        <button className="primary" onClick={onCultivate} disabled={character.dead}>
          闭关修炼
        </button>
        <button className="secondary" onClick={onAdventure} disabled={character.dead}>
          外出历练
        </button>
        <button className="secondary" onClick={onSectMission} disabled={character.dead}>
          宗门任务
        </button>
        <button className="secondary" onClick={onVisitMarket} disabled={character.dead}>
          坊市交易
        </button>
        <button className="secondary" onClick={onExploreSecretRealm} disabled={character.dead}>
          秘境探索
        </button>
        <button className="secondary" onClick={onAdjustMindset} disabled={character.dead}>
          调整心境
        </button>
        <button className="secondary" onClick={onBreakthrough} disabled={character.dead}>
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
