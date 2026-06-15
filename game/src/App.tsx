import { useEffect, useMemo, useState } from "react";
import BottomNav, { type AppView } from "./components/BottomNav";
import CombatPanel from "./components/CombatPanel";
import HomeView from "./views/HomeView";
import AdventureView from "./views/AdventureView";
import SectView from "./views/SectView";
import MarketView from "./views/MarketView";
import SecretRealmView from "./views/SecretRealmView";
import InventoryView from "./views/InventoryView";
import LogView from "./views/LogView";
import EndingView from "./views/EndingView";
import {
  createNewGameState,
  cultivate,
  startAdventure,
  attemptBreakthrough,
  resolveEventChoice,
  doSectMission,
  visitMarket,
  exploreSecretRealm,
  adjustMindset,
  calculateBreakthroughReadiness,
  getSectPromotionInfo,
  promoteSectRank,
  useItem as applyInventoryItem,
  buyMarketItem,
  doSectContest,
} from "./utils/gameLogic";
import {
  getAvailableSkills,
  playerUseSkill,
  enemyTakeTurn,
  skipCombat,
  applyCombatResult,
  getCombatOutcomeMessages,
} from "./utils/combatLogic";
import { clearGameState, loadGameState, saveGameState } from "./utils/storage";
import type { GameState } from "./types/game";
import "./App.css";

function App() {
  const [gameState, setGameState] = useState<GameState>(
    () => loadGameState() ?? createNewGameState()
  );
  const [currentView, setCurrentView] = useState<AppView>("home");
  const notificationText = gameState.notification || "暂无新的通知。";
  const normalizedNotification = notificationText.toLowerCase();
  const notificationType = normalizedNotification.includes("突破成功")
    ? "success"
    : normalizedNotification.includes("获得") ||
      normalizedNotification.includes("得到") ||
      normalizedNotification.includes("领取") ||
      normalizedNotification.includes("结算：")
    ? "reward"
    : normalizedNotification.includes("失败") ||
      normalizedNotification.includes("受伤") ||
      normalizedNotification.includes("惩罚") ||
      normalizedNotification.includes("扣")
    ? "danger"
    : "normal";

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const applyResult = (result: {
    character: GameState["character"];
    notification: string;
    event?: GameState["currentEvent"];
    history?: string;
    currentCombat?: GameState["currentCombat"];
  }) => {
    const resultHistory = result.character.history ?? gameState.character.history;
    const additionalHistory = result.history;
    const hasHistoryEntry = additionalHistory
      ? resultHistory.some((entry) => entry.includes(additionalHistory))
      : true;
    const nextHistory = additionalHistory && !hasHistoryEntry
      ? [...resultHistory, additionalHistory]
      : resultHistory;
    setGameState({
      ...gameState,
      character: { ...result.character, history: nextHistory },
      notification: result.notification,
      currentEvent: result.event,
      currentCombat: result.currentCombat,
    });
  };


  const handleCultivate = () => applyResult(cultivate(gameState.character));

  const handleBreakthrough = () => {
    const result = attemptBreakthrough(gameState.character);
    applyResult({
      ...result,
      currentCombat: undefined,
    });
  };

  const handleSectMission = () => applyResult(doSectMission(gameState.character));

  const handleSectContest = () => applyResult(doSectContest(gameState.character));

  const handleVisitMarket = () => applyResult(visitMarket(gameState.character));

  const handleBuyItem = (itemName: string) =>
    applyResult(buyMarketItem(gameState.character, itemName));

  const handleAdventureRoute = (route: string) =>
    applyResult(startAdventure(gameState.character, route));

  const handleExploreSecretRealmRoute = (route: string) =>
    applyResult(exploreSecretRealm(gameState.character, route));

  const handleUseItem = (itemName: string) =>
    applyResult(applyInventoryItem(gameState.character, itemName));

  const handleUseCombatSkill = (skillId: string) => {
    if (!gameState.currentCombat) return;

    let nextCombat = playerUseSkill(gameState.character, gameState.currentCombat, skillId);
    if (!nextCombat.finished) {
      nextCombat = enemyTakeTurn(nextCombat);
    }

    if (nextCombat.finished) {
      setGameState({
        ...gameState,
        currentCombat: nextCombat,
        notification:
          nextCombat.result === "win"
            ? `你战胜了${nextCombat.enemy.name}，可以领取战斗奖励。`
            : `你在战斗中失利，请确认惩罚后撤退。`,
      });
      return;
    }

    setGameState({
      ...gameState,
      currentCombat: nextCombat,
    });
  };

  const handleSkipCombat = () => {
    if (!gameState.currentCombat) return;
    const nextCombat = skipCombat(gameState.character, gameState.currentCombat);
    setGameState({
      ...gameState,
      currentCombat: nextCombat,
      notification:
        nextCombat.result === "win"
          ? `你迅速结束了战斗，可以领取${nextCombat.enemy.name}的战利品。`
          : `你仓促撤离，请确认惩罚后继续。`,
    });
  };

  const handleFinishCombat = () => {
    if (!gameState.currentCombat || !gameState.currentCombat.finished) return;
    const updatedCharacter = applyCombatResult(gameState.character, gameState.currentCombat);
    const outcomeText = getCombatOutcomeMessages(gameState.currentCombat).join("，");
    setGameState({
      ...gameState,
      character: updatedCharacter,
      currentCombat: undefined,
      notification:
        gameState.currentCombat.result === "win"
          ? `战斗结算完成：${outcomeText}。`
          : `战斗惩罚已结算：${outcomeText}。`,
    });
  };

  const handlePromoteRank = () => applyResult(promoteSectRank(gameState.character));

  const handleAdjustMindset = () => applyResult(adjustMindset(gameState.character));

  const handleChooseEvent = (choiceId: string) => {
    const currentEvent = gameState.currentEvent;
    if (!currentEvent) return;

    const result = resolveEventChoice(gameState.character, currentEvent, choiceId);
    applyResult(result);
  };

  const handleRestart = () => {
    const confirmed = window.confirm("确定要重开人生吗？当前存档会被清空。");
    if (!confirmed) return;

    const nextGameState = createNewGameState();
    clearGameState();
    setCurrentView("home");
    setGameState(nextGameState);
  };

  const breakthroughReadiness = calculateBreakthroughReadiness(gameState.character);

  const promotionInfo = useMemo(
    () => getSectPromotionInfo(gameState.character),
    [gameState.character]
  );

  const renderCurrentView = () => {
    if (gameState.character.dead) {
      return <EndingView character={gameState.character} onRestart={handleRestart} />;
    }

    if (gameState.currentCombat) {
      return (
        <CombatPanel
          combatState={gameState.currentCombat}
          character={gameState.character}
          onUseSkill={handleUseCombatSkill}
          onSkipCombat={handleSkipCombat}
          onFinishCombat={handleFinishCombat}
          getAvailableSkills={getAvailableSkills}
        />
      );
    }

    switch (currentView) {
      case "adventure":
        return (
          <AdventureView
            character={gameState.character}
            currentEvent={gameState.currentEvent}
            onChooseEvent={handleChooseEvent}
            onChooseAdventureRoute={handleAdventureRoute}
          />
        );
      case "sect":
        return (
          <SectView
            character={gameState.character}
            promotionInfo={promotionInfo}
            currentEvent={gameState.currentEvent}
            onChooseEvent={handleChooseEvent}
            onSectMission={handleSectMission}
            onSectContest={handleSectContest}
            onPromoteRank={handlePromoteRank}
          />
        );
      case "market":
        return (
          <MarketView
            character={gameState.character}
            currentEvent={gameState.currentEvent}
            onChooseEvent={handleChooseEvent}
            onBuyItem={handleBuyItem}
            onVisitMarket={handleVisitMarket}
          />
        );
      case "secretRealm":
        return (
          <SecretRealmView
            character={gameState.character}
            currentEvent={gameState.currentEvent}
            onChooseEvent={handleChooseEvent}
            onExploreRoute={handleExploreSecretRealmRoute}
          />
        );
      case "inventory":
        return (
          <InventoryView character={gameState.character} onUseItem={handleUseItem} />
        );
      case "log":
        return <LogView character={gameState.character} />;
      default:
        return (
          <HomeView
            character={gameState.character}
            breakthroughReadiness={breakthroughReadiness}
            currentEvent={gameState.currentEvent}
            onChooseEvent={handleChooseEvent}
            onCultivate={handleCultivate}
            onAdjustMindset={handleAdjustMindset}
            onBreakthrough={handleBreakthrough}
            onEnterSecretRealm={() => setCurrentView("secretRealm")}
            onOpenLog={() => setCurrentView("log")}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className="screen-shell">
          <div className="top-bar">
            <div>
              <p className="subtle">修仙人生模拟器 v0.6</p>
              <h2>{gameState.character.name}</h2>
            </div>
            <div className="top-actions">
              <div className="realm-chip">
                <span>{gameState.character.age}岁</span>
                <strong>{gameState.character.realm}</strong>
              </div>
              <button type="button" className="restart-button" onClick={handleRestart}>
                重开
              </button>
            </div>
          </div>

          <div className={`global-notification notification-type-${notificationType}`}>
            <p className="label">最新结算</p>
            <p>{notificationText}</p>
          </div>

          <div className="screen-content">{renderCurrentView()}</div>

          {gameState.character.dead ? null : (
            <BottomNav currentView={currentView} onChange={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
