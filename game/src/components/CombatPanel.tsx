import type { Character, CombatState, CombatSkill } from "../types/game";

interface Props {
  combatState: CombatState;
  character: Character;
  getAvailableSkills: (character: Character) => CombatSkill[];
  onUseSkill: (skillId: string) => void;
  onSkipCombat: () => void;
  onFinishCombat: () => void;
}

const CombatPanel = ({
  combatState,
  character,
  getAvailableSkills,
  onUseSkill,
  onSkipCombat,
  onFinishCombat,
}: Props) => {
  const skills = getAvailableSkills(character);
  const hpPercent = Math.max(0, Math.min(100, Math.round((combatState.playerHp / combatState.playerMaxHp) * 100)));
  const mpPercent = Math.max(0, Math.min(100, Math.round((combatState.playerMp / combatState.playerMaxMp) * 100)));
  const enemyPercent = Math.max(0, Math.min(100, Math.round((combatState.enemy.hp / combatState.enemy.maxHp) * 100)));
  const isDanger = hpPercent <= 30;
  const stateLabel = combatState.finished
    ? combatState.result === "win"
      ? "战斗结束"
      : "败退"
    : combatState.isPlayerTurn
    ? "玩家回合"
    : "敌人回合";

  const resultTitle = combatState.finished
    ? combatState.result === "win"
      ? "战斗胜利"
      : "败退"
    : undefined;

  const resultText = combatState.finished
    ? combatState.result === "win"
      ? `你击败了 ${combatState.enemy.name}，获得了战利品。`
      : "你因伤势过重被迫退走。"
    : undefined;

  const recentLogs = combatState.logs.slice(-5).reverse();

  return (
    <section className="panel combat-panel">
      <div className="combat-header">
        <div>
          <p className="label">战斗回合</p>
          <h2>第 {combatState.round} 轮</h2>
        </div>
        <div className="combat-state-pill">
          <span>{stateLabel}</span>
        </div>
      </div>

      {combatState.finished ? (
        <div className={`combat-result-banner ${combatState.result === "win" ? "victory" : "defeat"}`}>
          <h3>{resultTitle}</h3>
          <p>{resultText}</p>
        </div>
      ) : null}

      <div className="combat-card-grid">
        <article className="enemy-combat-card">
          <div className="combat-card-header">
            <div>
              <p className="label">当前敌人</p>
              <h3>{combatState.enemy.name}</h3>
              <p className="combat-subtext">境界：{combatState.enemy.realm}</p>
            </div>
          </div>
          <p className="combat-description">{combatState.enemy.description}</p>
          <div className="status-bar-row">
            <div className="status-bar-label">
              <span>血量</span>
              <strong>{combatState.enemy.hp}/{combatState.enemy.maxHp}</strong>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill enemy" style={{ width: `${enemyPercent}%` }} />
            </div>
          </div>
        </article>

        <div className="combat-vs">
          <span>剑气交锋</span>
        </div>

        <article className="player-combat-card">
          <div className="combat-card-header">
            <div>
              <p className="label">我方</p>
              <h3>{character.name}</h3>
              <p className="combat-subtext">境界：{character.realm}</p>
            </div>
          </div>
          <div className="combat-info-grid">
            <div>
              <p className="label">当前功法</p>
              <strong>{character.cultivationMethod || "基础心法"}</strong>
            </div>
            <div>
              <p className="label">当前法宝</p>
              <strong>{character.artifact || "无"}</strong>
            </div>
          </div>
          <div className="status-bar-row">
            <div className="status-bar-label">
              <span>气血</span>
              <strong className={isDanger ? "danger-text" : ""}>{combatState.playerHp}/{combatState.playerMaxHp}</strong>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill hp" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
          <div className="status-bar-row">
            <div className="status-bar-label">
              <span>灵力</span>
              <strong>{combatState.playerMp}/{combatState.playerMaxMp}</strong>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill mp" style={{ width: `${mpPercent}%` }} />
            </div>
          </div>
        </article>
      </div>

      <div className="combat-skill-grid">
        {skills.map((skill) => {
          const disabled = combatState.finished || (skill.mpCost ?? 0) > combatState.playerMp;
          return (
            <button
              key={skill.id}
              type="button"
              className={disabled ? "game-button ghost combat-skill-button" : "game-button secondary combat-skill-button"}
              onClick={() => onUseSkill(skill.id)}
              disabled={disabled}
            >
              <div>
                <strong>{skill.name}</strong>
                <p>{skill.description}</p>
              </div>
              {skill.mpCost ? <span className="skill-cost">{skill.mpCost}灵力</span> : null}
            </button>
          );
        })}
      </div>

      <div className="combat-control-row">
        <button
          type="button"
          className="game-button warning"
          onClick={onSkipCombat}
          disabled={combatState.finished}
        >
          速战速决
        </button>
        <button
          type="button"
          className="game-button primary"
          onClick={onFinishCombat}
          disabled={!combatState.finished}
        >
          {combatState.finished ? "领取战利品" : "结束战斗"}
        </button>
        <button type="button" className="game-button ghost" onClick={onFinishCombat}>
          返回
        </button>
      </div>

      <div className="combat-log-panel">
        <div className="combat-log-header">
          <p className="label">战斗日志</p>
          <span>最近 {recentLogs.length} 条</span>
        </div>
        <div className="combat-log-list">
          {recentLogs.length > 0 ? (
            recentLogs.map((entry, index) => (
              <div key={`${entry}-${index}`} className="combat-log-item">
                <span className="combat-log-index">{recentLogs.length - index}</span>
                <p className="combat-log-text">{entry}</p>
              </div>
            ))
          ) : (
            <p className="combat-log-empty">暂无战斗记录。</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CombatPanel;
