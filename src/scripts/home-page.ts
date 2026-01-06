/**
 * home-page.ts - Home page specific logic
 * Uses shared profile-bar module for common functionality
 */

import { initProfileBar } from './profile-bar';

interface PageData {
  readonly ladderProblems: Record<string, readonly string[]>;
}

function updateLadderProgress(ladderProblems: Record<string, readonly string[]>): void {
  const solvedStr = localStorage.getItem('cf_solved');
  if (!solvedStr) return;

  let solvedProblems: string[];
  try {
    solvedProblems = JSON.parse(solvedStr) as string[];
  } catch {
    return;
  }

  const solvedSet = new Set(solvedProblems);

  const ladderCards = document.querySelectorAll<HTMLElement>('[data-ladder-id]');
  for (const card of ladderCards) {
    const ladderId = card.dataset.ladderId;
    if (!ladderId || !ladderProblems[ladderId]) continue;

    const problems = ladderProblems[ladderId];
    const totalCount = problems.length;
    let solvedCount = 0;

    for (const problemId of problems) {
      if (solvedSet.has(problemId)) {
        solvedCount++;
      }
    }

    const percent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

    const progressFill = card.querySelector<HTMLElement>('.ladder-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    const percentText = card.querySelector('.ladder-progress-percent');
    if (percentText) {
      percentText.textContent = `${percent}%`;
    }
  }
}

export function initHomePage(pageData: PageData): void {
  // Update ladder progress initially
  updateLadderProgress(pageData.ladderProblems);
  
  // Initialize profile bar with callback to update ladder progress on sync
  initProfileBar({
    onSyncSuccess: () => updateLadderProgress(pageData.ladderProblems),
    autoRefresh: true,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const dataEl = document.getElementById('page-data');
  if (!dataEl?.textContent) {
    console.error('Page data not found');
    return;
  }

  try {
    const pageData = JSON.parse(dataEl.textContent) as PageData;
    initHomePage(pageData);
  } catch (e) {
    console.error('Failed to parse page data:', e);
  }
});
