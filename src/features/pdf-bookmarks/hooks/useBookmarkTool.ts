"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";
import { extractExistingBookmarks } from "../lib/bookmark-extract";
import { savePDFWithBookmarks } from "../lib/bookmark-save";
import { parseCSV, parseJSON } from "../lib/bookmark-import";
import { exportToCSV, exportToJSON } from "../lib/bookmark-export";
import { useBookmarkHistory } from "./useBookmarkHistory";
import { usePDFViewer } from "./usePDFViewer";
import type { BookmarkNode } from "../types";

export interface UseBookmarkToolReturn {
  bookmarkTree: BookmarkNode[];
  searchQuery: string;
  batchMode: boolean;
  selectedBookmarks: Set<string>;
  collapsedNodes: Set<string>;
  isPickingDestination: boolean;
  destinationMarker: { x: number; y: number } | null;
  currentPage: number;
  originalFileName: string;
  pdfLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  pendingImport: {
    type: "csv" | "json";
    fileName: string;
    bookmarks: BookmarkNode[];
  } | null;

  pdfViewer: ReturnType<typeof usePDFViewer>;

  canUndo: boolean;
  canRedo: boolean;

  loadPDF: (file: File, autoExtract?: boolean) => Promise<void>;
  addBookmark: (title: string, page: number) => void;
  editBookmark: (
    id: string,
    data: {
      title: string;
      color: string | null;
      style: string | null;
      destPage: number;
      destX: number | null;
      destY: number | null;
      zoom: string | null;
    }
  ) => void;
  deleteBookmark: (id: string) => void;
  deleteSelectedBookmarks: () => void;
  addChildBookmark: (parentId: string, title: string) => void;
  reorderBookmarks: (
    activeId: string,
    overId: string,
    parentId: string | null
  ) => void;
  navigateToBookmark: (
    page: number,
    destX: number | null,
    destY: number | null,
    zoom: string | null
  ) => void;
  setSearchQuery: (query: string) => void;
  toggleBatchMode: () => void;
  toggleSelectBookmark: (id: string) => void;
  selectAllBookmarks: () => void;
  deselectAllBookmarks: () => void;
  applyBatchColor: (color: string | null) => void;
  applyBatchStyle: (style: string | null) => void;
  toggleCollapse: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  importCSV: (file: File) => Promise<void>;
  importJSON: (file: File) => Promise<void>;
  exportCSV: () => void;
  exportJSON: () => void;
  extractExisting: () => Promise<void>;
  savePDF: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  startDestinationPicking: () => void;
  cancelDestinationPicking: () => void;
  setDestination: (x: number, y: number, page: number) => void;
  updateCurrentPage: (page: number) => void;
  clearPendingImport: () => void;
}

const reorderNodeChildren = (
  node: BookmarkNode,
  activeId: string,
  overId: string
): BookmarkNode | null => {
  const activeIndex = node.children.findIndex((c) => c.id === activeId);
  const overIndex = node.children.findIndex((c) => c.id === overId);

  if (activeIndex === -1 || overIndex === -1) {
    return null;
  }

  const children = [...node.children];
  const [moved] = children.splice(activeIndex, 1);
  children.splice(overIndex, 0, moved);
  return { ...node, children };
};

const findAndReorderInTree = (
  nodes: BookmarkNode[],
  parentId: string,
  activeId: string,
  overId: string
): BookmarkNode[] => {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const reordered = reorderNodeChildren(node, activeId, overId);
      if (reordered) {
        return reordered;
      }
    }
    return {
      ...node,
      children: findAndReorderInTree(node.children, parentId, activeId, overId),
    };
  });
};

const applyPropertyToSelectedNodes = (
  nodes: BookmarkNode[],
  selectedBookmarks: Set<string>,
  property: "color" | "style",
  value: string | null
): BookmarkNode[] => {
  return nodes.map((node) => {
    if (selectedBookmarks.has(node.id)) {
      return { ...node, [property]: value };
    }
    return {
      ...node,
      children: node.children.map((child) =>
        selectedBookmarks.has(child.id)
          ? { ...child, [property]: value }
          : child
      ),
    };
  });
};

export const useBookmarkTool = (): UseBookmarkToolReturn => {
  const [bookmarkTree, setBookmarkTree] = useState<BookmarkNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(
    new Set()
  );
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [isPickingDestination, setIsPickingDestination] = useState(false);
  const [destinationMarker, setDestinationMarker] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [originalFileName, setOriginalFileName] = useState("");
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDestinationCallback, setPendingDestinationCallback] = useState<
    ((x: number, y: number) => void) | null
  >(null);
  const [pendingImport, setPendingImport] = useState<{
    type: "csv" | "json";
    fileName: string;
    bookmarks: BookmarkNode[];
  } | null>(null);

  const pdfLibDocRef = useRef<PDFDocument | null>(null);
  const pdfViewer = usePDFViewer();
  const history = useBookmarkHistory();

  const saveState = useCallback(() => {
    history.saveState(bookmarkTree);
  }, [bookmarkTree, history]);

  const loadPDF = useCallback(
    async (file: File, autoExtract = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdfLibDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });

        pdfLibDocRef.current = pdfLibDoc;
        await pdfViewer.loadPDF(arrayBuffer);

        setOriginalFileName(file.name.replace(".pdf", ""));
        setCurrentPage(1);
        setBookmarkTree([]);
        setSelectedBookmarks(new Set());
        setCollapsedNodes(new Set());
        setPdfLoaded(true);

        if (autoExtract) {
          const extracted = await extractExistingBookmarks(pdfLibDoc);
          if (extracted.length > 0) {
            setBookmarkTree(extracted);
            saveState();
          }
        } else if (pendingImport) {
          setBookmarkTree(pendingImport.bookmarks);
          saveState();
          setPendingImport(null);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load PDF. It may be corrupted or password-protected."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [pdfViewer, saveState, pendingImport]
  );

  const addBookmark = useCallback(
    (title: string, page: number) => {
      const newBookmark: BookmarkNode = {
        id: Date.now().toString(),
        title,
        page,
        children: [],
        color: null,
        style: null,
        destX: null,
        destY: null,
        zoom: null,
      };
      setBookmarkTree((prev) => [...prev, newBookmark]);
      saveState();
    },
    [saveState]
  );

  const findNodeById = useCallback(
    (nodes: BookmarkNode[], id: string): BookmarkNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children.length > 0) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  const updateNodeById = useCallback(
    (
      nodes: BookmarkNode[],
      id: string,
      updater: (node: BookmarkNode) => BookmarkNode
    ): BookmarkNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return updater(node);
        }
        if (node.children.length > 0) {
          return {
            ...node,
            children: updateNodeById(node.children, id, updater),
          };
        }
        return node;
      });
    },
    []
  );

  const removeNodeById = useCallback(
    (nodes: BookmarkNode[], id: string): BookmarkNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: removeNodeById(node.children, id),
        }));
    },
    []
  );

  const editBookmark = useCallback(
    (
      id: string,
      data: {
        title: string;
        color: string | null;
        style: string | null;
        destPage: number;
        destX: number | null;
        destY: number | null;
        zoom: string | null;
      }
    ) => {
      setBookmarkTree((prev) =>
        updateNodeById(prev, id, (node) => ({
          ...node,
          title: data.title,
          color: data.color,
          style: data.style,
          page: data.destPage,
          destX: data.destX,
          destY: data.destY,
          zoom: data.zoom,
        }))
      );
      saveState();
    },
    [updateNodeById, saveState]
  );

  const deleteBookmark = useCallback(
    (id: string) => {
      setBookmarkTree((prev) => removeNodeById(prev, id));
      setSelectedBookmarks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      saveState();
    },
    [removeNodeById, saveState]
  );

  const deleteSelectedBookmarks = useCallback(() => {
    setBookmarkTree((prev) => {
      let result = prev;
      selectedBookmarks.forEach((id) => {
        result = removeNodeById(result, id);
      });
      return result;
    });
    setSelectedBookmarks(new Set());
    saveState();
  }, [selectedBookmarks, removeNodeById, saveState]);

  const addChildBookmark = useCallback(
    (parentId: string, title: string) => {
      setBookmarkTree((prev) =>
        updateNodeById(prev, parentId, (node) => ({
          ...node,
          children: [
            ...node.children,
            {
              id: Date.now().toString(),
              title,
              page: currentPage,
              children: [],
              color: null,
              style: null,
              destX: null,
              destY: null,
              zoom: null,
            },
          ],
        }))
      );
      setCollapsedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });
      saveState();
    },
    [currentPage, updateNodeById, saveState]
  );

  const reorderBookmarks = useCallback(
    (activeId: string, overId: string, parentId: string | null) => {
      setBookmarkTree((prev) => {
        const treeCopy = structuredClone(prev);

        if (parentId === null) {
          const activeIndex = treeCopy.findIndex(
            (n: BookmarkNode) => n.id === activeId
          );
          const overIndex = treeCopy.findIndex(
            (n: BookmarkNode) => n.id === overId
          );
          if (activeIndex !== -1 && overIndex !== -1) {
            const [moved] = treeCopy.splice(activeIndex, 1);
            treeCopy.splice(overIndex, 0, moved);
          }
        } else {
          return findAndReorderInTree(treeCopy, parentId, activeId, overId);
        }

        return treeCopy;
      });
      saveState();
    },
    [saveState]
  );

  const navigateToBookmark = useCallback(
    (page: number, destX: number | null, destY: number | null) => {
      pdfViewer.goToPage(page);
      setCurrentPage(page);
      if (destX !== null && destY !== null) {
        setDestinationMarker({ x: destX, y: destY });
        setTimeout(() => {
          setDestinationMarker(null);
        }, 2000);
      }
    },
    [pdfViewer]
  );

  const toggleBatchMode = useCallback(() => {
    setBatchMode((prev) => !prev);
    if (batchMode) {
      setSelectedBookmarks(new Set());
    }
  }, [batchMode]);

  const toggleSelectBookmark = useCallback((id: string) => {
    setSelectedBookmarks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllBookmarks = useCallback(() => {
    const getAllIds = (nodes: BookmarkNode[]): string[] => {
      let ids: string[] = [];
      nodes.forEach((node) => {
        ids.push(node.id);
        if (node.children.length > 0) {
          ids = ids.concat(getAllIds(node.children));
        }
      });
      return ids;
    };
    setSelectedBookmarks(new Set(getAllIds(bookmarkTree)));
  }, [bookmarkTree]);

  const deselectAllBookmarks = useCallback(() => {
    setSelectedBookmarks(new Set());
  }, []);

  const applyBatchColor = useCallback(
    (color: string | null) => {
      setBookmarkTree((prev) =>
        applyPropertyToSelectedNodes(prev, selectedBookmarks, "color", color)
      );
      saveState();
    },
    [selectedBookmarks, saveState]
  );

  const applyBatchStyle = useCallback(
    (style: string | null) => {
      setBookmarkTree((prev) =>
        applyPropertyToSelectedNodes(prev, selectedBookmarks, "style", style)
      );
      saveState();
    },
    [selectedBookmarks, saveState]
  );

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    const getAllIds = (nodes: BookmarkNode[]): string[] => {
      let ids: string[] = [];
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          ids.push(node.id);
          ids = ids.concat(getAllIds(node.children));
        }
      });
      return ids;
    };
    setCollapsedNodes(new Set(getAllIds(bookmarkTree)));
  }, [bookmarkTree]);

  const importCSV = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const imported = parseCSV(text);
        if (imported.length > 0) {
          if (pdfLoaded) {
            setBookmarkTree(imported);
            saveState();
            setPendingImport(null);
          } else {
            setPendingImport({
              type: "csv",
              fileName: file.name,
              bookmarks: imported,
            });
          }
        }
      } catch {
        throw new Error("Failed to import CSV");
      }
    },
    [saveState, pdfLoaded]
  );

  const importJSON = useCallback(
    async (file: File) => {
      const text = await file.text();
      const imported = parseJSON(text);
      if (pdfLoaded) {
        setBookmarkTree(imported);
        saveState();
        setPendingImport(null);
      } else {
        setPendingImport({
          type: "json",
          fileName: file.name,
          bookmarks: imported,
        });
      }
    },
    [saveState, pdfLoaded]
  );

  const exportCSV = useCallback(() => {
    exportToCSV(bookmarkTree, originalFileName);
  }, [bookmarkTree, originalFileName]);

  const exportJSON = useCallback(() => {
    exportToJSON(bookmarkTree, originalFileName);
  }, [bookmarkTree, originalFileName]);

  const extractExisting = useCallback(async () => {
    if (!pdfLibDocRef.current) return;
    const extracted = await extractExistingBookmarks(pdfLibDocRef.current);
    if (extracted.length > 0) {
      setBookmarkTree(extracted);
      saveState();
    }
  }, [saveState]);

  const savePDF = useCallback(async () => {
    if (!pdfLibDocRef.current) {
      throw new Error("No PDF loaded");
    }
    await savePDFWithBookmarks(
      pdfLibDocRef.current,
      bookmarkTree,
      originalFileName
    );
  }, [bookmarkTree, originalFileName]);

  const undo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      setBookmarkTree(previousState);
    }
  }, [history]);

  const redo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setBookmarkTree(nextState);
    }
  }, [history]);

  const clearPendingImport = useCallback(() => {
    setPendingImport(null);
  }, []);

  const reset = useCallback(() => {
    pdfLibDocRef.current = null;
    setBookmarkTree([]);
    setSearchQuery("");
    setBatchMode(false);
    setSelectedBookmarks(new Set());
    setCollapsedNodes(new Set());
    setCurrentPage(1);
    setOriginalFileName("");
    setPdfLoaded(false);
    setDestinationMarker(null);
    setIsPickingDestination(false);
    setPendingDestinationCallback(null);
    setPendingImport(null);
    history.clearHistory();
  }, [history]);

  const startDestinationPicking = useCallback(() => {
    setIsPickingDestination(true);
  }, []);

  const cancelDestinationPicking = useCallback(() => {
    setIsPickingDestination(false);
    setPendingDestinationCallback(null);
    setDestinationMarker(null);
  }, []);

  const setDestination = useCallback(
    (x: number, y: number, page: number) => {
      setDestinationMarker({ x, y });
      if (pendingDestinationCallback) {
        pendingDestinationCallback(x, y);
        setPendingDestinationCallback(null);
      }
      setTimeout(() => {
        setDestinationMarker(null);
      }, 500);
    },
    [pendingDestinationCallback]
  );

  const updateCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (pdfLoaded && pdfViewer.state.currentPage !== currentPage) {
      setCurrentPage(pdfViewer.state.currentPage);
    }
  }, [pdfViewer.state.currentPage, pdfLoaded, currentPage]);

  return {
    bookmarkTree,
    searchQuery,
    batchMode,
    selectedBookmarks,
    collapsedNodes,
    isPickingDestination,
    destinationMarker,
    currentPage,
    originalFileName,
    pdfLoaded,
    isLoading,
    error,
    pendingImport,

    pdfViewer,

    canUndo: history.canUndo,
    canRedo: history.canRedo,

    loadPDF,
    addBookmark,
    editBookmark,
    deleteBookmark,
    deleteSelectedBookmarks,
    addChildBookmark,
    reorderBookmarks,
    navigateToBookmark,
    setSearchQuery,
    toggleBatchMode,
    toggleSelectBookmark,
    selectAllBookmarks,
    deselectAllBookmarks,
    applyBatchColor,
    applyBatchStyle,
    toggleCollapse,
    expandAll,
    collapseAll,
    importCSV,
    importJSON,
    exportCSV,
    exportJSON,
    extractExisting,
    savePDF,
    undo,
    redo,
    reset,
    startDestinationPicking,
    cancelDestinationPicking,
    setDestination,
    updateCurrentPage,
    clearPendingImport,
  };
};
