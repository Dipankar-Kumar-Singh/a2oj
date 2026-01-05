import type {
  RatingLevel,
  RatingLevelWithId,
  RatingLevelsMap,
  LadderOverride,
  LaddersMetadata,
  LaddersIndex,
  LadderData,
  ProcessedLadder,
  DisplayProblem,
  AnalyticsRange,
  LadderType,
} from '../types';

import laddersMetadataJson from '../data/ladders/metadata.json';
import laddersIndexJson from '../data/ladders/index.json';

export const laddersMetadata: LaddersMetadata = laddersMetadataJson as LaddersMetadata;
export const laddersIndex: LaddersIndex = laddersIndexJson as LaddersIndex;

export function getRatingLevelsSorted(): readonly RatingLevelWithId[] {
  const levels = laddersMetadata.ratingLevels;
  return Object.entries(levels)
    .map(([levelStr, data]) => ({
      level: parseInt(levelStr, 10),
      ...data,
    }))
    .sort((a, b) => a.level - b.level);
}

export function getRatingLevel(level: number): RatingLevel {
  const levelStr = String(level);
  const levels = laddersMetadata.ratingLevels as RatingLevelsMap;
  return levels[levelStr as keyof RatingLevelsMap] ?? levels['1'];
}

export function getRatingLevelByRating(rating: number): RatingLevelWithId {
  const sortedLevels = getRatingLevelsSorted();
  for (const level of sortedLevels) {
    if (rating >= level.min && rating <= level.max) {
      return level;
    }
  }
  return sortedLevels[0];
}

export function getLadderOverride(ladderId: number): LadderOverride | undefined {
  return laddersMetadata.ladderOverrides[String(ladderId)];
}

export function processLadder(ladderData: LadderData): ProcessedLadder {
  const override = getLadderOverride(ladderData.id);
  const difficultyLevel = ladderData.difficultyLevel || 1;
  const ratingLevel = getRatingLevel(difficultyLevel);

  return {
    id: ladderData.id,
    name: override?.displayName ?? ladderData.name,
    description: ladderData.description,
    difficulty: difficultyLevel,
    difficultyLabel: override?.difficultyLabel ?? ratingLevel.name,
    type: ladderData.type,
    division: override?.division ?? null,
    problemType: override?.problemType ?? null,
    isExtra: override?.isExtra ?? false,
  };
}

export function processProblems(ladderData: LadderData): readonly DisplayProblem[] {
  return ladderData.problems.map((p) => ({
    id: p.position,
    name: p.name,
    contestId: p.contestId,
    problemId: p.problemId,
    difficulty: p.difficulty,
    rating: p.rating ?? null,
    tags: p.tags ?? [],
  }));
}

export function getAllTags(problems: readonly DisplayProblem[]): readonly string[] {
  const tagSet = new Set<string>();
  for (const problem of problems) {
    for (const tag of problem.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}

export function getRatingRange(problems: readonly DisplayProblem[]): { min: number; max: number } {
  const ratings = problems
    .map((p) => p.rating)
    .filter((r): r is number => r !== null);

  if (ratings.length === 0) {
    return { min: 800, max: 3500 };
  }

  return {
    min: Math.min(...ratings),
    max: Math.max(...ratings),
  };
}

export function formatLadderNumber(ladderId: number, type: LadderType): string {
  if (type === 'rating') {
    const index = laddersIndex.rating.findIndex((l) => l.id === ladderId);
    return index >= 0 ? String(index + 1).padStart(2, '0') : String(ladderId);
  }

  if (type === 'division') {
    const override = getLadderOverride(ladderId);
    if (override?.division) {
      return override.division.toUpperCase().replace('DIVISION ', 'DIV.');
    }
    return String(ladderId);
  }

  if (type === 'extra') {
    const index = laddersIndex.extra.findIndex((l) => l.id === ladderId);
    return `EX-${index >= 0 ? String(index + 1).padStart(2, '0') : ladderId}`;
  }

  return String(ladderId);
}

export function calculateAnalyticsRanges(problems: readonly DisplayProblem[]): readonly AnalyticsRange[] {
  const levels = getRatingLevelsSorted();

  // Count problems per rating level
  const counts = levels.map((lvl, idx) => ({
    ...lvl,
    idx,
    count: problems.filter((p) => {
      const r = p.rating ?? 0;
      return r >= lvl.min && r <= lvl.max;
    }).length,
  }));

  let peakIdx = 0;
  let peakCount = 0;
  counts.forEach((c, idx) => {
    if (c.count > peakCount) {
      peakCount = c.count;
      peakIdx = idx;
    }
  });

  const windowStart = Math.max(0, peakIdx - 1);
  const displayRanges: AnalyticsRange[] = [];

  if (windowStart > 0) {
    displayRanges.push({
      label: `≤ ${levels[windowStart].name}`,
      count: problems.filter((p) => (p.rating ?? 0) <= levels[windowStart].max).length,
      textClass: levels[windowStart].textClass,
    });
  } else {
    displayRanges.push({
      label: levels[0].name,
      count: counts[0].count,
      textClass: levels[0].textClass,
    });
  }

  const c2Idx = windowStart > 0 ? windowStart + 1 : 1;
  if (c2Idx < levels.length) {
    displayRanges.push({
      label: levels[c2Idx].name,
      count: counts[c2Idx].count,
      textClass: levels[c2Idx].textClass,
    });
  }

  const c3Idx = c2Idx + 1;
  if (c3Idx < levels.length) {
    displayRanges.push({
      label: levels[c3Idx].name,
      count: counts[c3Idx].count,
      textClass: levels[c3Idx].textClass,
    });
  }

  const c4StartIdx = c3Idx + 1;
  if (c4StartIdx < levels.length) {
    displayRanges.push({
      label: `≥ ${levels[c4StartIdx].name}`,
      count: problems.filter((p) => (p.rating ?? 0) >= levels[c4StartIdx].min).length,
      textClass: levels[c4StartIdx].textClass,
    });
  } else if (c3Idx < levels.length) {
    const lastIdx = levels.length - 1;
    displayRanges.push({
      label: `≥ ${levels[lastIdx].name}`,
      count: problems.filter((p) => (p.rating ?? 0) >= levels[lastIdx].min).length,
      textClass: levels[lastIdx].textClass,
    });
  }

  while (displayRanges.length < 4) {
    displayRanges.push({ label: 'N/A', count: 0, textClass: 'text-gray-500' });
  }

  return displayRanges.slice(0, 4);
}

export function getProblemUrl(contestId: number, problemId: string): string {
  return `https://codeforces.com/problemset/problem/${contestId}/${problemId}`;
}

export function getProblemKey(contestId: number, problemId: string): string {
  return `${contestId}-${problemId}`;
}

export function isProblemSolved(
  contestId: number,
  problemId: string,
  solvedSet: Set<string>
): boolean {
  return solvedSet.has(getProblemKey(contestId, problemId));
}

