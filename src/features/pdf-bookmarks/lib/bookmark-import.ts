import type { BookmarkNode } from '../types';

export const parseCSV = (text: string): BookmarkNode[] => {
  const lines = text.trim().split('\n').slice(1);
  const bookmarks: BookmarkNode[] = [];
  const stack: Array<{ children: BookmarkNode[]; level: number }> = [
    { children: bookmarks, level: -1 },
  ];

  for (const line of lines) {
    const pattern1 = /^"(.+)",(\d+),(\d+)$/;
    const pattern2 = /^([^,]+),(\d+),(\d+)$/;
    const match = pattern1.exec(line) || pattern2.exec(line);
    if (!match) continue;

    const [, title, page, level] = match;
    const bookmark: BookmarkNode = {
      id: String(Date.now() + Math.random()),
      title: title.replace(/""/g, '"'),
      page: Number.parseInt(page),
      children: [],
      color: null,
      style: null,
      destX: null,
      destY: null,
      zoom: null,
    };

    const lvl = Number.parseInt(level);
    while (stack[stack.length - 1].level >= lvl) stack.pop();
    stack[stack.length - 1].children.push(bookmark);
    stack.push({ ...bookmark, level: lvl });
  }

  return bookmarks;
};

export const parseJSON = (text: string): BookmarkNode[] => {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON must be an array of bookmarks');
    }
    return parsed as BookmarkNode[];
  } catch {
    throw new Error('Invalid JSON format');
  }
};

