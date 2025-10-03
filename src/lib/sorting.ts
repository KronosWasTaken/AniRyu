export type SortField = 
  | 'title'
  | 'score';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
];

export function sortMedia<T extends Record<string, any>>(
  items: T[],
  sortConfig: SortConfig
): T[] {
  const { field, direction } = sortConfig;
  
  return [...items].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (field) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'score':
        aValue = a.score || 0;
        bValue = b.score || 0;
        break;
      default:
        return 0;
    }
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // Compare values
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
