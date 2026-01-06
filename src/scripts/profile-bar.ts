/**
 * profile-bar.ts - Shared profile bar logic for both home and ladder pages
 * Handles user tracking, syncing, avatar display, and theme toggle
 */

import { STORAGE_KEYS } from '../types';

// ============================================================================
// Types
// ============================================================================

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

interface CodeforcesUser {
  readonly handle: string;
  readonly avatar: string;
  readonly titlePhoto?: string;
}

interface CodeforcesUserResponse {
  readonly status: 'OK' | 'FAILED';
  readonly result?: readonly CodeforcesUser[];
  readonly comment?: string;
}

interface ProblemStatus {
  readonly solved: Set<string>;
  readonly attempted: Set<string>;
}

// ============================================================================
// Constants
// ============================================================================

const AUTO_REFRESH_THRESHOLD = 5 * 60 * 1000;
const DEFAULT_AVATAR = 'https://userpic.codeforces.org/no-avatar.jpg';

// ============================================================================
// API Functions
// ============================================================================

export async function fetchUserInfo(handle: string): Promise<string> {
  try {
    const response = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`
    );

    if (!response.ok) {
      return DEFAULT_AVATAR;
    }

    const data: CodeforcesUserResponse = await response.json();

    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
      return DEFAULT_AVATAR;
    }

    const user = data.result[0];
    let avatar = user.avatar || DEFAULT_AVATAR;
    if (avatar.includes('no-avatar')) {
      return DEFAULT_AVATAR;
    }
    // Fix the URL: Codeforces API returns URLs like "https://userpic.codeforces.org/..." 
    // but the actual working URL needs to be "https://codeforces.com/userpic.codeforces.org/..."
    if (avatar.startsWith('https://userpic.codeforces.org')) {
      avatar = avatar.replace('https://userpic.codeforces.org', 'https://codeforces.com/userpic.codeforces.org');
    } else if (avatar.startsWith('//userpic.codeforces.org')) {
      avatar = `https://codeforces.com${avatar.substring(1)}`;
    }
    return avatar;
  } catch {
    return DEFAULT_AVATAR;
  }
}

export async function fetchProblemStatus(handle: string): Promise<ProblemStatus> {
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

// ============================================================================
// Storage Functions
// ============================================================================

export function saveProblemStatus(handle: string, status: ProblemStatus, avatar?: string): void {
  localStorage.setItem('cf_handle', handle);
  localStorage.setItem('cf_solved', JSON.stringify([...status.solved]));
  localStorage.setItem('cf_attempted', JSON.stringify([...status.attempted]));
  localStorage.setItem('cf_last_updated', new Date().toISOString());
  if (avatar) {
    localStorage.setItem('cf_avatar', avatar);
  }
}

export function loadStoredHandle(): string | null {
  return localStorage.getItem('cf_handle');
}

export function loadStoredAvatar(): string | null {
  return localStorage.getItem('cf_avatar');
}

export function getLastUpdated(): Date | null {
  const timestamp = localStorage.getItem('cf_last_updated');
  return timestamp ? new Date(timestamp) : null;
}

// ============================================================================
// UI Helper Functions
// ============================================================================

export function formatTimeAgo(date: Date): string {
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

export function updateSyncTimeDisplay(): void {
  const lastSyncEl = document.getElementById('last-sync');
  const lastUpdated = getLastUpdated();

  if (lastSyncEl && lastUpdated) {
    lastSyncEl.textContent = formatTimeAgo(lastUpdated);
    lastSyncEl.title = `Last synced: ${lastUpdated.toLocaleString()}`;
  }
}

export function updateAvatarDisplay(): void {
  const avatarImg = document.getElementById('user-avatar') as HTMLImageElement | null;
  const avatarFallback = document.getElementById('user-avatar-fallback');
  const storedAvatar = loadStoredAvatar();

  if (avatarImg && storedAvatar && !storedAvatar.includes('no-avatar')) {
    avatarImg.classList.add('hidden');
    avatarFallback?.classList.remove('hidden');

    avatarImg.onerror = () => {
      avatarImg.classList.add('hidden');
      avatarFallback?.classList.remove('hidden');
    };
    
    avatarImg.onload = () => {
      avatarImg.classList.remove('hidden');
      avatarFallback?.classList.add('hidden');
    };
    
    avatarImg.src = storedAvatar;
    
    queueMicrotask(() => {
      if (avatarImg.complete && avatarImg.naturalWidth > 0) {
        avatarImg.classList.remove('hidden');
        avatarFallback?.classList.add('hidden');
      }
    });
  } else if (avatarImg) {
    avatarImg.classList.add('hidden');
    avatarFallback?.classList.remove('hidden');
  }
}

// ============================================================================
// State Management
// ============================================================================

function showLockedState(handle: string): void {
  const unlockedState = document.getElementById('unlocked-state');
  const lockedState = document.getElementById('locked-state');
  const lockedUsername = document.getElementById('locked-username');

  if (!unlockedState || !lockedState || !lockedUsername) return;

  lockedUsername.textContent = handle;

  unlockedState.classList.add('hiding');

  setTimeout(() => {
    unlockedState.classList.add('hidden');
    unlockedState.classList.remove('hiding');

    lockedState.classList.remove('hidden');
    void lockedState.offsetWidth;
    lockedState.classList.add('showing');
  }, 400);
}

function showUnlockedState(handle: string): void {
  const unlockedState = document.getElementById('unlocked-state');
  const lockedState = document.getElementById('locked-state');
  const input = document.getElementById('cf-handle-input') as HTMLInputElement | null;

  if (!unlockedState || !lockedState) return;

  lockedState.classList.remove('showing');

  setTimeout(() => {
    lockedState.classList.add('hidden');

    if (input) input.value = handle;
    unlockedState.classList.remove('hidden');
    void unlockedState.offsetWidth;

    if (input) {
      input.focus();
      input.select();
    }
  }, 400);
}

// ============================================================================
// Theme Toggle
// ============================================================================

function updateThemeIcons(isDark: boolean): void {
  const buttons = document.querySelectorAll('#theme-toggle, #theme-toggle-locked');
  buttons.forEach((btn) => {
    btn.querySelector('.sun-icon')?.classList.toggle('hidden', isDark);
    btn.querySelector('.moon-icon')?.classList.toggle('hidden', !isDark);
  });
}

export function initThemeToggle(): void {
  const themeButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-locked');
  if (themeButtons.length === 0) return;

  updateThemeIcons(document.documentElement.classList.contains('dark'));

  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
      updateThemeIcons(isDark);
    });
  });
}

// ============================================================================
// ZEN Mode
// ============================================================================

export function initZenMode(): void {
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

// ============================================================================
// Profile Bar Initialization
// ============================================================================

interface ProfileBarOptions {
  onSyncSuccess?: () => void;
  autoRefresh?: boolean;
  skipZenMode?: boolean; // Set to true if the page has its own ZEN mode initialization
}

export function initProfileBar(options: ProfileBarOptions = {}): void {
  const input = document.getElementById('cf-handle-input') as HTMLInputElement | null;
  const trackButton = document.getElementById('track-button') as HTMLButtonElement | null;
  const syncButton = document.getElementById('sync-button') as HTMLButtonElement | null;
  const editButton = document.getElementById('edit-handle-button') as HTMLButtonElement | null;

  // Initialize theme toggle
  initThemeToggle();
  
  // Initialize ZEN mode if button exists (unless page handles it separately)
  if (!options.skipZenMode) {
    initZenMode();
  }

  if (!input || !trackButton) return;

  const storedHandle = loadStoredHandle();
  if (storedHandle) {
    // User is already tracked - show locked state immediately
    const unlockedState = document.getElementById('unlocked-state');
    const lockedState = document.getElementById('locked-state');
    const lockedUsername = document.getElementById('locked-username');

    if (unlockedState && lockedState && lockedUsername) {
      lockedUsername.textContent = storedHandle;
      unlockedState.classList.add('hidden');
      lockedState.classList.remove('hidden');
      lockedState.classList.add('showing');
      updateAvatarDisplay();
    }

    input.value = storedHandle;
    updateSyncTimeDisplay();
  }

  // Update sync time every minute
  setInterval(updateSyncTimeDisplay, 60000);

  // Auto-refresh if needed
  if (options.autoRefresh !== false) {
    const lastUpdated = getLastUpdated();
    if (storedHandle && lastUpdated) {
      const timeSinceUpdate = Date.now() - lastUpdated.getTime();
      if (timeSinceUpdate > AUTO_REFRESH_THRESHOLD) {
        syncProgress(false, false);
      }
    }
  }

  async function syncProgress(showAlert: boolean, isNewTrack: boolean): Promise<boolean> {
    const handle = input?.value.trim() ?? '';

    if (!handle) {
      if (showAlert) alert('⚠️ Please enter a Codeforces handle');
      return false;
    }

    if (trackButton) trackButton.disabled = true;
    if (syncButton) syncButton.disabled = true;

    const originalButtonHTML = trackButton?.innerHTML ?? '';
    if (trackButton) {
      trackButton.innerHTML = '<span class="engineering-button-icon">⏳</span> Syncing...';
    }

    if (syncButton) {
      syncButton.classList.add('syncing');
    }

    try {
      const [problemStatus, avatar] = await Promise.all([
        fetchProblemStatus(handle),
        fetchUserInfo(handle),
      ]);
      saveProblemStatus(handle, problemStatus, avatar);

      if (trackButton) {
        trackButton.innerHTML = '<span class="engineering-button-icon">✓</span> Synced!';
      }
      updateSyncTimeDisplay();
      updateAvatarDisplay();

      if (isNewTrack) {
        setTimeout(() => {
          showLockedState(handle);
          setTimeout(() => {
            window.location.reload();
          }, 600);
        }, 500);
      } else {
        if (trackButton) {
          setTimeout(() => {
            trackButton.innerHTML = originalButtonHTML;
            trackButton.disabled = false;
          }, 1500);
        }
        if (syncButton) {
          setTimeout(() => {
            syncButton.disabled = false;
            syncButton.classList.remove('syncing');
          }, 1500);
        }
        options.onSyncSuccess?.();
      }

      return true;
    } catch (error) {
      console.error('Error fetching Codeforces data:', error);
      if (showAlert) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user data';
        alert(`❌ ${message}`);
      }
      if (trackButton) {
        trackButton.innerHTML = originalButtonHTML;
        trackButton.disabled = false;
      }
      if (syncButton) {
        syncButton.disabled = false;
        syncButton.classList.remove('syncing');
      }
      return false;
    }
  }

  // Track button click
  trackButton.addEventListener('click', () => {
    syncProgress(true, true);
  });

  // Enter key in input
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const storedHandle = loadStoredHandle();
      const isNewTrack = !storedHandle || storedHandle !== input.value.trim();
      syncProgress(true, isNewTrack);
    }
  });

  // Sync button click
  if (syncButton) {
    syncButton.addEventListener('click', () => {
      syncProgress(true, false);
    });
  }

  // Edit button click
  if (editButton) {
    editButton.addEventListener('click', () => {
      const currentHandle = loadStoredHandle() ?? '';
      showUnlockedState(currentHandle);
    });
  }

  // Auto-sync on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateSyncTimeDisplay();
    }
  });
}

