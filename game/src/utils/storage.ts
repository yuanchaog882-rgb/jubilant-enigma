import type { GameState } from "../types/game";

const STORAGE_KEY = "xianxia-game-state-v0.1";

export const loadGameState = (): GameState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (error) {
    console.error("加载存档失败", error);
    return null;
  }
};

export const saveGameState = (state: GameState) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("保存存档失败", error);
  }
};

export const clearGameState = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
