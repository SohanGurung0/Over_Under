# Over7Under — Game Overview

**URL:** https://over7under.sohangrg.me/  
**Type:** Free single-page browser game (HTML5 / WebGL)  
**Author:** SohanGurung  
**Platform:** Desktop, Tablet, Mobile — no download required

---

## What Is Over7Under?

Over7Under (also known as *Over 7 Under*, *Lucky 7*, or *High-Low Dice*) is a classic two-dice prediction game. Players predict whether the sum of two rolled standard six-sided dice will be:

- **Higher** than 7 (sum of 8–12)
- **Lower** than 7 (sum of 2–6)
- **Exactly 7**

The game is a free, casual browser simulation using virtual credits. There is no real-money gambling, no registration, and no download.

---

## How to Play

1. **Start** — Launch the game from the home screen. Every session begins with **1,000 virtual credits**.
2. **Set Your Bet** — Enter a bet amount (minimum 300 credits).
3. **Choose Your Prediction** — Click **Guess Higher**, **Guess Lower**, or **Guess Exactly 7**.
4. **Confirm & Roll** — Confirm in the modal dialog to trigger the 3D physics dice roll.
5. **See the Result** — The two dice animate realistically on a felt table; the sum is auto-calculated and the outcome is announced with visual feedback (confetti, toast messages, vignette).
6. **Continue or Recharge** — Keep playing to grow your streak. If credits run low, use the in-game **Shop** to recharge for free at any time.

---

## Payout Rules

| Prediction  | Dice Result       | Outcome               | Example (300 bet) |
|-------------|-------------------|-----------------------|-------------------|
| Higher      | 8 – 12            | **Win — 2× payout**   | Returns 600       |
| Higher      | 7                 | **Push — stake back** | Returns 300       |
| Higher      | 2 – 6             | Loss                  | Returns 0         |
| Lower       | 2 – 6             | **Win — 2× payout**   | Returns 600       |
| Lower       | 7                 | **Push — stake back** | Returns 300       |
| Lower       | 8 – 12            | Loss                  | Returns 0         |
| Exactly 7   | 7                 | **Win — 4× payout**   | Returns 1,200     |
| Exactly 7   | Any other number  | Loss                  | Returns 0         |

### The 7 Push Rule

When the dice total lands on exactly 7 and the player predicted Higher or Lower, the wagered bet is **returned in full** (a "Push"). This eliminates any house edge on 7 for those bets and makes gameplay notably fair.

---

## Probability Breakdown

Two standard dice produce 36 equally likely outcomes (sums 2–12):

| Sum | Ways to Roll | Probability  | Category    |
|-----|-------------|--------------|-------------|
| 2   | 1           | 2.78%        | Under 7     |
| 3   | 2           | 5.56%        | Under 7     |
| 4   | 3           | 8.33%        | Under 7     |
| 5   | 4           | 11.11%       | Under 7     |
| 6   | 5           | 13.89%       | Under 7     |
| **7** | **6**     | **16.67%**   | **Pivot**   |
| 8   | 5           | 13.89%       | Over 7      |
| 9   | 4           | 11.11%       | Over 7      |
| 10  | 3           | 8.33%        | Over 7      |
| 11  | 2           | 5.56%        | Over 7      |
| 12  | 1           | 2.78%        | Over 7      |

- **Under 7:** 15/36 ≈ 41.67%
- **Exactly 7:** 6/36 ≈ 16.67%
- **Over 7:** 15/36 ≈ 41.67%

When playing Higher or Lower, a 7 is a Push (stake returned), so the player avoids a loss on **58.34%** of all rolls (41.67% win + 16.67% push).

---

## Fairness & Randomness

Dice faces are determined by JavaScript's `crypto.getRandomValues()` API — a cryptographically secure pseudo-random number generator (CSPRNG). This ensures unbiased, unpredictable results for every roll.

---

## Key Features

- **3D WebGL Dice Physics** — Powered by Three.js; dice tumble and settle on a realistic felt table.
- **Roll History Tracker** — A live strip below the table displays recent roll outcomes.
- **Win/Loss/Push Feedback** — Toast notifications, confetti particles, and a red-screen vignette on losses.
- **Streak & Stats HUD** — Tracks current streak, best streak, and total rolls across a session.
- **Sound Toggle** — Toggle sound effects on/off at any time.
- **Free Shop Recharge** — Players can top up their virtual credit balance infinitely at zero cost.
- **No Login Required** — Game state persists in-session only; no accounts or cookies needed.
- **Fully Responsive** — Adapts from 360 px mobile to full desktop viewports; touch-friendly controls.

---

## Technical Stack

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES Modules)
- **3D Rendering:** Three.js (v0.155) via CDN
- **Fonts:** Google Fonts — Inter, Fraunces
- **Hosting:** Cloudflare Pages (wrangler.jsonc config present)
- **SEO:** JSON-LD structured data (WebSite, WebApplication/VideoGame, FAQPage schemas), Open Graph, Twitter Card, sitemap.xml, robots.txt

---

## Sections on the Main Page

| Section ID         | Title                          |
|--------------------|--------------------------------|
| `#heroSection`     | Hero / Landing                 |
| `#gameArea`        | Interactive 3D Game Arena      |
| `#aboutSection`    | About Over7Under               |
| `#howToPlaySection`| How To Play                    |
| `#rulesSection`    | Game Rules & Payout Table      |
| `#tipsSection`     | Odds, Probability & Tips       |
| `#faqSection`      | Frequently Asked Questions     |

---

## Frequently Asked Questions (Summary)

- **Is it free?** Yes — 100% free with unlimited credit recharges.
- **Do I need to download anything?** No — runs in any modern browser.
- **Is it mobile-friendly?** Yes — fully responsive from 360 px upward.
- **Is it skill or luck?** Primarily luck/probability; skill lies in bankroll management.
- **Are rolls provably fair?** Yes — uses `crypto.getRandomValues()` for unbiased randomness.
- **What is the Push rule?** A roll of 7 on a Higher/Lower bet returns the stake instead of losing it.

---

*Last updated: September 2026*
