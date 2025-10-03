import { useState, useCallback } from 'react';

export interface BulkSelectState {
  selectedItems: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export function useBulkSelect(totalItems: number) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(Array.from({ length: totalItems }, (_, i) => i.toString())));
  }, [totalItems]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === totalItems) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [selectedItems.size, totalItems, clearSelection, selectAll]);

  const isSelected = useCallback((itemId: string) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  const isAllSelected = selectedItems.size === totalItems && totalItems > 0;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < totalItems;

  return {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedItems.size,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    isSelected,
  };
}
