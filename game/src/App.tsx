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
  useItem,
  buyMarketItem,
  doSectContest,
} from "./utils/gameLogic";
import {
  getAvailableSkills,
  playerUseSkill,
  enemyTakeTurn,
  skipCombat,
  applyCombatResult,
} from "./utils/combatLogic";
import { loadGameState, saveGameState } from "./utils/storage";
import type { GameState } from "./types/game";
import "./App.css";

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createNewGameState());
  const [currentView, setCurrentView] = useState<AppView>("home");

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
    }
  }, []);

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
    const nextHistory = result.history
      ? [...gameState.character.history, result.history]
      : gameState.character.history;
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

  const handleUseItem = (itemName: string) => applyResult(useItem(gameState.character, itemName));

  const handleUseCombatSkill = (skillId: string) => {
    if (!gameState.currentCombat) return;

    let nextCombat = playerUseSkill(gameState.character, gameState.currentCombat, skillId);
    if (!nextCombat.finished) {
      nextCombat = enemyTakeTurn(nextCombat);
    }

    if (nextCombat.finished) {
      const updatedCharacter = applyCombatResult(gameState.character, nextCombat);
      setGameState({
        ...gameState,
        character: updatedCharacter,
        currentCombat: undefined,
        notification:
          nextCombat.result === "win"
            ? `你战胜了${nextCombat.enemy.name}，获得了战斗奖励。`
            : `你在战斗中失利，退回宗门恢复。`,
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
    const updatedCharacter = applyCombatResult(gameState.character, nextCombat);
    setGameState({
      ...gameState,
      character: updatedCharacter,
      currentCombat: undefined,
      notification:
        nextCombat.result === "win"
          ? `你迅速结束了战斗，获得了${nextCombat.enemy.name}的战利品。`
          : `你仓促撤离，受了伤，但保住了性命。`,
    });
  };

  const handleFinishCombat = () => {
    if (!gameState.currentCombat || !gameState.currentCombat.finished) return;
    const updatedCharacter = applyCombatResult(gameState.character, gameState.currentCombat);
    setGameState({
      ...gameState,
      character: updatedCharacter,
      currentCombat: undefined,
      notification:
        gameState.currentCombat.result === "win"
          ? `你结束了战斗，收获了胜利果实。`
          : `战斗深入后你撤退，暂时保全了自身。`,
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

  const breakthroughReadiness = calculateBreakthroughReadiness(gameState.character);

  const promotionInfo = useMemo(
    () => getSectPromotionInfo(gameState.character),
    [gameState.character]
  );

  const renderCurrentView = () => {
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
            notification={gameState.notification}
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
            <div className="realm-chip">
              <span>{gameState.character.age}岁</span>
              <strong>{gameState.character.realm}</strong>
            </div>
          </div>

          <div className="screen-content">{renderCurrentView()}</div>

          <BottomNav currentView={currentView} onChange={setCurrentView} />
        </div>
      </div>
    </div>
  );
}

export default App;
