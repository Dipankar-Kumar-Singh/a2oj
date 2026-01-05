export type RatingLevelId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

export interface RatingLevel {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly color: string;
  readonly textClass: string;
}

export interface RatingLevelWithId extends RatingLevel {
  readonly level: number;
}

export type RatingLevelsMap = Record<RatingLevelId, RatingLevel>;

export type LadderType = 'rating' | 'division' | 'extra';
export type LadderDifficultyLevel = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ProblemDifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type DivisionName = 'Division 1' | 'Division 2';
export type ProblemTypeLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface LadderOverride {
  readonly displayName: string;
  readonly difficultyLabel?: string;
  readonly division?: DivisionName;
  readonly problemType?: ProblemTypeLetter;
  readonly isExtra?: boolean;
}

export type LadderOverridesMap = Record<string, LadderOverride>;

export interface LaddersMetadata {
  readonly ratingLevels: RatingLevelsMap;
  readonly ladderOverrides: LadderOverridesMap;
}

export interface LadderIndexEntry {
  readonly id: number;
  readonly name: string;
  readonly problemCount: number;
}

export interface LaddersIndex {
  readonly rating: readonly LadderIndexEntry[];
  readonly division: readonly LadderIndexEntry[];
  readonly extra: readonly LadderIndexEntry[];
}

export interface LadderProblem {
  readonly position: number;
  readonly name: string;
  readonly contestId: number;
  readonly problemId: string;
  readonly difficulty: ProblemDifficultyLevel;
  readonly rating?: number;
  readonly tags?: readonly string[];
}

export interface LadderData {
  readonly id: number;
  readonly name: string;
  readonly type: LadderType;
  readonly description: string;
  readonly difficultyLevel: LadderDifficultyLevel;
  readonly problemCount: number;
  readonly problems: readonly LadderProblem[];
}

export interface ProcessedLadder {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly difficulty: LadderDifficultyLevel;
  readonly difficultyLabel: string;
  readonly type: LadderType;
  readonly division: DivisionName | null;
  readonly problemType: ProblemTypeLetter | null;
  readonly isExtra: boolean;
}

export interface DisplayProblem {
  readonly id: number;
  readonly name: string;
  readonly contestId: number;
  readonly problemId: string;
  readonly difficulty: ProblemDifficultyLevel;
  readonly rating: number | null;
  readonly tags: readonly string[];
}

export interface Quote {
  readonly quote: string;
  readonly author: string;
  readonly context: string;
  readonly source_url: string;
}

export interface UserHandle {
  readonly handle: string;
  readonly lastSynced: string | null;
}

export type SolvedProblemsSet = Set<string>;
export type SolvedProblemsArray = readonly string[];

export interface ColumnVisibility {
  readonly difficulty: boolean;
  readonly rating: boolean;
  readonly tags: boolean;
  readonly problemId: boolean;
}

export interface PageFilters {
  readonly minRating: number | null;
  readonly maxRating: number | null;
  readonly selectedTags: string[];
  readonly tagMatchMode: 'any' | 'all';
  readonly sortOrder: 'none' | 'asc' | 'desc';
}

export interface GlobalSettings {
  readonly hideSolved: boolean;
  readonly zenMode: boolean;
  readonly theme: 'light' | 'dark';
  readonly columnVisibility: ColumnVisibility;
}

export interface AnalyticsRange {
  readonly label: string;
  readonly count: number;
  readonly textClass: string;
}

export const STORAGE_KEYS = {
  USER_HANDLE: 'a2oj_user_handle',
  SOLVED_PROBLEMS: 'a2oj_solved_problems',
  LAST_SYNCED: 'a2oj_last_synced',
  GLOBAL_COLUMN_VISIBILITY: 'global_column_visibility',
  GLOBAL_HIDE_SOLVED: 'global_hide_solved',
  ZEN_MODE_ACTIVE: 'zen_mode_active',
  THEME: 'theme',
  PAGE_FILTERS_PREFIX: 'ladder_',
  PAGE_FILTERS_SUFFIX: '_filters',
} as const;

export function getPageFiltersKey(ladderId: number): string {
  return `${STORAGE_KEYS.PAGE_FILTERS_PREFIX}${ladderId}${STORAGE_KEYS.PAGE_FILTERS_SUFFIX}`;
}

export function isRatingLevelId(value: string): value is RatingLevelId {
  return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(value);
}

export function isLadderType(value: string): value is LadderType {
  return value === 'rating' || value === 'division' || value === 'extra';
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  difficulty: true,
  rating: true,
  tags: true,
  problemId: true,
} as const;

export const DEFAULT_PAGE_FILTERS: PageFilters = {
  minRating: null,
  maxRating: null,
  selectedTags: [],
  tagMatchMode: 'all',
  sortOrder: 'none',
} as const;

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  hideSolved: false,
  zenMode: false,
  theme: 'light',
  columnVisibility: DEFAULT_COLUMN_VISIBILITY,
} as const;

