# Over7Under Implementation Plan

Based on the `over7under-change-plan.md` design review, here is the technical implementation plan and the impact table detailing which files and components will be affected.

## 🛠️ Implementation Plan

### Phase 0: P0 — Broken (Fix before anything else)
#### 1. Fix the FAQ rendering bug
- **HTML (`index.html`):** Locate the FAQ section and remove any hardcoded markdown syntax (`**### ... +**`). Wrap each item in clean semantic tags (like `<details>` and `<summary>` or a custom accordion structure).
- **CSS (`style.css`):** Add styles for smooth expand/collapse transitions and clean up the visual appearance.
- **JS (`script.js`):** Remove any flawed markdown-parsing logic previously used for the FAQ. If using a custom accordion, ensure the toggle logic is bug-free.

### Phase 1: P1 — Core game UX (Decides whether players stay)
#### 2. Redesign the bet controls (The most critical functional change)
- **HTML:** Remove the generic "Bet" button and the dropdown/input that defaults to "None". Add predetermined chip amount buttons (e.g., `300`, `500`, `1K`, `Max`). Add three large prediction buttons: **Higher**, **Exactly 7**, and **Lower**.
- **CSS:** Ensure all new buttons are at least `48px` tall for mobile touch targets. Style the active/selected states for the chip buttons.
- **JS:** Refactor the betting logic. The user should select a chip amount (with a default pre-selected), and tapping "Higher", "Exactly 7", or "Lower" should instantly submit the bet in one gesture.

#### 3. Rename "Shop" → "Refill credits" and drop fiat pricing
- **HTML/JS:** Find all references to "Shop" and change them to "Refill credits". Completely remove "NRP 1000.00" (or similar pricing) and replace it with "+1,000 credits". Ensure no currency symbols appear in the modal or button text.

#### 4. Add a persistent "Free play" badge
- **HTML:** Add a small badge container (`<div class="free-play-badge">Free play • No real money</div>`) directly next to or above the betting controls.
- **CSS:** Style the badge to be glanceable but unobtrusive, ensuring it stays visible without scrolling on both desktop and mobile layouts.

### Phase 2: P2 — Messaging and content (Polish)
#### 5. Rewrite the hero
- **HTML:** Update the `<title>` tag in the `<head>` to keep the SEO juice: `Play Over7Under Online Free - Fun Browser Game`. Change the actual `<h1>` on the page to something human and punchy, like `Over7Under: Predict the Dice`.

#### 6. Collapse the article and unify vocabulary
- **HTML/CSS:** Cut down the "how-to" section to 3 simple steps. Put the rules, probability details, and FAQ inside expander/accordion elements. 
- **Copywriting:** Do a sweep of the entire page (buttons, rules, text) and ensure we are using **one** vocabulary uniformly (e.g., sticking strictly to "Over/Under" or "Higher/Lower").

#### 7. Replace the probability wall with a visual
- **HTML/CSS:** Above the current 36-combination table, create a new container for a visual bar chart showing the bell curve of dice sums (2 through 12).
- **JS/HTML:** Generate the chart via a small JS snippet or pure CSS flexbox heights. Wrap the old, detailed 36-combination table in an expander labeled "View exact probabilities".

---

## 📊 Impact Table (What will be affected the most)

| Change Item | Affected Files | Key Components Affected | Risk / Complexity |
| :--- | :--- | :--- | :--- |
| **1. FAQ Rendering Bug** | `index.html`, `style.css`, `script.js` | FAQ accordion DOM structure, event listeners | Low |
| **2. Bet Controls Redesign** | `index.html`, `style.css`, `script.js` | **Bet form UI, core game loop logic, bet validation** | **High (Affects core mechanics)** |
| **3. Rename "Shop"** | `index.html`, `script.js` | Shop Modal UI, Text contents | Low |
| **4. "Free play" Badge** | `index.html`, `style.css` | Game UI layout / flexbox positioning | Low |
| **5. Rewrite Hero H1** | `index.html` | `<head><title>`, `<h1>` tags | Low |
| **6. Content & Vocabulary** | `index.html` | Page body text, Rules section | Medium (Lots of text changes) |
| **7. Probability Visual** | `index.html`, `style.css` | Probability section DOM, new CSS chart classes | Medium |

### Summary of File Impact:
* **`index.html`** will be affected the most structurally, as almost every step requires altering the DOM (adding buttons, changing text, adding expanders, and adding the chart).
* **`script.js`** will experience the most crucial functional changes, specifically completely refactoring the core bet-placement logic from a "select amount -> click bet" flow to a "1-tap prediction" flow.
* **`style.css`** will be heavily affected by UI additions: styling the new 48px touch targets, the probability bar chart, and the expander components.
