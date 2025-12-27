'use client';

import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronsDown, ChevronsUp } from 'lucide-react';
import { BookmarkNode } from './BookmarkNode';
import type { BookmarkNode as BookmarkNodeType } from '../types';

interface BookmarkTreeProps {
  bookmarkTree: BookmarkNodeType[];
  searchQuery: string;
  batchMode: boolean;
  selectedBookmarks: Set<string>;
  collapsedNodes: Set<string>;
  onSearchChange: (query: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onEdit: (node: BookmarkNodeType) => void;
  onDelete: (id: string) => void;
  onAddChild: (node: BookmarkNodeType) => void;
  onNavigate: (page: number, destX: number | null, destY: number | null, zoom: string | null) => void;
  onReorder: (activeId: string, overId: string, parentId: string | null) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  currentPage: number;
}

const matchesSearch = (node: BookmarkNodeType, query: string): boolean => {
  if (!query) return true;
  if (node.title.toLowerCase().includes(query.toLowerCase())) return true;
  return node.children.some((child) => matchesSearch(child, query));
};

export const BookmarkTree = ({
  bookmarkTree,
  searchQuery,
  batchMode,
  selectedBookmarks,
  collapsedNodes,
  onSearchChange,
  onToggleSelect,
  onToggleCollapse,
  onEdit,
  onDelete,
  onAddChild,
  onNavigate,
  onReorder,
  onExpandAll,
  onCollapseAll,
}: BookmarkTreeProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTree = useMemo(() => {
    if (!searchQuery) return bookmarkTree;
    return bookmarkTree.filter((node) => matchesSearch(node, searchQuery));
  }, [bookmarkTree, searchQuery]);

  const getAllIds = (nodes: BookmarkNodeType[]): string[] => {
    let ids: string[] = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children.length > 0) {
        ids = ids.concat(getAllIds(node.children));
      }
    });
    return ids;
  };

  const allIds = useMemo(() => getAllIds(filteredTree), [filteredTree]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const findParent = (
      nodes: BookmarkNodeType[],
      targetId: string,
      parentId: string | null = null
    ): string | null => {
      for (const node of nodes) {
        if (node.id === targetId) return parentId;
        if (node.children.length > 0) {
          const found = findParent(node.children, targetId, node.id);
          if (found !== null) return found;
        }
      }
      return null;
    };

    const activeParent = findParent(bookmarkTree, active.id as string);
    const overParent = findParent(bookmarkTree, over.id as string);

    if (activeParent === overParent) {
      onReorder(active.id as string, over.id as string, activeParent);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold text-foreground mb-4">Bookmarks</h3>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          className="flex-1"
        >
          <ChevronsDown className="h-4 w-4 mr-1" />
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          className="flex-1"
        >
          <ChevronsUp className="h-4 w-4 mr-1" />
          Collapse All
        </Button>
      </div>

      <div className="mb-4 max-h-96 overflow-y-auto border border-border rounded-lg p-2">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {searchQuery ? 'No bookmarks match your search.' : 'No bookmarks yet. Add one above!'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allIds}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {filteredTree.map((node) => (
                  <BookmarkNode
                    key={node.id}
                    node={node}
                    level={0}
                    isSelected={selectedBookmarks.has(node.id)}
                    isCollapsed={collapsedNodes.has(node.id)}
                    isMatch={matchesSearch(node, searchQuery)}
                    batchMode={batchMode}
                    selectedBookmarks={selectedBookmarks}
                    collapsedNodes={collapsedNodes}
                    onToggleSelect={onToggleSelect}
                    onToggleCollapse={onToggleCollapse}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                    onNavigate={onNavigate}
                    searchQuery={searchQuery}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

