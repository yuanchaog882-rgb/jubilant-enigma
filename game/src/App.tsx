import { useEffect, useMemo, useState } from "react";
import CharacterPanel from "./components/CharacterPanel";
import ActionPanel from "./components/ActionPanel";
import EventCard from "./components/EventCard";
import LogPanel from "./components/LogPanel";
import {
  createNewGameState,
  cultivate,
  startAdventure,
  attemptBreakthrough,
  resolveEventChoice,
  describeRealm,
} from "./utils/gameLogic";
import { loadGameState, saveGameState, clearGameState } from "./utils/storage";
import type { GameState } from "./types/game";
import "./App.css";

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createNewGameState());

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
    }
  }, []);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleRestart = () => {
    clearGameState();
    setGameState(createNewGameState());
  };

  const handleCultivate = () => {
    const result = cultivate(gameState.character);
    setGameState({
      ...gameState,
      character: result.character,
      notification: result.notification,
      currentEvent: result.event,
    });
  };

  const handleAdventure = () => {
    const result = startAdventure(gameState.character);
    setGameState({
      ...gameState,
      character: result.character,
      notification: result.notification,
      currentEvent: result.event,
    });
  };

  const handleBreakthrough = () => {
    const result = attemptBreakthrough(gameState.character);
    const nextHistory = result.history
      ? [...gameState.character.history, result.history]
      : gameState.character.history;
    setGameState({
      ...gameState,
      character: { ...result.character, history: nextHistory },
      notification: result.notification,
      currentEvent: undefined,
    });
  };

  const handleChooseEvent = (choiceId: string) => {
    const currentEvent = gameState.currentEvent;
    if (!currentEvent) return;
    const result = resolveEventChoice(gameState.character, currentEvent, choiceId);
    setGameState({
      ...gameState,
      character: result.character,
      notification: result.notification,
      currentEvent: undefined,
    });
  };

  const toggleLog = () => {
    setGameState((previous) => ({
      ...previous,
      showLog: !previous.showLog,
    }));
  };

  const realmDescription = useMemo(
    () => describeRealm(gameState.character.realm),
    [gameState.character.realm]
  );

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className="screen-shell">
          <div className="top-bar">
            <div>
              <p className="subtle">修仙人生模拟器 v0.1</p>
              <h2>{gameState.character.name}</h2>
            </div>
            <div className="realm-chip">
              <span>{gameState.character.age}岁</span>
              <strong>{gameState.character.realm}</strong>
            </div>
          </div>

          <CharacterPanel
            character={gameState.character}
            realmDescription={realmDescription}
          />

          <div className="notification-bar">
            <p>{gameState.notification}</p>
          </div>

          {gameState.currentEvent ? (
            <EventCard event={gameState.currentEvent} onChoose={handleChooseEvent} />
          ) : null}

          <ActionPanel
            onCultivate={handleCultivate}
            onAdventure={handleAdventure}
            onBreakthrough={handleBreakthrough}
            onToggleLog={toggleLog}
            onRestart={handleRestart}
            character={gameState.character}
            showLog={gameState.showLog}
          />

          {gameState.showLog ? <LogPanel history={gameState.character.history} /> : null}
        </div>
      </div>
    </div>
  );
}

export default App;
