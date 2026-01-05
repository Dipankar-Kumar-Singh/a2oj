import { STORAGE_KEYS, getPageFiltersKey, DEFAULT_COLUMN_VISIBILITY } from '../types';
import type { PageFilters } from '../types';

interface ProblemStatus {
  readonly solved: readonly string[];
  readonly attempted: readonly string[];
}

type SortOrder = 'none' | 'asc' | 'desc';

interface MutableColumnVisibility {
  difficulty: boolean;
  rating: boolean;
  tags: boolean;
  problemId: boolean;
}

interface PageState {
  columnVisibility: MutableColumnVisibility;
  currentSort: SortOrder;
  originalRows: HTMLElement[];
  zenActive: boolean;
  previousVisibilityState: MutableColumnVisibility | null;
}

// =============================================================================
// STATE
// =============================================================================

let state: PageState = {
  columnVisibility: { ...DEFAULT_COLUMN_VISIBILITY },
  currentSort: 'none',
  originalRows: [],
  zenActive: false,
  previousVisibilityState: null,
};

let ladderId: number;

function loadProblemStatus(): ProblemStatus {
  let solved: string[] = [];
  let attempted: string[] = [];

  const solvedStr = localStorage.getItem('cf_solved');
  const attemptedStr = localStorage.getItem('cf_attempted');

  try {
    if (solvedStr) solved = JSON.parse(solvedStr) as string[];
  } catch { /* ignore */ }

  try {
    if (attemptedStr) attempted = JSON.parse(attemptedStr) as string[];
  } catch { /* ignore */ }

  return { solved, attempted };
}

function markAsSolved(row: HTMLElement): void {
  row.classList.add('problem-row-solved');
  const statusCell = row.querySelector('.status-cell');
  if (statusCell) {
    statusCell.innerHTML = `
      <div class="engineering-status engineering-status-solved">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    `;
  }
}

function markAsAttempted(row: HTMLElement): void {
  row.classList.add('problem-row-attempted');
  const statusCell = row.querySelector('.status-cell');
  if (statusCell) {
    statusCell.innerHTML = `
      <div class="engineering-status engineering-status-attempted">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;
  }
}

function updateProgressUI(solvedCount: number, _attemptedCount: number, totalCount: number): void {
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const progressFill = document.querySelector<HTMLElement>('.engineering-progress-fill');
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }

  const progressCount = document.querySelector('.engineering-progress-count');
  if (progressCount) {
    progressCount.innerHTML = `${solvedCount}<span class="text-slate-400 dark:text-slate-500"> / ${totalCount}</span>`;
  }
}

function updateColumnVisibility(): void {
  const table = document.getElementById('problems-table');
  if (!table) return;

  const { columnVisibility } = state;

  const difficultyHeader = table.querySelector<HTMLElement>('.difficulty-header');
  const difficultyCells = table.querySelectorAll<HTMLElement>('.difficulty-cell');
  if (difficultyHeader) {
    difficultyHeader.style.display = columnVisibility.difficulty ? '' : 'none';
  }
  difficultyCells.forEach((cell) => {
    cell.style.display = columnVisibility.difficulty ? '' : 'none';
  });

  const ratingHeader = table.querySelector<HTMLElement>('.rating-header');
  const ratingCells = table.querySelectorAll<HTMLElement>('.rating-cell');
  if (ratingHeader) {
    ratingHeader.style.display = columnVisibility.rating ? '' : 'none';
  }
  ratingCells.forEach((cell) => {
    cell.style.display = columnVisibility.rating ? '' : 'none';
  });

  const tagsHeader = table.querySelector<HTMLElement>('.tags-header');
  const tagsCells = table.querySelectorAll<HTMLElement>('.tags-cell');
  if (tagsHeader) {
    tagsHeader.style.display = columnVisibility.tags ? '' : 'none';
  }
  tagsCells.forEach((cell) => {
    cell.style.display = columnVisibility.tags ? '' : 'none';
  });

  const tagFilterGroup = document.getElementById('tag-filter-group');
  if (tagFilterGroup) {
    tagFilterGroup.style.display = columnVisibility.tags ? '' : 'none';
  }

  const tableBody = document.querySelector('.engineering-table-body');
  if (tableBody) {
    if (columnVisibility.problemId) {
      tableBody.classList.remove('hide-problemid');
    } else {
      tableBody.classList.add('hide-problemid');
    }
  }

  document.querySelectorAll<HTMLElement>('.column-toggle-btn').forEach((btn) => {
    const column = btn.dataset.column as keyof MutableColumnVisibility | undefined;
    if (column && state.columnVisibility[column] !== undefined) {
      btn.classList.toggle('active', state.columnVisibility[column]);
    }
  });

  localStorage.setItem(STORAGE_KEYS.GLOBAL_COLUMN_VISIBILITY, JSON.stringify(state.columnVisibility));
}

function savePageFilters(): void {
  const ratingMinEl = document.getElementById('rating-min') as HTMLInputElement | null;
  const ratingMaxEl = document.getElementById('rating-max') as HTMLInputElement | null;
  const tagFilterEl = document.getElementById('tag-filter') as HTMLSelectElement | null;

  const filters: PageFilters = {
    minRating: ratingMinEl?.value ? parseInt(ratingMinEl.value, 10) : null,
    maxRating: ratingMaxEl?.value ? parseInt(ratingMaxEl.value, 10) : null,
    selectedTag: tagFilterEl?.value ?? '',
    sortOrder: state.currentSort,
  };

  localStorage.setItem(getPageFiltersKey(ladderId), JSON.stringify(filters));
}

function loadPageFilters(): void {
  const saved = localStorage.getItem(getPageFiltersKey(ladderId));
  if (!saved) return;

  try {
    const filters = JSON.parse(saved) as PageFilters;

    const ratingMinEl = document.getElementById('rating-min') as HTMLInputElement | null;
    const ratingMaxEl = document.getElementById('rating-max') as HTMLInputElement | null;
    const tagFilterEl = document.getElementById('tag-filter') as HTMLSelectElement | null;

    if (ratingMinEl && filters.minRating !== null) {
      ratingMinEl.value = String(filters.minRating);
    }
    if (ratingMaxEl && filters.maxRating !== null) {
      ratingMaxEl.value = String(filters.maxRating);
    }
    if (tagFilterEl && filters.selectedTag) {
      tagFilterEl.value = filters.selectedTag;
    }
    if (filters.sortOrder) {
      state.currentSort = filters.sortOrder;
    }
  } catch { /* ignore */ }
}

function applyFiltersAndSort(): void {
  const tableBody = document.querySelector<HTMLElement>('.engineering-table-body');
  if (!tableBody) return;

  const ratingMinEl = document.getElementById('rating-min') as HTMLInputElement | null;
  const ratingMaxEl = document.getElementById('rating-max') as HTMLInputElement | null;
  const tagFilterEl = document.getElementById('tag-filter') as HTMLSelectElement | null;

  const ratingMin = ratingMinEl?.value ? parseInt(ratingMinEl.value, 10) : 0;
  const ratingMax = ratingMaxEl?.value ? parseInt(ratingMaxEl.value, 10) : 99999;
  const selectedTag = tagFilterEl?.value ?? '';

  let rows = Array.from(tableBody.querySelectorAll<HTMLElement>('.engineering-table-row'));

  if (state.originalRows.length === 0) {
    state.originalRows = [...rows];
  }

  rows.forEach((row) => {
    const rating = parseInt(row.dataset.rating ?? '0', 10);
    const tags = row.dataset.tags ?? '';
    let visible = true;

    if (rating > 0 && (rating < ratingMin || rating > ratingMax)) {
      visible = false;
    }

    if (state.columnVisibility.tags && selectedTag && visible) {
      const tagList = tags.split(',');
      if (!tagList.includes(selectedTag)) {
        visible = false;
      }
    }

    row.classList.toggle('filter-hidden', !visible);
  });

  if (state.currentSort !== 'none') {
    rows = rows.filter((row) => !row.classList.contains('filter-hidden'));
    rows.sort((a, b) => {
      const ratingA = parseInt(a.dataset.rating ?? '0', 10);
      const ratingB = parseInt(b.dataset.rating ?? '0', 10);
      return state.currentSort === 'asc' ? ratingA - ratingB : ratingB - ratingA;
    });

    rows.forEach((row) => tableBody.appendChild(row));

    state.originalRows.forEach((row) => {
      if (row.classList.contains('filter-hidden')) {
        tableBody.appendChild(row);
      }
    });
  }

  const visibleCount = tableBody.querySelectorAll('.engineering-table-row:not(.filter-hidden)').length;
  const filterCount = document.getElementById('filter-count');
  if (filterCount) {
    const totalRows = state.originalRows.length || tableBody.querySelectorAll('.engineering-table-row').length;
    if (visibleCount < totalRows) {
      filterCount.textContent = `${visibleCount} of ${totalRows}`;
      filterCount.classList.remove('hidden');
    } else {
      filterCount.classList.add('hidden');
    }
  }

  savePageFilters();
}

function resetToOriginalOrder(): void {
  const tableBody = document.querySelector<HTMLElement>('.engineering-table-body');
  if (!tableBody || state.originalRows.length === 0) return;

  state.originalRows.forEach((row) => tableBody.appendChild(row));
  state.currentSort = 'none';
  updateSortButtonStates();
}

function updateSortButtonStates(): void {
  const ascBtn = document.getElementById('sort-rating-asc');
  const descBtn = document.getElementById('sort-rating-desc');
  const resetBtn = document.getElementById('sort-reset');

  ascBtn?.classList.toggle('active', state.currentSort === 'asc');
  descBtn?.classList.toggle('active', state.currentSort === 'desc');
  resetBtn?.classList.toggle('active', state.currentSort === 'none');
}

function initFilterToggle(): void {
  const toggleBtn = document.getElementById('hide-solved-toggle');
  const tableBody = document.querySelector<HTMLElement>('.engineering-table-body');

  if (!toggleBtn || !tableBody) return;

  const btn = toggleBtn;
  const body = tableBody;
  const isHideSolvedActive = localStorage.getItem(STORAGE_KEYS.GLOBAL_HIDE_SOLVED) === 'true';

  function updateFilterState(active: boolean): void {
    if (active) {
      body.classList.add('hide-solved');
      btn.classList.add('active');
      const textSpan = btn.querySelector('.filter-toggle-text');
      if (textSpan) textSpan.textContent = 'Show All';
    } else {
      body.classList.remove('hide-solved');
      btn.classList.remove('active');
      const textSpan = btn.querySelector('.filter-toggle-text');
      if (textSpan) textSpan.textContent = 'Hide Solved';
    }
    applyFiltersAndSort();
  }

  updateFilterState(isHideSolvedActive);

  btn.addEventListener('click', () => {
    const isActive = body.classList.contains('hide-solved');
    const newState = !isActive;
    updateFilterState(newState);
    localStorage.setItem(STORAGE_KEYS.GLOBAL_HIDE_SOLVED, String(newState));
  });
}

function initColumnToggles(): void {
  const saved = localStorage.getItem(STORAGE_KEYS.GLOBAL_COLUMN_VISIBILITY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as MutableColumnVisibility;
      state.columnVisibility = { ...state.columnVisibility, ...parsed };
    } catch { /* ignore */ }
  }

  document.querySelectorAll<HTMLElement>('.column-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const column = btn.dataset.column as keyof MutableColumnVisibility | undefined;
      if (column && state.columnVisibility[column] !== undefined) {
        state.columnVisibility[column] = !state.columnVisibility[column];
        updateColumnVisibility();
        applyFiltersAndSort();
      }
    });
  });

  updateColumnVisibility();
}

function initZenMode(): void {
  const zenModeBtn = document.getElementById('zen-mode-btn');
  const filterPanel = document.getElementById('filter-panel');
  if (!zenModeBtn) return;

  const savedZenState = localStorage.getItem(STORAGE_KEYS.ZEN_MODE_ACTIVE);
  if (savedZenState === 'true') {
    state.zenActive = true;
    zenModeBtn.classList.add('active');
    if (filterPanel) filterPanel.classList.add('zen-hidden');

    state.columnVisibility.difficulty = false;
    state.columnVisibility.rating = false;
    state.columnVisibility.tags = false;
    state.columnVisibility.problemId = false;
    updateColumnVisibility();
  }

  zenModeBtn.addEventListener('click', () => {
    if (state.zenActive) {
      state.zenActive = false;
      zenModeBtn.classList.remove('active');
      localStorage.setItem(STORAGE_KEYS.ZEN_MODE_ACTIVE, 'false');

      if (filterPanel) filterPanel.classList.remove('zen-hidden');

      if (state.previousVisibilityState) {
        state.columnVisibility = { ...state.previousVisibilityState };
      } else {
        state.columnVisibility = { ...DEFAULT_COLUMN_VISIBILITY };
      }
      updateColumnVisibility();
      applyFiltersAndSort();
    } else {
      state.zenActive = true;
      zenModeBtn.classList.add('active');
      localStorage.setItem(STORAGE_KEYS.ZEN_MODE_ACTIVE, 'true');

      state.previousVisibilityState = { ...state.columnVisibility };

      if (filterPanel) filterPanel.classList.add('zen-hidden');

      state.columnVisibility.difficulty = false;
      state.columnVisibility.rating = false;
      state.columnVisibility.tags = false;
      state.columnVisibility.problemId = false;
      updateColumnVisibility();
      applyFiltersAndSort();
    }
  });
}

function updateThemeIcons(isDark: boolean): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.querySelector('.sun-icon')?.classList.toggle('hidden', isDark);
  btn.querySelector('.moon-icon')?.classList.toggle('hidden', !isDark);
  btn.querySelector('.dark-label')?.classList.toggle('hidden', isDark);
  btn.querySelector('.light-label')?.classList.toggle('hidden', !isDark);
}

function initThemeToggle(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  updateThemeIcons(document.documentElement.classList.contains('dark'));

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
  });
}

function initRatingFilter(): void {
  const ratingMin = document.getElementById('rating-min') as HTMLInputElement | null;
  const ratingMax = document.getElementById('rating-max') as HTMLInputElement | null;

  [ratingMin, ratingMax].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => applyFiltersAndSort());
      input.addEventListener('change', () => applyFiltersAndSort());
    }
  });
}

function initTagFilter(): void {
  const tagFilter = document.getElementById('tag-filter') as HTMLSelectElement | null;
  if (tagFilter) {
    tagFilter.addEventListener('change', () => applyFiltersAndSort());
  }
}

function initSortButtons(): void {
  const ascBtn = document.getElementById('sort-rating-asc');
  const descBtn = document.getElementById('sort-rating-desc');
  const resetBtn = document.getElementById('sort-reset');

  ascBtn?.addEventListener('click', () => {
    state.currentSort = 'asc';
    updateSortButtonStates();
    applyFiltersAndSort();
  });

  descBtn?.addEventListener('click', () => {
    state.currentSort = 'desc';
    updateSortButtonStates();
    applyFiltersAndSort();
  });

  resetBtn?.addEventListener('click', () => {
    state.currentSort = 'none';
    resetToOriginalOrder();
    applyFiltersAndSort();
  });
}

function initClearFilters(): void {
  const clearBtn = document.getElementById('clear-filters');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    const ratingMin = document.getElementById('rating-min') as HTMLInputElement | null;
    const ratingMax = document.getElementById('rating-max') as HTMLInputElement | null;
    if (ratingMin) ratingMin.value = '';
    if (ratingMax) ratingMax.value = '';

    const tagFilter = document.getElementById('tag-filter') as HTMLSelectElement | null;
    if (tagFilter) tagFilter.value = '';

    state.currentSort = 'none';
    resetToOriginalOrder();
    updateSortButtonStates();

    applyFiltersAndSort();
  });
}

export function initLadderPage(pageData: { ladderId: number }): void {
  ladderId = pageData.ladderId;

  const { solved, attempted } = loadProblemStatus();
  const solvedSet = new Set(solved);
  const attemptedSet = new Set(attempted);

  const problemRows = document.querySelectorAll<HTMLElement>('[data-problem-id]');
  const totalCount = problemRows.length;
  let solvedCount = 0;
  let attemptedCount = 0;

  state.originalRows = Array.from(problemRows);

  problemRows.forEach((row) => {
    const problemId = row.dataset.problemId;
    if (!problemId) return;

    if (solvedSet.has(problemId)) {
      markAsSolved(row);
      solvedCount++;
    } else if (attemptedSet.has(problemId)) {
      markAsAttempted(row);
      attemptedCount++;
    }
  });

  updateProgressUI(solvedCount, attemptedCount, totalCount);

  initFilterToggle();
  initColumnToggles();
  initZenMode();
  initThemeToggle();

  loadPageFilters();
  updateSortButtonStates();

  initRatingFilter();
  initTagFilter();
  initSortButtons();
  initClearFilters();

  applyFiltersAndSort();
}

document.addEventListener('DOMContentLoaded', () => {
  const dataEl = document.getElementById('page-data');
  if (!dataEl?.textContent) {
    console.error('Page data not found');
    return;
  }

  try {
    const pageData = JSON.parse(dataEl.textContent) as { ladderId: number };
    initLadderPage(pageData);
  } catch (e) {
    console.error('Failed to parse page data:', e);
  }
});

