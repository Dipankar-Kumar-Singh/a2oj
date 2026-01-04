# ⚙️ Global Settings Feature

## ✅ **Implemented:**

### **Floating Settings Panel**

A beautiful settings button that floats in the bottom-right corner of every page with two toggle options:

1. **Hide Tags** (Default: ON)
   - Hides problem tags to avoid spoilers
   - Tags reveal the algorithm/technique needed
   - Preserves the "thinking challenge"

2. **Hide Difficulty** (Default: OFF)
   - Hides the star-based difficulty rating
   - Lets you solve problems blind
   - Maximum challenge mode

---

## 🎨 **UI Design**

### **Settings Button**
- ⚙️ Gear icon
- Fixed position: bottom-right corner
- White background with shadow
- Hover effect
- Always accessible

### **Settings Menu** (Opens on click)
- Clean white card
- "Display Settings" heading
- Two toggle switches:
  - **Teal toggle** when ON
  - **Gray toggle** when OFF
- Auto-save message at bottom

### **Toggle Style**
```
[Label]                    [○——]  OFF
[Label]                    [——○]  ON (Teal)
```

---

## 🔧 **Technical Implementation**

### **Global State Management**
```javascript
class SettingsManager {
  - hideTags: boolean (default: true)
  - hideDifficulty: boolean (default: false)
  - Loads from localStorage
  - Saves automatically on change
  - Applies CSS classes to body
}
```

### **LocalStorage Keys**
```
hideTags: "true" | "false"
hideDifficulty: "true" | "false"
```

### **CSS Classes Applied to <body>**
```css
body.hide-tags .problem-tags {
  opacity: 0;
  pointer-events: none;
  user-select: none;
}

body.hide-tags .problem-tags::after {
  content: '[ Hidden ]';
  opacity: 0.4;
}

body.hide-difficulty .problem-difficulty {
  opacity: 0;
  pointer-events: none;
  user-select: none;
}

body.hide-difficulty .problem-difficulty::after {
  content: '[ Hidden ]';
  opacity: 0.4;
}
```

---

## 📍 **Where It Appears**

- ✅ Homepage (`/`)
- ✅ All Ladder pages (`/ladder/11`, `/ladder/12`, etc.)
- ✅ Global — works everywhere

---

## 💾 **Persistence**

### **Saved Across:**
- ✅ Page reloads
- ✅ Different ladders
- ✅ Browser sessions
- ✅ Tab closes/reopens

### **Stored In:**
- Browser's `localStorage`
- Never expires
- Per-domain basis

---

## 🎯 **User Flow**

1. **User opens ladder page**
   - Tags are hidden by default (hidden setting = true)
   - Difficulty stars are visible (default)

2. **User clicks settings button** (⚙️)
   - Settings menu slides open

3. **User toggles "Hide Tags"**
   - Tags instantly fade out/in
   - Setting saved to localStorage
   - "[Hidden]" placeholder shows

4. **User toggles "Hide Difficulty"**
   - Star ratings fade out/in
   - Setting saved automatically
   - "[Hidden]" placeholder shows

5. **User closes menu** (click outside)
   - Settings persist across pages
   - No manual save needed

---

## 🎓 **Why This Matters**

### **Problem: Tags Spoil the Fun**
When you see tags like:
- `graph matchings` → You know it's a graph problem
- `dynamic programming` → You know the technique
- `brute force` → You know the approach

**This removes 50% of the challenge!**

### **Solution: Hide by Default**
- Let users figure out the approach themselves
- True competitive programming practice
- Option to reveal if stuck

### **Problem: Difficulty Can Bias**
Seeing ⭐⭐⭐⭐⭐ makes you think:
- "This is too hard for me"
- Psychological barrier
- Self-fulfilling prophecy

### **Solution: Optional Hiding**
- Approach problems blind
- Judge difficulty yourself
- Build confidence

---

## 🔮 **Settings Features**

### **1. Default Values**
- **Tags**: Hidden (true)
  - Most users don't want spoilers
  - Forces critical thinking
- **Difficulty**: Shown (false)
  - Helpful for ladder progression
  - Can hide for extra challenge

### **2. Instant Apply**
- No "Save" button needed
- Changes apply immediately
- Smooth fade transitions

### **3. Visual Feedback**
- Toggle animates smoothly
- Hidden elements show "[Hidden]" placeholder
- Clear on/off states (teal = on)

### **4. Global Scope**
- One setting affects all pages
- Not per-ladder basis
- Consistent experience

---

## 💡 **Design Decisions**

### **Why Bottom-Right Corner?**
- Out of the way
- Standard position for settings
- Doesn't interfere with content
- Easy to find

### **Why Auto-Save?**
- Modern UX pattern
- Less friction
- Can't forget to save
- Instant gratification

### **Why Default Hide Tags?**
- Most valuable setting
- Protects the experience
- Users can always reveal
- Better safe than sorry

### **Why Show Difficulty by Default?**
- Helps with ladder selection
- Less aggressive than hiding everything
- Users can hide if they want extreme mode

---

## 📊 **Behavior Summary**

| Setting | Default | When ON | When OFF |
|---------|---------|---------|----------|
| **Hide Tags** | ✅ ON | Tags show "[Hidden]" | Tags visible |
| **Hide Difficulty** | ❌ OFF | Stars show "[Hidden]" | Stars visible |

---

## 🚀 **Future Enhancements**

Could add (but keeping it lean for now):
- ❌ Hide problem names (extreme mode)
- ❌ Dark mode toggle
- ❌ Font size adjustment
- ❌ Compact/comfortable view
- ❌ Hide solved problems

**But we won't** — staying lean! Only essential settings.

---

## ✅ **Result**

**A clean, floating settings system that:**
- Preserves the challenge of problem-solving
- Remembers user preferences
- Works globally across all pages
- Has beautiful teal/amber design
- Auto-saves everything
- Zero friction

**Tags hidden by default = Maximum critical thinking preserved!** 🎯🧠

---

## 🎨 **Visual Design**

### **Colors**
- Toggle ON: Teal (#14b8a6)
- Toggle OFF: Gray (#cbd5e1)
- Button: White with shadow
- Menu: White card with border

### **Animations**
- Settings menu: Slide + fade
- Toggles: Smooth slide (300ms)
- Hidden elements: Fade (200ms)

### **Typography**
- Heading: Bold, 18px
- Labels: Medium, 14px
- Note: Italic, 12px, gray

---

**Perfect for competitive programmers who want to preserve the challenge while having control over their experience!** ⚙️✨

