# 🎨 UI Component Gallery

A comprehensive showcase of all UI components and design patterns used in A2OJ Refreshed.

---

## 🎭 Color System

### Primary Colors

```css
/* Gradients */
--gradient-hero: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
--gradient-text: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
--gradient-progress: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);

/* Semantic Colors */
--success: #10b981 (emerald-600)
--error: #ef4444 (red-600)
--warning: #f59e0b (amber-600)
--info: #3b82f6 (blue-600)

/* Difficulty Colors */
--beginner: #10b981 (emerald)
--easy: #06b6d4 (cyan)
--medium: #8b5cf6 (purple)
--hard: #f97316 (orange)
--expert: #ec4899 (pink)
--master: #ef4444 (red)
```

### Background Colors

```css
/* Light Mode */
--bg-base: #f8fafc (slate-50)
--bg-card: #ffffff (white)
--bg-accent: #f1f5f9 (slate-100)

/* Dark Mode */
--bg-base-dark: #020617 (slate-950)
--bg-card-dark: #0f172a (slate-900)
--bg-accent-dark: #1e293b (slate-800)
```

---

## 📦 Component Library

### 1. Hero Section

**Location**: Homepage top

**Features**:
- Full-width gradient background (indigo → purple → pink)
- Large heading (text-5xl → text-7xl responsive)
- Subtitle with explanation
- Username input field
- CTA button ("Track Progress")

**Code Pattern**:
```astro
<div class="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
  <div class="max-w-7xl mx-auto px-4 py-20">
    <h1 class="text-7xl font-bold">A2OJ Refreshed</h1>
    <p class="text-2xl text-white/90">Structured practice ladders...</p>
    <input type="text" placeholder="Enter your Codeforces handle" />
    <button>Track Progress</button>
  </div>
</div>
```

---

### 2. Stats Cards

**Location**: Below hero, 3-column grid

**Features**:
- White card with shadow
- Large number (text-4xl, gradient color)
- Descriptive label (text-slate-600)
- Border (border-slate-200)

**Visual**:
```
┌─────────────────────┐
│                     │
│      2,200+         │ ← text-gradient
│  Curated Problems   │ ← text-slate-600
│                     │
└─────────────────────┘
```

**Code Pattern**:
```astro
<div class="bg-white rounded-xl shadow-xl p-6 border">
  <div class="text-4xl font-bold text-gradient">2,200+</div>
  <div class="text-slate-600">Curated Problems</div>
</div>
```

---

### 3. Ladder Card

**Location**: Homepage grid (3 columns)

**Features**:
- Card with hover effect (lift + shadow)
- Difficulty badge (colored pill)
- Problem count (large number)
- Description text
- Progress bar
- Clickable link overlay

**Visual**:
```
┌──────────────────────────────────┐
│ Rating < 1300           100      │
│ [Beginner]            problems   │
│                                  │
│ For beginners, unrated users...  │
│                                  │
│ ▓▓▓░░░░░░░░░░░░░░░░░░░  0%      │
└──────────────────────────────────┘
     ↑ hover: lifts up
```

**Code Pattern**:
```astro
<a href="/ladder/11" class="block card-hover">
  <div class="bg-white rounded-xl shadow-lg p-6 border">
    <h3 class="text-xl font-bold">Rating < 1300</h3>
    <span class="badge bg-emerald-100 text-emerald-700">Beginner</span>
    <div class="text-2xl font-bold text-indigo-600">100</div>
    <p class="text-slate-600">For beginners...</p>
    <div class="progress-bar">...</div>
  </div>
</a>
```

---

### 4. Progress Bar

**Location**: Ladder cards & progress section

**Features**:
- Full-width container (bg-slate-200)
- Gradient fill (indigo → purple)
- Percentage label
- Smooth width transition

**Visual**:
```
Progress: ▓▓▓▓▓▓▓░░░░░░░░░░ 35%
```

**Code Pattern**:
```astro
<div class="flex items-center">
  <div class="w-full bg-slate-200 rounded-full h-2">
    <div 
      class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
      style="width: 35%"
    />
  </div>
  <span class="ml-3 text-sm">35%</span>
</div>
```

---

### 5. Difficulty Badge

**Location**: Ladder cards, problem details

**Features**:
- Small rounded pill
- Color-coded background
- Bold text
- Inline display

**Variants**:
```
🟢 Beginner   (emerald)
🔵 Easy       (cyan)
🟣 Medium     (purple)
🟠 Hard       (orange)
🔴 Expert     (red)
```

**Code Pattern**:
```astro
<span class="inline-block px-3 py-1 text-xs font-semibold rounded-full
             bg-emerald-100 text-emerald-700">
  Beginner
</span>
```

---

### 6. Problem Table

**Location**: Ladder detail page

**Features**:
- Full-width table with borders
- Header row (bg-slate-100)
- Hover effect on rows (bg-slate-50)
- Columns:
  - # (serial number)
  - Problem (name + link + metadata)
  - Difficulty (star rating)
  - Tags (pill array)
  - Status (icon)

**Visual**:
```
┌────┬─────────────────────────┬────────────┬──────────────┬────────┐
│ #  │ PROBLEM                 │ DIFFICULTY │ TAGS         │ STATUS │
├────┼─────────────────────────┼────────────┼──────────────┼────────┤
│ 1  │ Young Physicist         │ ⭐☆☆☆☆     │ math impl... │   ✓    │
│    │ Contest 69 • Problem A  │            │              │        │
├────┼─────────────────────────┼────────────┼──────────────┼────────┤
│ 2  │ Beautiful Matrix        │ ⭐☆☆☆☆     │ impl         │   ✗    │
│    │ Contest 263 • Problem A │            │              │        │
└────┴─────────────────────────┴────────────┴──────────────┴────────┘
```

**Code Pattern**:
```astro
<table class="w-full">
  <thead class="bg-slate-100 border-b">
    <tr>
      <th class="px-6 py-4 text-left text-xs font-semibold uppercase">#</th>
      <th>Problem</th>
      <th>Difficulty</th>
      <th>Tags</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody class="divide-y">
    <tr class="hover:bg-slate-50">
      <td>1</td>
      <td>
        <a href="..." class="text-indigo-600 hover:text-indigo-800">
          Young Physicist
        </a>
        <div class="text-xs text-slate-500">Contest 69 • Problem A</div>
      </td>
      <td>⭐☆☆☆☆</td>
      <td>[Tags]</td>
      <td>✓</td>
    </tr>
  </tbody>
</table>
```

---

### 7. Star Rating

**Location**: Problem difficulty column

**Features**:
- 5 stars total
- Filled stars = difficulty level
- Color-coded (emerald/cyan/purple/orange)
- SVG icons

**Visual**:
```
Level 1: ⭐☆☆☆☆ (emerald)
Level 2: ⭐⭐☆☆☆ (cyan)
Level 3: ⭐⭐⭐☆☆ (purple)
Level 4: ⭐⭐⭐⭐☆ (orange)
Level 5: ⭐⭐⭐⭐⭐ (red)
```

**Code Pattern**:
```astro
<div class="flex items-center">
  {[...Array(5)].map((_, i) => (
    <svg class={i < difficulty ? 'text-emerald-600' : 'text-slate-300'}>
      <path d="M9.049 2.927c.3-.921..." />
    </svg>
  ))}
</div>
```

---

### 8. Tag Pills

**Location**: Problem table tags column

**Features**:
- Small rounded pills
- Light background (bg-slate-100)
- Truncated to 3 tags + counter
- Inline-flex layout

**Visual**:
```
[math] [implementation] [greedy] [+2]
```

**Code Pattern**:
```astro
<div class="flex flex-wrap gap-1">
  {tags.slice(0, 3).map(tag => (
    <span class="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
      {tag}
    </span>
  ))}
  {tags.length > 3 && (
    <span class="px-2 py-1 text-xs bg-slate-100 rounded">
      +{tags.length - 3}
    </span>
  )}
</div>
```

---

### 9. Status Icons

**Location**: Problem table status column

**Features**:
- Circular background (w-8 h-8)
- Centered icon
- Color-coded (green/gray)

**Variants**:
```
✓ Solved   (emerald background)
✗ Unsolved (slate background)
```

**Code Pattern**:
```astro
{/* Solved */}
<div class="inline-flex items-center justify-center 
            w-8 h-8 bg-emerald-100 rounded-full">
  <svg class="w-5 h-5 text-emerald-600">
    <path d="M5 13l4 4L19 7" />
  </svg>
</div>

{/* Unsolved */}
<div class="inline-flex items-center justify-center 
            w-8 h-8 bg-slate-100 rounded-full">
  <svg class="w-5 h-5 text-slate-400">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
</div>
```

---

### 10. Progress Dashboard

**Location**: Top of ladder detail page

**Features**:
- Large card with shadow
- Left side: Progress bar with label
- Right side: Completion badge
- Responsive flex layout

**Visual**:
```
┌───────────────────────────────────────────────────────┐
│ Your Progress                         5 / 20     25%  │
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        Complete │
└───────────────────────────────────────────────────────┘
```

**Code Pattern**:
```astro
<div class="bg-white rounded-xl shadow-xl p-6 border">
  <div class="flex justify-between items-center">
    <div class="flex-1">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-semibold">Your Progress</h2>
        <span class="text-2xl font-bold text-gradient">5 / 20</span>
      </div>
      <div class="progress-bar">...</div>
    </div>
    <div class="text-center px-6 py-2 bg-indigo-50 rounded-lg">
      <div class="text-2xl font-bold text-indigo-600">25%</div>
      <div class="text-xs text-slate-600">Complete</div>
    </div>
  </div>
</div>
```

---

### 11. Quick Stats Cards

**Location**: Bottom of ladder detail page (4 columns)

**Features**:
- Small cards in grid
- Large number (text-3xl)
- Descriptive label
- Color-coded by category

**Visual**:
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│   20    │ │    0    │ │    0    │ │   25%   │
│  Easy   │ │ Medium  │ │  Hard   │ │Complete │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

**Code Pattern**:
```astro
<div class="grid grid-cols-4 gap-4">
  <div class="bg-white rounded-lg shadow p-6 text-center">
    <div class="text-3xl font-bold text-emerald-600">20</div>
    <div class="text-sm text-slate-600">Easy Problems</div>
  </div>
  {/* ... more cards */}
</div>
```

---

### 12. Back Button

**Location**: Top of ladder detail page

**Features**:
- Arrow icon + text
- Hover effect (opacity)
- Link to homepage

**Visual**:
```
← Back to Ladders
```

**Code Pattern**:
```astro
<a href="/" class="inline-flex items-center text-white/80 hover:text-white">
  <svg class="w-5 h-5 mr-2">
    <path d="M15 19l-7-7 7-7" />
  </svg>
  Back to Ladders
</a>
```

---

## 🎨 Animation Catalog

### 1. Card Hover Effect

```css
.card-hover {
  transition: all 0.3s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### 2. Fade In (Hero)

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}
```

### 3. Button Scale

```css
button:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
```

### 4. Progress Bar Fill

```css
.progress-bar-fill {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5. Link External Icon

```css
.group:hover .external-icon {
  opacity: 1;
  transition: opacity 0.2s ease;
}
```

---

## 📐 Spacing Scale

**Tailwind's spacing scale (used throughout)**:

```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
6: 24px    ← Cards, grids
8: 32px
12: 48px
16: 64px   ← Sections
20: 80px   ← Hero
```

---

## 🔤 Typography Scale

```
text-xs:   12px (tags, labels)
text-sm:   14px (body, metadata)
text-base: 16px (default)
text-lg:   18px (subheadings)
text-xl:   20px (card titles)
text-2xl:  24px (stats)
text-4xl:  36px (section headings)
text-5xl:  48px (page titles)
text-7xl:  72px (hero)
```

---

## 📱 Responsive Breakpoints

```
sm:  640px  (tablet portrait)
md:  768px  (tablet landscape)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (ultra-wide)
```

**Grid patterns**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns (rating ladders) / 4 columns (division ladders)

---

## ♿ Accessibility Features

1. **Semantic HTML**
   - `<main>` for main content
   - `<section>` for content sections
   - `<table>` for data tables
   - `<nav>` for navigation

2. **ARIA Labels**
   - Descriptive button labels
   - Alt text for icons
   - Table headers with scope

3. **Keyboard Navigation**
   - Tab order follows visual order
   - Focus states on all interactive elements
   - Skip links (optional enhancement)

4. **Color Contrast**
   - All text meets WCAG AA (4.5:1)
   - Interactive elements have 3:1 contrast

5. **Screen Reader Support**
   - Status icons have text alternatives
   - Progress bars have aria-valuenow

---

## 🎯 Component Checklist

When building new components, ensure:

- ✅ Responsive (mobile → desktop)
- ✅ Dark mode compatible
- ✅ Hover states defined
- ✅ Accessible (ARIA, semantic HTML)
- ✅ Consistent spacing (Tailwind scale)
- ✅ Color from design system
- ✅ Typography from scale
- ✅ Animation subtle (< 500ms)
- ✅ No layout shift (fixed dimensions)

---

**Every pixel serves a purpose.** 🎨

