import type { Character } from "../types/game";
import type { GameEvent } from "../types/game";
import EventCard from "../components/EventCard";

interface PromotionInfo {
  nextRank: string;
  realm: string[];
  contribution: number;
  reputation: number;
  satisfied: boolean;
}

interface Props {
  character: Character;
  promotionInfo: PromotionInfo | null;
  currentEvent?: GameEvent;
  onChooseEvent: (choiceId: string) => void;
  onSectMission: () => void;
  onSectContest: () => void;
  onPromoteRank: () => void;
}

const SectView = ({
  character,
  promotionInfo,
  currentEvent,
  onChooseEvent,
  onSectMission,
  onSectContest,
  onPromoteRank,
}: Props) => {
  return (
    <div className="page-view sect-view">
      <section className="panel page-header-card">
        <div className="view-title">
          <h2>宗门事务</h2>
        </div>
        <div className="info-row">
          <div>
            <p className="label">宗门身份</p>
            <strong>{character.sectRank}</strong>
          </div>
          <div>
            <p className="label">宗门贡献</p>
            <strong>{character.sectContribution}</strong>
          </div>
        </div>
        <div className="info-row">
          <div>
            <p className="label">声望</p>
            <strong>{character.reputation}</strong>
          </div>
          <div>
            <p className="label">当前身份</p>
            <strong>{character.currentIdentity}</strong>
          </div>
        </div>
      </section>

      <section className="panel sect-status-card">
        <div className="view-title">
          <h3>宗门身份卡</h3>
        </div>
        <div className="info-grid">
          <div>
            <p className="label">当前宗门身份</p>
            <strong>{character.sectRank}</strong>
          </div>
          <div>
            <p className="label">出身身份</p>
            <strong>{character.currentIdentity}</strong>
          </div>
          <div>
            <p className="label">宗门贡献</p>
            <strong>{character.sectContribution}</strong>
          </div>
          <div>
            <p className="label">声望</p>
            <strong>{character.reputation}</strong>
          </div>
        </div>
      </section>

      <section className="panel sect-promotion-card">
        <div className="view-title">
          <h3>晋升条件卡</h3>
        </div>
        {promotionInfo ? (
          <div className="promotion-grid">
            <div>
              <p className="label">下一身份</p>
              <strong>{promotionInfo.nextRank}</strong>
            </div>
            <div>
              <p className="label">所需境界</p>
              <strong>{promotionInfo.realm.join("、")}</strong>
            </div>
            <div>
              <p className="label">所需贡献</p>
              <strong>{promotionInfo.contribution}</strong>
            </div>
            <div>
              <p className="label">所需声望</p>
              <strong>{promotionInfo.reputation}</strong>
            </div>
            <div className="promotion-status">
              <p className="label">当前状态</p>
              <strong>{promotionInfo.satisfied ? "可晋升" : "尚未满足"}</strong>
            </div>
          </div>
        ) : (
          <p>已达到当前可晋升的最高身份。</p>
        )}
      </section>

      <section className="panel sect-action-card">
        <div className="view-title">
          <h3>宗门行动</h3>
        </div>
        <div className="action-row">
          <button type="button" className="game-button secondary" onClick={onSectMission}>
            接取宗门任务
          </button>
          <button type="button" className="game-button secondary" onClick={onSectContest}>
            参加宗门小比
          </button>
          <button type="button" className="game-button primary" onClick={onPromoteRank}>
            尝试晋升
          </button>
        </div>
      </section>

      {currentEvent ? <EventCard event={currentEvent} onChoose={onChooseEvent} /> : null}
    </div>
  );
};

export default SectView;
