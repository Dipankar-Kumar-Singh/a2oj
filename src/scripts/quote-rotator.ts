import type { Quote } from '../types';

const ROTATION_INTERVAL_MS = 30000;
const STORAGE_KEY = 'quote_rotation_state';

interface RotationState {
  readonly index: number;
  readonly lastUpdate: number;
}

export class QuoteRotator {
  private quotes: readonly Quote[] = [];
  private currentIndex: number = 0;
  private rotationInterval: number | null = null;

  constructor() {
    this.loadQuotes();
    this.loadState();
    this.displayCurrentQuote();
    this.startRotation();
  }

  private loadQuotes(): void {
    const quotesData = document.getElementById('quotes-data');
    if (quotesData?.textContent) {
      try {
        this.quotes = JSON.parse(quotesData.textContent) as Quote[];
      } catch (e) {
        console.error('Failed to parse quotes data:', e);
      }
    }
  }

  private loadState(): void {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState && this.quotes.length > 0) {
      try {
        const state = JSON.parse(savedState) as RotationState;
        this.currentIndex = ((state.index || 0) + 1) % this.quotes.length;
      } catch {
        this.currentIndex = 0;
      }
    } else {
      this.currentIndex = 0;
    }
  }

  private saveState(): void {
    const state: RotationState = {
      index: this.currentIndex,
      lastUpdate: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private displayCurrentQuote(): void {
    if (this.quotes.length === 0) return;

    const quote = this.quotes[this.currentIndex];
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSourceLink = document.getElementById('quote-source-link') as HTMLAnchorElement | null;
    const container = document.getElementById('quote-container');

    if (quoteText && quoteAuthor && quoteSourceLink && container) {
      container.classList.add('quote-fade-out');

      setTimeout(() => {
        quoteText.textContent = `"${quote.quote}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
        quoteSourceLink.href = quote.source_url;
        quoteSourceLink.title = quote.context;

        container.classList.remove('quote-fade-out');
        container.classList.add('quote-fade-in');

        setTimeout(() => {
          container.classList.remove('quote-fade-in');
        }, 500);
      }, 300);
    }

    this.saveState();
  }

  private nextQuote(): void {
    if (this.quotes.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
    this.displayCurrentQuote();
  }

  private startRotation(): void {
    this.rotationInterval = window.setInterval(() => {
      this.nextQuote();
    }, ROTATION_INTERVAL_MS);
  }

  public stop(): void {
    if (this.rotationInterval !== null) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new QuoteRotator();
});

