# A2OJ Refreshed

A modern reimagining of [A2OJ Ladders](https://earthshakira.github.io/a2oj-clientside/server/Ladders.html) — structured practice ladders for competitive programming.

Built with **Astro** + **Tailwind CSS**.

## Features

- **2,200+ Problems** organized by difficulty rating (11 rating-based + 7 division-based + 11 extra ladders)
- **Codeforces Integration** — Track your progress automatically by syncing with your handle
- **Zen Mode** — Hide distractions and focus on solving problems
- **Dark/Light Mode** — Easy on the eyes
- **Multi-tag Filtering** — Filter problems by tags with "Any of" or "All of" modes
- **Offline Progress** — Data saved to localStorage

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:4321`

## Deploy to Cloudflare Pages

### Via Dashboard (Recommended)

1. Push to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages
3. Connect your repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
5. Deploy!

### Via CLI

```bash
npx wrangler pages deploy dist --project-name=a2oj-refreshed
```

## Tech Stack

- [Astro](https://astro.build) v5.16 — Static site generation
- [Tailwind CSS](https://tailwindcss.com) v4.1 — Styling
- [Codeforces API](https://codeforces.com/apiHelp) — Progress tracking

## Credits

- **Ahmed Aly** — Original A2OJ concept
- **Codeforces** — Problem data and API

---

**Built for competitive programmers worldwide** ⚡
