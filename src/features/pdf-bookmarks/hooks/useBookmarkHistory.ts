"use client";

import { useState, useCallback } from "react";
import type { BookmarkNode } from "../types";

export interface UseBookmarkHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => BookmarkNode[] | null;
  redo: () => BookmarkNode[] | null;
  saveState: (bookmarkTree: BookmarkNode[]) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export const useBookmarkHistory = (): UseBookmarkHistoryReturn => {
  const [history, setHistory] = useState<BookmarkNode[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveState = useCallback(
    (bookmarkTree: BookmarkNode[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const newState = JSON.parse(JSON.stringify(bookmarkTree));
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

  const undo = useCallback((): BookmarkNode[] | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return JSON.parse(JSON.stringify(history[newIndex]));
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback((): BookmarkNode[] | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return JSON.parse(JSON.stringify(history[newIndex]));
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
