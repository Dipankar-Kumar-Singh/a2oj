/**
 * Type-safe localStorage utilities
 * 
 * All localStorage operations go through these functions to ensure type safety.
 * No `any` types - everything is strictly typed.
 */

import {
  STORAGE_KEYS,
  getPageFiltersKey,
  DEFAULT_COLUMN_VISIBILITY,
  DEFAULT_PAGE_FILTERS,
  type ColumnVisibility,
  type PageFilters,
  type SolvedProblemsArray,
} from '../types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parse JSON from localStorage
 * Returns null if parsing fails or value doesn't exist
 */
function parseJSON<T>(value: string | null): T | null {
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Safely stringify and store JSON in localStorage
 */
function storeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// =============================================================================
// USER HANDLE
// =============================================================================

/**
 * Get the user's Codeforces handle
 */
export function getUserHandle(): string | null {
  return localStorage.getItem(STORAGE_KEYS.USER_HANDLE);
}

/**
 * Set the user's Codeforces handle
 */
export function setUserHandle(handle: string): void {
  localStorage.setItem(STORAGE_KEYS.USER_HANDLE, handle);
}

// =============================================================================
// SOLVED PROBLEMS
// =============================================================================

/**
 * Get the set of solved problem keys
 */
export function getSolvedProblems(): Set<string> {
  const data = parseJSON<SolvedProblemsArray>(
    localStorage.getItem(STORAGE_KEYS.SOLVED_PROBLEMS)
  );
  return new Set(data ?? []);
}

/**
 * Save the set of solved problem keys
 */
export function setSolvedProblems(solved: Set<string>): void {
  const array: string[] = [...solved];
  storeJSON(STORAGE_KEYS.SOLVED_PROBLEMS, array);
}

/**
 * Add a solved problem
 */
export function addSolvedProblem(problemKey: string): void {
  const solved = getSolvedProblems();
  solved.add(problemKey);
  setSolvedProblems(solved);
}

// =============================================================================
// SYNC TIMESTAMP
// =============================================================================

/**
 * Get the last sync timestamp
 */
export function getLastSynced(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
}

/**
 * Set the last sync timestamp
 */
export function setLastSynced(timestamp: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, timestamp);
}

// =============================================================================
// COLUMN VISIBILITY (Global)
// =============================================================================

/**
 * Get global column visibility settings
 */
export function getColumnVisibility(): ColumnVisibility {
  const data = parseJSON<ColumnVisibility>(
    localStorage.getItem(STORAGE_KEYS.GLOBAL_COLUMN_VISIBILITY)
  );
  return data ?? DEFAULT_COLUMN_VISIBILITY;
}

/**
 * Save global column visibility settings
 */
export function setColumnVisibility(visibility: ColumnVisibility): void {
  storeJSON(STORAGE_KEYS.GLOBAL_COLUMN_VISIBILITY, visibility);
}

/**
 * Update a single column visibility setting
 */
export function updateColumnVisibility(
  column: keyof ColumnVisibility,
  visible: boolean
): ColumnVisibility {
  const current = getColumnVisibility();
  const updated: ColumnVisibility = {
    ...current,
    [column]: visible,
  };
  setColumnVisibility(updated);
  return updated;
}

// =============================================================================
// HIDE SOLVED (Global)
// =============================================================================

/**
 * Get global hide solved setting
 */
export function getHideSolved(): boolean {
  const value = localStorage.getItem(STORAGE_KEYS.GLOBAL_HIDE_SOLVED);
  return value === 'true';
}

/**
 * Set global hide solved setting
 */
export function setHideSolved(hide: boolean): void {
  localStorage.setItem(STORAGE_KEYS.GLOBAL_HIDE_SOLVED, String(hide));
}

// =============================================================================
// ZEN MODE (Global)
// =============================================================================

/**
 * Get zen mode state
 */
export function getZenMode(): boolean {
  const value = localStorage.getItem(STORAGE_KEYS.ZEN_MODE_ACTIVE);
  return value === 'true';
}

/**
 * Set zen mode state
 */
export function setZenMode(active: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ZEN_MODE_ACTIVE, String(active));
}

// =============================================================================
// THEME (Global)
// =============================================================================

export type Theme = 'light' | 'dark';

/**
 * Get theme setting
 * Falls back to system preference if not set
 */
export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  // Fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Set theme setting
 */
export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// =============================================================================
// PAGE FILTERS (Per-Page)
// =============================================================================

/**
 * Get filters for a specific ladder page
 */
export function getPageFilters(ladderId: number): PageFilters {
  const key = getPageFiltersKey(ladderId);
  const data = parseJSON<PageFilters>(localStorage.getItem(key));
  return data ?? DEFAULT_PAGE_FILTERS;
}

/**
 * Save filters for a specific ladder page
 */
export function setPageFilters(ladderId: number, filters: PageFilters): void {
  const key = getPageFiltersKey(ladderId);
  storeJSON(key, filters);
}

/**
 * Update a single filter setting for a ladder page
 */
export function updatePageFilter<K extends keyof PageFilters>(
  ladderId: number,
  filterKey: K,
  value: PageFilters[K]
): PageFilters {
  const current = getPageFilters(ladderId);
  const updated: PageFilters = {
    ...current,
    [filterKey]: value,
  };
  setPageFilters(ladderId, updated);
  return updated;
}

/**
 * Clear all filters for a specific ladder page
 */
export function clearPageFilters(ladderId: number): void {
  setPageFilters(ladderId, DEFAULT_PAGE_FILTERS);
}

// =============================================================================
// PROGRESS CALCULATION
// =============================================================================

/**
 * Calculate number of solved problems in a ladder
 */
export function calculateSolvedCount(
  problems: readonly { contestId: number; problemId: string }[],
  solvedSet: Set<string>
): number {
  return problems.filter((p) => solvedSet.has(`${p.contestId}-${p.problemId}`)).length;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercent(solved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((solved / total) * 100);
}

