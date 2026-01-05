import { STORAGE_KEYS } from '../types';

interface CodeforcesSubmission {
  readonly problem: {
    readonly contestId: number;
    readonly index: string;
  };
  readonly verdict?: string;
}

interface CodeforcesResponse {
  readonly status: 'OK' | 'FAILED';
  readonly result?: readonly CodeforcesSubmission[];
  readonly comment?: string;
}

interface ProblemStatus {
  readonly solved: Set<string>;
  readonly attempted: Set<string>;
}

interface PageData {
  readonly ladderProblems: Record<string, readonly string[]>;
}

const AUTO_REFRESH_THRESHOLD = 5 * 60 * 1000;

async function fetchProblemStatus(handle: string): Promise<ProblemStatus> {
  const response = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch data from Codeforces');
  }

  const data: CodeforcesResponse = await response.json();

  if (data.status !== 'OK' || !data.result) {
    throw new Error(data.comment ?? 'User not found');
  }

  const solvedSet = new Set<string>();
  const attemptedSet = new Set<string>();

  for (const sub of data.result) {
    const problemId = `${sub.problem.contestId}${sub.problem.index}`;
    if (sub.verdict === 'OK') {
      solvedSet.add(problemId);
    } else if (sub.verdict !== undefined) {
      attemptedSet.add(problemId);
    }
  }

  for (const id of solvedSet) {
    attemptedSet.delete(id);
  }

  return { solved: solvedSet, attempted: attemptedSet };
}

function saveProblemStatus(handle: string, status: ProblemStatus): void {
  localStorage.setItem('cf_handle', handle);
  localStorage.setItem('cf_solved', JSON.stringify([...status.solved]));
  localStorage.setItem('cf_attempted', JSON.stringify([...status.attempted]));
  localStorage.setItem('cf_last_updated', new Date().toISOString());
}

function loadStoredHandle(): string | null {
  return localStorage.getItem('cf_handle');
}

function getLastUpdated(): Date | null {
  const timestamp = localStorage.getItem('cf_last_updated');
  return timestamp ? new Date(timestamp) : null;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function updateSyncTimeDisplay(): void {
  const lastSyncEl = document.getElementById('last-sync');
  const lastUpdated = getLastUpdated();

  if (lastSyncEl && lastUpdated) {
    lastSyncEl.textContent = formatTimeAgo(lastUpdated);
    lastSyncEl.title = `Last synced: ${lastUpdated.toLocaleString()}`;
  }
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

function initZenMode(): void {
  const zenModeBtn = document.getElementById('zen-mode-btn');
  if (!zenModeBtn) return;

  const zenActive = localStorage.getItem(STORAGE_KEYS.ZEN_MODE_ACTIVE) === 'true';
  if (zenActive) {
    zenModeBtn.classList.add('active');
  }

  zenModeBtn.addEventListener('click', () => {
    const isActive = zenModeBtn.classList.toggle('active');
    localStorage.setItem(STORAGE_KEYS.ZEN_MODE_ACTIVE, isActive ? 'true' : 'false');
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
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

  updateThemeIcons(document.documentElement.classList.contains('dark'));

  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
  });
}

function initSync(ladderProblems: Record<string, readonly string[]>): void {
  const input = document.getElementById('cf-handle-input') as HTMLInputElement | null;
  const button = document.getElementById('track-button') as HTMLButtonElement | null;
  const syncStatus = document.getElementById('sync-status') as HTMLDivElement | null;
  const syncButton = document.getElementById('sync-button') as HTMLButtonElement | null;

  if (!input || !button) return;

  updateLadderProgress(ladderProblems);

  const storedHandle = loadStoredHandle();
  if (storedHandle) {
    input.value = storedHandle;

    if (syncStatus) {
      syncStatus.classList.remove('hidden');
      syncStatus.classList.add('flex');
      updateSyncTimeDisplay();
    }
  }

  setInterval(updateSyncTimeDisplay, 60000);

  async function syncProgress(showAlert: boolean): Promise<boolean> {
    const handle = input.value.trim();

    if (!handle) {
      if (showAlert) alert('⚠️ Please enter a Codeforces handle');
      return false;
    }

    button.disabled = true;
    if (syncButton) syncButton.disabled = true;

    const originalButtonHTML = button.innerHTML;
    button.innerHTML = '<span class="engineering-button-icon">⏳</span> Syncing...';

    if (syncButton) {
      syncButton.classList.add('syncing');
    }

    try {
      const problemStatus = await fetchProblemStatus(handle);
      saveProblemStatus(handle, problemStatus);

      button.innerHTML = '<span class="engineering-button-icon">✓</span> Synced!';
      updateSyncTimeDisplay();

      if (syncStatus?.classList.contains('hidden')) {
        syncStatus.classList.remove('hidden');
        syncStatus.classList.add('flex');
      }

      setTimeout(() => {
        window.location.reload();
      }, 800);

      return true;
    } catch (error) {
      console.error('Error fetching Codeforces data:', error);
      if (showAlert) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user data';
        alert(`❌ ${message}`);
      }
      button.innerHTML = originalButtonHTML;
      button.disabled = false;
      if (syncButton) {
        syncButton.disabled = false;
        syncButton.classList.remove('syncing');
      }
      return false;
    }
  }

  button.addEventListener('click', () => syncProgress(true));
  syncButton?.addEventListener('click', () => syncProgress(true));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      syncProgress(true);
    }
  });

  let lastVisibleTime = Date.now();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const timeAway = Date.now() - lastVisibleTime;
      const currentHandle = loadStoredHandle();

      if (timeAway >= AUTO_REFRESH_THRESHOLD && currentHandle) {
        console.log(`Away for ${Math.round(timeAway / 60000)} minutes, auto-syncing...`);
        syncProgress(false);
      }
    } else {
      lastVisibleTime = Date.now();
    }
  });
}

export function initHomePage(pageData: PageData): void {
  initZenMode();
  initThemeToggle();
  initSync(pageData.ladderProblems);
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

