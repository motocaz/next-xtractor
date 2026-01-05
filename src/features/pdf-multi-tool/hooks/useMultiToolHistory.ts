'use client';

import { useReducer, useCallback } from 'react';
import type { MultiToolSnapshot } from '../types';

export interface UseMultiToolHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => MultiToolSnapshot | null;
  redo: () => MultiToolSnapshot | null;
  saveState: (snapshot: MultiToolSnapshot) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

interface HistoryState {
  history: MultiToolSnapshot[];
  index: number;
}

type HistoryAction =
  | { type: 'SAVE_STATE'; snapshot: MultiToolSnapshot }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

const historyReducer = (
  state: HistoryState,
  action: HistoryAction
): HistoryState => {
  switch (action.type) {
    case 'SAVE_STATE': {
      const newHistory = state.history.slice(0, state.index + 1);
      const newState = structuredClone(action.snapshot);
      newHistory.push(newState);

      let newIndex = newHistory.length - 1;
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        newIndex = MAX_HISTORY_SIZE - 1;
      }

      return {
        history: newHistory,
        index: newIndex,
      };
    }
    case 'UNDO': {
      if (state.index > 0) {
        return {
          ...state,
          index: state.index - 1,
        };
      }
      return state;
    }
    case 'REDO': {
      if (state.index < state.history.length - 1) {
        return {
          ...state,
          index: state.index + 1,
        };
      }
      return state;
    }
    case 'CLEAR': {
      return {
        history: [],
        index: -1,
      };
    }
    default:
      return state;
  }
};

export const useMultiToolHistory = (): UseMultiToolHistoryReturn => {
  const [state, dispatch] = useReducer(historyReducer, {
    history: [],
    index: -1,
  });

  const saveState = useCallback((snapshot: MultiToolSnapshot) => {
    dispatch({ type: 'SAVE_STATE', snapshot });
  }, []);

  const undo = useCallback((): MultiToolSnapshot | null => {
    if (state.index > 0) {
      const newIndex = state.index - 1;
      const snapshot = structuredClone(state.history[newIndex]);
      dispatch({ type: 'UNDO' });
      return snapshot;
    }
    return null;
  }, [state.history, state.index]);

  const redo = useCallback((): MultiToolSnapshot | null => {
    if (state.index < state.history.length - 1) {
      const newIndex = state.index + 1;
      const snapshot = structuredClone(state.history[newIndex]);
      dispatch({ type: 'REDO' });
      return snapshot;
    }
    return null;
  }, [state.history, state.index]);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return {
    canUndo: state.index > 0,
    canRedo: state.index < state.history.length - 1,
    undo,
    redo,
    saveState,
    clearHistory,
  };
};
