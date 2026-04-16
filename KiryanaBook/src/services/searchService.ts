/**
 * 🔍 KiryanaBook Smart Search Engine
 * Handles fuzzy matching, result highlighting, and recent history caching.
 */


export interface SearchResult<T> {
  item: T;
  score: number;
  matches: { start: number; end: number }[];
}

/**
 * Perform a fuzzy search on a list of items
 * Returns top results with match metadata for highlighting
 */
export const fuzzySearch = (
  query: string,
  list: any[],
  keys: string[],
  limit: number = 20
): any[] => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase().trim();
  
  const scored = list.map(item => {
    let bestScore = 0;
    
    for (const key of keys) {
      const val = (item[key] || '').toLowerCase();
      if (val === lowerQuery) {
        bestScore = 1.0; // Perfect match
        break;
      }
      if (val.startsWith(lowerQuery)) {
        bestScore = Math.max(bestScore, 0.8 + (lowerQuery.length / val.length) * 0.1);
      } else if (val.includes(lowerQuery)) {
        bestScore = Math.max(bestScore, 0.5 + (lowerQuery.length / val.length) * 0.1);
      } else {
        // Simple fuzzy: every character appears in order
        let queryIdx = 0;
        for (let char of val) {
          if (char === lowerQuery[queryIdx]) queryIdx++;
          if (queryIdx === lowerQuery.length) break;
        }
        if (queryIdx === lowerQuery.length) {
          bestScore = Math.max(bestScore, 0.2 + (lowerQuery.length / val.length) * 0.1);
        }
      }
    }
    
    return { item, score: bestScore };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.item);
};

/**
 * Highlight matching text in a string
 */
export const highlightMatch = (text: string, query: string) => {
  if (!query) return [{ text, match: false }];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return [{ text, match: false }];
  
  return [
    { text: text.slice(0, index), match: false },
    { text: text.slice(index, index + query.length), match: true },
    { text: text.slice(index + query.length), match: false }
  ];
};

/**
 * Manage Search History (LocalStorage)
 */
const HISTORY_KEY = 'kb_search_history_';

export const getSearchHistory = (category: string): any[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY + category);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveToHistory = (category: string, item: any) => {
  try {
    const current = getSearchHistory(category);
    const filtered = current.filter(i => (i.id || i.name) !== (item.id || item.name));
    const updated = [item, ...filtered].slice(0, 10); // Keep top 10
    localStorage.setItem(HISTORY_KEY + category, JSON.stringify(updated));
  } catch (e) {}
};
