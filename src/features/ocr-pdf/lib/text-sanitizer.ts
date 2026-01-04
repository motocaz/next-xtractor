export const sanitizeTextForWinAnsi = (text: string): string => {
  return text
    .replace(/[\u007F-\u009F\u200E\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '');
};

