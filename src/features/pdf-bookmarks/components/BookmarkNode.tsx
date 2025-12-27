'use client';

import { Button } from '@/components/ui/button';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Crosshair,
} from 'lucide-react';
import type { BookmarkNode as BookmarkNodeType } from '../types';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BookmarkNodeProps {
  node: BookmarkNodeType;
  level: number;
  isSelected: boolean;
  isCollapsed: boolean;
  isMatch: boolean;
  batchMode: boolean;
  selectedBookmarks?: Set<string>;
  collapsedNodes?: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onEdit: (node: BookmarkNodeType) => void;
  onDelete: (id: string) => void;
  onAddChild: (node: BookmarkNodeType) => void;
  onNavigate: (page: number, destX: number | null, destY: number | null, zoom: string | null) => void;
  searchQuery: string;
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700',
  blue: 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
  green: 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700',
  yellow: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700',
  purple: 'bg-purple-100 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700',
};

const getStyleClasses = (style: string | null): string => {
  if (style === 'bold') return 'font-bold';
  if (style === 'italic') return 'italic';
  if (style === 'bold-italic') return 'font-bold italic';
  return '';
};

const getTextColor = (color: string | null): string => {
  if (!color) return '';
  if (color.startsWith('#')) return '';
  const colorMap: Record<string, string> = {
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };
  return colorMap[color] || '';
};

export const BookmarkNode = ({
  node,
  level,
  isSelected,
  isCollapsed,
  isMatch,
  batchMode,
  selectedBookmarks,
  collapsedNodes,
  onToggleSelect,
  onToggleCollapse,
  onEdit,
  onDelete,
  onAddChild,
  onNavigate,
  searchQuery,
}: BookmarkNodeProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = node.children && node.children.length > 0;
  const hasDestination =
    node.destX !== null || node.destY !== null || node.zoom !== null;
  const highlight = isMatch && searchQuery ? 'bg-yellow-100 dark:bg-yellow-900/30' : '';
  const colorClass = node.color ? colorClasses[node.color] || '' : '';
  const styleClass = getStyleClasses(node.style);
  const textColorClass = getTextColor(node.color);
  const customColorStyle =
    node.color && node.color.startsWith('#')
      ? { color: node.color }
      : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-bookmark-id={node.id}
      className="group"
    >
      <div
        className={`flex items-center gap-2 p-2 rounded border border-border ${colorClass} ${highlight} ${
          isSelected ? 'ring-2 ring-primary' : ''
        } hover:bg-accent transition-colors`}
      >
        {batchMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(node.id)}
            className="w-4 h-4 shrink-0 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div
          {...attributes}
          {...listeners}
          className="cursor-move shrink-0 text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
          aria-label="Drag handle"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {hasChildren ? (
          <button
            onClick={() => onToggleCollapse(node.id)}
            className="p-0 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() =>
            onNavigate(node.page, node.destX, node.destY, node.zoom)
          }
        >
          <span
            className={`text-sm block ${styleClass} ${textColorClass}`}
            style={customColorStyle}
          >
            {node.title}
            {hasDestination && (
              <Crosshair className="h-3 w-3 inline-block ml-1 text-primary" />
            )}
          </span>
          <span className="text-xs text-muted-foreground">Page {node.page}</span>
        </div>

        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node);
            }}
            title="Add child"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <ul className="child-container space-y-2 mt-2 pl-6 relative">
          {node.children.map((child) => (
            <BookmarkNode
              key={child.id}
              node={child}
              level={level + 1}
              isSelected={selectedBookmarks?.has(child.id) || false}
              isCollapsed={collapsedNodes?.has(child.id) || false}
              isMatch={isMatch}
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
      )}
    </li>
  );
};

