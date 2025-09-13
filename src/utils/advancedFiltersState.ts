// Utility for managing advanced filters expand/collapse state persistence

const STORAGE_KEY = 'astacar-advanced-filters-expanded';

export function getAdvancedFiltersExpanded(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : false; // Default collapsed
  } catch (error) {
    console.warn('Failed to load advanced filters state from localStorage:', error);
    return false;
  }
}

export function setAdvancedFiltersExpanded(expanded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
  } catch (error) {
    console.warn('Failed to save advanced filters state to localStorage:', error);
  }
}