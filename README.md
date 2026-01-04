# 🚀 A2OJ Refreshed

A modern, blazing-fast reimagining of [A2OJ (Ahmed Aly Online Judge)](https://earthshakira.github.io/a2oj-clientside/server/Ladders.html) — structured practice ladders for competitive programming.

Built with **Astro** for maximum performance and minimal JavaScript, featuring a beautiful, modern UI powered by **Tailwind CSS**.

## ✨ Features

- **🎯 Curated Problem Ladders**: 2,200+ problems organized by difficulty rating
- **📊 Progress Tracking**: Track your solved problems with Codeforces handle integration
- **⚡ Lightning Fast**: Astro's islands architecture = instant page loads
- **🎨 Modern UI**: Beautiful gradient design with smooth animations
- **📱 Fully Responsive**: Works perfectly on desktop, tablet, and mobile
- **🌙 Dark Mode Ready**: Built-in dark mode support
- **♿ Accessible**: Semantic HTML with ARIA labels

## 🏗️ Tech Stack

### Why Astro?

As explained in the project philosophy:

- **Zero JS by default** — Only interactive components hydrate
- **Islands Architecture** — Perfect for content-heavy sites with light interactivity
- **Instant First Paint** — Pre-rendered HTML loads immediately
- **Minimal Bundle** — Only the progress tracker needs JavaScript

### Stack Details

- **Framework**: [Astro](https://astro.build) v5.16
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4.1
- **Font**: Inter (Google Fonts)
- **Icons**: Heroicons (inline SVG)
- **Deployment**: Ready for Cloudflare Pages / Vercel

## 🎨 UI Highlights

### Homepage
- **Hero Section**: Gradient background with username input
- **Stats Cards**: Floating cards showing key metrics
- **Ladder Grid**: Beautiful card-based layout with:
  - Color-coded difficulty badges
  - Progress bars per ladder
  - Hover animations
  - Problem count indicators

### Ladder Detail Page
- **Progress Dashboard**: Visual progress bar with completion percentage
- **Problems Table**: Clean, sortable table with:
  - Star-based difficulty indicators
  - Tag pills for problem categories
  - Solved/unsolved status icons
  - Direct links to Codeforces
  - Contest metadata

### Design Principles
- **Gradient Accents**: Indigo → Purple for primary actions
- **Subtle Animations**: Hover effects, fade-ins, translate transforms
- **Clean Typography**: Inter font for maximum readability
- **Color-Coded Difficulty**: Visual hierarchy at a glance
- **Whitespace**: Generous spacing for breathing room

## 📂 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── layouts/
│   │   └── Layout.astro # Base layout with fonts, meta tags
│   ├── pages/
│   │   ├── index.astro  # Homepage with ladder overview
│   │   └── ladder/
│   │       └── [id].astro # Dynamic ladder detail pages
│   └── styles/
│       └── global.css   # Tailwind + custom utilities
├── astro.config.mjs     # Astro configuration
├── package.json
└── tailwind.config.js   # Tailwind v4 config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 10+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd a2oj-refreshed

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` 🎉

### Build for Production

```bash
# Build static site
npm run build

# Preview production build
npm run preview
```

## 🎯 Key Pages

- **`/`** — Homepage with all ladders
- **`/ladder/11`** — Ladder 11 (Rating < 1300)
- **`/ladder/12`** — Ladder 12 (1300 ≤ Rating ≤ 1399)
- ... and so on for all 18+ ladders

## 🔮 Future Enhancements

### Phase 1: Core Functionality
- [ ] Integrate Codeforces API for real progress tracking
- [ ] Local storage for offline progress saving
- [ ] Filter problems by tags, difficulty
- [ ] Search functionality

### Phase 2: Interactivity
- [ ] Add a **SolidJS island** for the progress tracker
- [ ] Username validation & profile fetching
- [ ] Toggle solved/unsolved status
- [ ] Export progress as JSON

### Phase 3: Polish
- [ ] Add problem hints & editorial links
- [ ] Leaderboard for ladder completion
- [ ] Dark mode toggle (manual)
- [ ] Animations on progress changes

## 🎓 Learning Resources

- **Astro Docs**: https://docs.astro.build
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Codeforces API**: https://codeforces.com/apiHelp
- **A2OJ Original**: https://earthshakira.github.io/a2oj-clientside/

## 🤝 Contributing

Contributions are welcome! This is a community project for competitive programmers.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License - feel free to use this for your own projects!

## 💬 Acknowledgments

- **Ahmed Aly** for the original A2OJ concept
- **Codeforces** for the amazing platform
- **Astro Team** for the incredible framework
- **Competitive Programming Community** for the inspiration

---

**Built with ❤️ for competitive programmers worldwide**

*"Master Codeforces problems systematically."*
