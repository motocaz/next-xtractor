'use client';

import { useState, useCallback } from 'react';
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

export const useMultiToolHistory = (): UseMultiToolHistoryReturn => {
  const [history, setHistory] = useState<MultiToolSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveState = useCallback(
    (snapshot: MultiToolSnapshot) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const newState = structuredClone(snapshot);
        newHistory.push(newState);

        let newIndex = newHistory.length - 1;
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
          newIndex = MAX_HISTORY_SIZE - 1;
        }

        setHistoryIndex(newIndex);
        return newHistory;
      });
    },
    [historyIndex]
  );

  const undo = useCallback((): MultiToolSnapshot | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return structuredClone(history[newIndex]);
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback((): MultiToolSnapshot | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return structuredClone(history[newIndex]);
    }
    return null;
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
    saveState,
    clearHistory,
  };
};

