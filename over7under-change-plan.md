# Over7Under — Design Change Plan

Site: https://over7under.sohangrg.me/
Source: design review, 1 Oct 2026
Status: planned — not yet implemented

Ordered by impact. Fix top-down: P0 is broken and ships first, P1 decides whether players stay, P2 is polish.

---

## P0 — Broken (fix before anything else)

### 1. Fix the FAQ rendering bug
- **Change:** The FAQ accordion is leaking raw markdown onto the page (visible text like `**### What is Over7Under? +**`). Render each item as a clean question with a working expand/collapse.
- **Why:** A visible rendering bug kills credibility instantly. Broken always outranks ugly — no polish matters until this is gone.
- **Done when:** No markdown syntax is visible anywhere in the FAQ; every item expands and collapses cleanly on desktop and mobile.

---

## P1 — Core game UX (decides whether players stay)

### 2. Redesign the bet controls
- **Change:** Replace the cryptic "None" amount selector + generic "Bet" button with three big tappable choice buttons: **Higher / Exactly 7 / Lower**. Bet amount becomes preset chips (300 / 500 / 1K / Max).
- **Why:** The prediction decision and the action should be one gesture. Every extra step between intent and action bleeds players, especially on mobile. "None" as a bet amount means nothing to a first-time visitor.
- **Done when:** One tap places the bet; buttons are ≥ 48px touch targets; the word "None" appears nowhere in the flow.

### 3. Rename "Shop" → "Refill credits" and drop fiat pricing
- **Change:** "Shop - Recharge Cash" showing "NRP 1000.00" becomes "Refill credits" showing "+1,000 credits". Never render fiat currency formatting on free virtual goods.
- **Why:** On a page that insists "100% free, no real money," a Shop with a Rupee price triggers a single fatal thought: "wait, will I be charged?" In anything dice-adjacent, one moment of financial doubt destroys trust permanently.
- **Done when:** No "Shop", "NRP", or currency-price wording remains on any free-credit action.

### 4. Add a persistent "Free play" badge next to the game
- **Change:** A glanceable badge beside the betting controls: "Free play • No real money."
- **Why:** Reassurance only works at the moment of doubt — when the finger hovers over a bet button — not three scrolls down in body copy where it currently lives.
- **Done when:** The badge is visible alongside the game on desktop and mobile without scrolling.

---

## P2 — Messaging and content (polish)

### 5. Rewrite the hero
- **Change:** H1 "Play Over7Under Online Free - Fun Browser Game" → a short human headline (3–6 words a person would actually say, e.g. "Over7Under" plus one punchy line). Move the keyword phrasing into the meta title tag.
- **Why:** The current H1 is a title tag in disguise — written for crawlers, not for the humans who decide within 10 seconds whether this is fun and safe.
- **Done when:** The H1 reads like human speech; the meta title keeps the SEO keywords.

### 6. Collapse the article and unify vocabulary
- **Change:** Game first, then a 3-step how-to (not 5 — this game is learned in five seconds), then rules / probability / FAQ inside expanders. Cut the copy by roughly half. Pick ONE vocabulary — "Over/Under" vs "Higher/Lower" — and use it everywhere: buttons, rules, tables.
- **Why:** Mixed terminology makes a 5-second game feel complicated, and the page currently reads as written for Google rather than players. ~80% of the page is SEO content; it should live quietly underneath.
- **Done when:** One consistent term set site-wide; long sections collapsed; how-to is 3 steps max.

### 7. Replace the probability wall with a visual
- **Change:** A small bar chart of the 2–12 dice-sum distribution up front; keep the full 36-combination table in an expander underneath for the detail-minded.
- **Why:** Nobody scrolls a table to *feel* odds — the shape of the distribution communicates in 2 seconds what the table does in 2 minutes. Keep the table for trust; lead with the picture.
- **Done when:** The chart renders all 11 sums with correct probabilities; the full table remains accessible via expander.

---

## Deliberately keeping

- The published probability math and the `crypto.getRandomValues()` fairness note — rare, strong trust signals.
- The free-play positioning and the FAQ/rules SEO foundation (repaired and collapsed, not removed).
