# Cozy Coffee Shop — Game Design Document

**Version:** 1.0
**Date:** 2026-07-10
**Status:** Approved — Ready for Implementation

---

## Table of Contents

1. [Game Pitch & Target Audience](#1-game-pitch--target-audience)
2. [Tech Stack & Project Structure](#2-tech-stack--project-structure)
3. [Core Gameplay Loop & Day Cycle](#3-core-gameplay-loop--day-cycle)
4. [Coffee-Making Minigames](#4-coffee-making-minigames)
5. [Customer System](#5-customer-system)
6. [Cat Employee System](#6-cat-employee-system)
7. [Recipe & Ingredient Systems](#7-recipe--ingredient-systems)
8. [Decoration System](#8-decoration-system)
9. [Economy, Reputation, & Progression](#9-economy-reputation--progression)
10. [Daily Specials, Weather, & Seasons](#10-daily-specials-weather--seasons)
11. [Town Map & Meta Progression](#11-town-map--meta-progression)
12. [Social Features & Idle Progression](#12-social-features--idle-progression)
13. [Monetization](#13-monetization)
14. [Audio Direction](#14-audio-direction)
15. [First 30 Minutes & First 7 Days](#15-first-30-minutes--first-7-days)
16. [MVP Feature List & Development Roadmap](#16-mvp-feature-list--development-roadmap)
17. [Save Data Schema](#17-save-data-schema)
18. [Risks & Post-Launch Features](#18-risks--post-launch-features)

---

## 1. Game Pitch & Target Audience

### Game Pitch

**Cozy Coffee Shop** is a browser-based café management game where you run a neighborhood coffee shop, craft drinks through satisfying minigames, collect cat employees, decorate your space, and build relationships with a cast of memorable regulars. Grow from a humble cart into a beloved local landmark — one cup at a time.

### Target Audience

- **Primary:** Adults 18–35 who enjoy cozy games (Stardew Valley, Animal Crossing, Coffee Talk, A Little to the Left)
- **Secondary:** Casual mobile browser players looking for a relaxing 5–15 minute session
- **Tertiary:** Cat lovers and coffee enthusiasts who enjoy collection and decoration mechanics

### Tone & Feel

- Warm, low-stakes, cozy — no fail states, only quality gradients
- Satisfying micro-interactions (the "juice" of pulling a perfect espresso shot)
- A café that feels alive — cats napping, customers chatting, rain on the windows
- Progression that rewards curiosity, not grind

### Platform Priorities

1. Desktop browsers (primary)
2. Mobile browsers (responsive)
3. Installable PWA (optional, post-MVP)

---

## 2. Tech Stack & Project Structure

### Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Build tool | **Vite** | Fast HMR, excellent TS support, ESM-native |
| Language | **TypeScript** | Type safety for game state, recipes, save data |
| UI framework | **React 18** | Menus, HUD, dialogs, inventory, shop UI |
| Canvas rendering | **PixiJS 8** | Café scene, minigames, particle effects, animations |
| State management | **Zustand** | Lightweight, works across React and PixiJS layers |
| Local storage | **IndexedDB** via `idb` | Reliable large-object storage for save data |
| Styling | **CSS Modules** | Scoped styles, no runtime cost |
| Audio | **Howler.js** | Cross-browser audio with sprite support |
| PWA (later) | **Workbox** | Service worker for offline support |

### Project Structure

```
cozy-coffee-shop/
├── public/
│   ├── assets/
│   │   ├── sprites/          # Placeholder + final sprites
│   │   ├── audio/            # Sound effects + music
│   │   └── fonts/
│   └── manifest.json
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component, screen routing
│   │
│   ├── game/                 # PixiJS game layer
│   │   ├── Game.ts           # PixiJS Application setup
│   │   ├── scenes/
│   │   │   ├── CafeScene.ts  # Main café rendering
│   │   │   └── MinigameScene.ts  # Minigame overlay
│   │   ├── entities/
│   │   │   ├── Customer.ts   # Customer sprite + behavior
│   │   │   ├── Cat.ts        # Cat sprite + behavior
│   │   │   ├── Drink.ts      # Drink rendering
│   │   │   └── Decoration.ts # Placed furniture/items
│   │   ├── systems/
│   │   │   ├── CustomerSpawner.ts
│   │   │   ├── CatBehavior.ts
│   │   │   ├── DayCycle.ts
│   │   │   └── WeatherSystem.ts
│   │   ├── minigames/
│   │   │   ├── EspressoMinigame.ts
│   │   │   ├── MilkSteamMinigame.ts
│   │   │   ├── LatteArtMinigame.ts
│   │   │   ├── GrindMinigame.ts
│   │   │   └── ColdDrinkMinigame.ts
│   │   └── utils/
│   │       ├── easing.ts
│   │       ├── particles.ts
│   │       └── input.ts
│   │
│   ├── ui/                   # React UI layer
│   │   ├── screens/
│   │   │   ├── TitleScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   ├── DecorationScreen.tsx
│   │   │   ├── RecipeBook.tsx
│   │   │   ├── ShopScreen.tsx
│   │   │   ├── CatCollection.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── DaySummary.tsx
│   │   ├── components/
│   │   │   ├── HUD.tsx           # Coins, rep, time, day
│   │   │   ├── OrderBubble.tsx   # Customer order display
│   │   │   ├── DialogueBox.tsx   # Customer conversations
│   │   │   ├── DailySpecial.tsx  # Special selection UI
│   │   │   ├── MinigameUI.tsx    # Minigame HUD overlay
│   │   │   └── DecorationGrid.tsx
│   │   └── hooks/
│   │       ├── useGameStore.ts
│   │       └── useAudio.ts
│   │
│   ├── data/                 # Game data (pure TS objects)
│   │   ├── recipes.ts
│   │   ├── customers.ts
│   │   ├── cats.ts
│   │   ├── decorations.ts
│   │   ├── ingredients.ts
│   │   ├── suppliers.ts
│   │   └── seasons.ts
│   │
│   ├── store/                # Zustand stores
│   │   ├── gameStore.ts      # Master game state
│   │   ├── cafeStore.ts      # Café layout, decorations
│   │   ├── inventoryStore.ts # Ingredients, supplies
│   │   └── progressionStore.ts # Recipes, reputation, unlocks
│   │
│   ├── systems/              # Pure logic (no rendering)
│   │   ├── saveSystem.ts     # IndexedDB save/load
│   │   ├── economy.ts        # Coins, pricing, tips
│   │   ├── reputation.ts     # Reputation calculation
│   │   ├── recipeEngine.ts   # Recipe matching, quality
│   │   ├── progression.ts    # Unlock logic
│   │   └── dailySpecial.ts   # Special selection logic
│   │
│   └── types/                # TypeScript type definitions
│       ├── customer.ts
│       ├── cat.ts
│       ├── recipe.ts
│       ├── decoration.ts
│       ├── ingredient.ts
│       └── gameState.ts
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Key Architectural Decisions

- **Data-driven:** All recipes, customers, cats, decorations are defined as pure TS data objects in `src/data/`. Adding content = adding data, not code.
- **Separation of concerns:** Game logic (`systems/`) is decoupled from rendering (`game/`) and UI (`ui/`). This means minigame logic can be tested without PixiJS.
- **Single source of truth:** Zustand stores are the canonical game state. Both React components and PixiJS scenes read from and write to the same stores.
- **Save system:** Serializes Zustand stores to IndexedDB. Auto-save at end of each day. Manual save available.

---

## 3. Core Gameplay Loop & Day Cycle

### Core Loop (Per Session)

```
1. Open café → 2. Customers arrive → 3. Take order
4. Prepare drink (minigame) → 5. Serve customer
6. Earn coins / tips / rep / ingredients
7. Spend between customers:
   • Decorate café
   • Check recipe book
   • Visit shop for ingredients
   • Pet cats / check cat collection
   • Read customer dialogue
8. Day ends → 9. Day summary screen
10. New day begins with daily special choice
```

### Day Cycle Timing

- **Real-time:** 1 minute = 1 in-game hour
- **Full day:** 12 minutes (6 AM → 6 PM café hours)
- **Time speed:** 1x only (no fast-forward in MVP)
- **Pause:** Player can pause during decoration, recipe book, or shop screens
- **Between customers:** Real-time clock continues, but customers only arrive during business hours

### Day Phases

| Phase | Time | Behavior |
|-------|------|----------|
| **Opening** | 6:00 AM | Café fades in, cats wake up, player chooses daily special |
| **Morning Rush** | 7:00–10:00 AM | Highest customer frequency, breakfast drink demand |
| **Midday** | 10:00 AM–2:00 PM | Steady flow, more variety, lunch pastries |
| **Afternoon** | 2:00–5:00 PM | Slower pace, more specialty drinks, creative customers |
| **Closing** | 5:00–6:00 PM | Last customers, cleanup, day summary |

### Customer Arrival Flow

1. Customer walks in from the door (animated sprite)
2. Looks around briefly (0.5s)
3. Walks to an available table or counter seat
4. Order bubble appears with their drink request
5. Player taps the order to accept
6. Minigame begins
7. On completion, drink appears at customer's table
8. Customer drinks, reacts (happy/neutral/slightly disappointed)
9. Customer leaves coins + potential tip on table
10. Cat or player collects payment

### Between-Customer Actions

While waiting for the next customer, the player can:

- **Decorate:** Open decoration mode, place/move/remove items
- **Recipe Book:** Review discovered recipes, see customer favorites
- **Shop:** Buy ingredients from available suppliers
- **Cats:** Tap cats to pet them, check their mood
- **Town Map:** Visit town locations (unlocked at higher reputation)
- **Settings:** Audio, save, etc.

### Pause Behavior

The day clock pauses when:

- Decoration mode is open
- Recipe book is open
- Shop screen is open
- Town map is open
- Settings are open
- Any minigame is active

### Day End Summary

At 6:00 PM, the café closes. A summary screen shows:

- **Customers served:** X
- **Revenue:** X coins
- **Tips earned:** X coins
- **Reputation gained:** +X
- **Best drink served:** (name + quality)
- **Cat happiness:** Average mood
- **Recipes discovered:** Any new ones
- **Customer stories:** Any triggered dialogue
- **Next day preview:** Weather, potential specials

---

## 4. Coffee-Making Minigames

### Design Principles

- **Duration:** 3–8 seconds each
- **Input:** Single tap/click or drag
- **Feedback:** Immediate visual + audio
- **Scoring:** 4 quality tiers (Weak → Good → Perfect → Perfect + Art Bonus)
- **Forgiveness:** "Good" is easy to hit, "Perfect" requires attention but not precision
- **Learnability:** No tutorial needed — visual cues guide the player

### Minigame 1: Espresso Extraction

**Concept:** Stop a moving indicator inside a target zone.

**Mechanic:**
- A vertical gauge fills from bottom to top (like a thermometer)
- A green "perfect zone" sits near the top (~15% of gauge height)
- A wider "good zone" surrounds it (~40% of gauge)
- Player taps to stop the fill
- The indicator stops and the gauge locks

**Visual:**
- Gauge styled as an espresso shot glass
- Fill color transitions from dark brown → golden crema
- Steam particles rise when extraction completes
- Perfect zone has a subtle golden glow

**Scoring:**
| Result | Zone Hit | Effect |
|--------|----------|--------|
| Weak | Below good zone | -20% drink value, customer slightly disappointed |
| Good | Good zone | Standard drink value |
| Perfect | Perfect zone | +30% drink value, +reputation, customer delighted |
| Burnt | Above perfect zone | -30% drink value, customer unhappy |

**Audio:** Rising espresso machine hum, satisfying "clink" on stop, steam hiss on perfect

### Minigame 2: Milk Steaming

**Concept:** Hold and release to control temperature and foam level on a dual-axis display.

**Mechanic:**
- A circular gauge with two moving indicators:
  - **Temperature** (vertical axis): rises while holding, cools while releasing
  - **Foam** (horizontal axis): increases while holding at high temp, decreases while holding at low temp
- A target zone appears based on the drink order:
  - **Latte:** High temp, low foam
  - **Cappuccino:** High temp, high foam
  - **Flat white:** Medium temp, very low foam
- Player holds to steam, releases to cool, aims for the target zone
- Timer: 5 seconds of active control

**Visual:**
- Milk pitcher with rising steam
- Bubbles appear as foam increases
- Target zone shown as a faint outline on the gauge
- Color shifts from cold blue → warm white → hot golden

**Scoring:** Distance from target zone center determines quality.

**Audio:** Milk steaming hiss (pitch rises with temp), bubble sounds with foam

### Minigame 3: Latte Art (Single-Path Tracing)

**Concept:** Trace a glowing path with your finger/mouse to create latte art.

**Mechanic:**
- A pattern outline appears on the latte surface (glowing dots along the path)
- Player traces from start to finish by holding and dragging
- A trailing ink/pour effect follows the cursor
- The path has 10–15 checkpoints
- Score = (checkpoints hit within tolerance) / total checkpoints

**Patterns (unlocked progressively):**
1. **Heart** — Day 1 (tutorial)
2. **Leaf** — Reputation level 2
3. **Tulip** — Reputation level 3
4. **Cat face** — Achieve 10 perfect latte arts (matches milestone)
5. **Star** — Reputation level 5

**Visual:**
- Latte surface with subtle ripple effect
- Glowing dot trail for the path
- Milk pour animation follows the cursor
- Completed art fades into the drink with a bloom effect
- Perfect art gets a sparkle particle burst

**Scoring:**
| Accuracy | Result | Bonus |
|----------|--------|-------|
| 90–100% | Perfect Art | +50% tip, +reputation, customer takes photo |
| 70–89% | Good Art | +20% tip |
| 50–69% | Basic Art | Standard |
| <50% | Messy | No art bonus, but drink still served |

**Audio:** Gentle liquid pouring sound, soft chime on each checkpoint hit, sparkle on perfect

### Minigame 4: Grinding

**Concept:** Stop a scrolling marker at the correct grind size.

**Mechanic:**
- A horizontal bar shows grind sizes from Fine → Medium → Coarse
- A marker scrolls back and forth (like a pendulum)
- Each recipe specifies a target zone:
  - Espresso = Fine
  - French Press = Coarse
  - Pour Over = Medium
- Player taps to stop the marker

**Visual:**
- Coffee beans scattered along the bar
- Target zone highlighted with the recipe's color
- Ground coffee particles spray on stop

**Scoring:** Same tiers as espresso extraction.

**Audio:** Grinder whirring, crunch on stop, satisfying "poof" on perfect

### Minigame 5: Cold Drinks

**Concept:** Add ingredients in the correct order by tapping them in sequence.

**Mechanic:**
- A glass sits in the center
- 3–5 ingredient buttons appear around it (varies by recipe)
- Player taps ingredients in the correct order
- Each correct tap adds the ingredient with an animation
- Each incorrect tap shows a red X and resets that step
- Time limit: 8 seconds

**Visual:**
- Glass fills with each ingredient (layers visible for layered drinks)
- Ice cubes drop with a splash
- Syrups swirl into the drink
- Toppings settle on top

**Scoring:**
- All correct, no errors: Perfect
- 1 error: Good
- 2+ errors: Weak

**Audio:** Ice clinking, liquid pouring, splash effects, soft buzzer on error

### Minigame 6: Tea Brewing

**Concept:** Steep tea for the correct amount of time.

**Mechanic:**
- A timer bar fills from left to right
- A target zone marks the ideal steep time
- Player taps to remove the tea bag at the right moment
- Too early = weak tea, too late = bitter tea
- Timer: 4 seconds total

**Visual:**
- Cup with water that changes color as tea steeps (clear → light → deep → dark)
- Steam rises with increasing intensity
- Tea bag bobs in the water
- Target zone glows green when timer is in range

**Scoring:** Same tiers as espresso extraction (Weak/Good/Perfect/Burnt equivalent).

**Audio:** Gentle bubbling, tea bag plop, steeping sound that deepens

### Minigame Selection Logic

The game automatically selects which minigame to use based on the drink recipe:

| Drink Type | Minigame |
|------------|----------|
| Espresso, Americano | Espresso Extraction |
| Latte, Cappuccino, Flat White | Espresso + Milk Steaming |
| Latte with art | Espresso + Milk + Latte Art |
| Mocha, Macchiato | Espresso + Milk Steaming + (small Cold Drink for mocha) |
| Cold Brew, Iced Latte | Espresso + Cold Drink assembly |
| Hot Chocolate | Milk Steaming + Cold Drink (warm) |
| Green Tea, Earl Grey | Tea Brewing |
| Chai Latte | Tea Brewing + Milk Steaming |

Simple drinks = 1 minigame. Complex drinks = 2–3 minigames chained. The player always knows which minigames are coming via the order preview.

---

## 5. Customer System

### Customer Architecture

Each customer is defined by a data object with the following properties:

```typescript
interface Customer {
  id: string;
  name: string;
  title: string;           // "College Student", "Programmer", etc.
  personality: string;     // Brief flavor text
  
  // Visual
  sprite: string;          // Sprite sheet reference
  color: string;           // Accent color for UI elements
  
  // Behavior
  favoriteDrinks: string[];
  dislikedDrinks: string[];
  preferredSeating: "counter" | "table" | "window" | "outdoor";
  patienceBase: number;    // Seconds before unhappiness
  visitFrequency: number;  // 0-1, how often they appear
  preferredTimes: string[]; // "morning" | "afternoon" | "evening"
  
  // Progression
  loyaltyLevel: number;    // 0-5, increases with good service
  storyline: StoryEvent[]; // Dialogue triggers at loyalty thresholds
  
  // Unlock conditions
  unlockReputation: number; // Minimum reputation to appear
  unlocked: boolean;
}
```

### MVP Customers (5 recurring + 2 occasional)

**1. Mei — The College Student**
- **Schedule:** Mornings (7–10 AM), weekdays
- **Favorite drinks:** Iced Americano, Cold Brew
- **Personality:** Friendly, always studying, a bit scattered
- **Patience:** High (she's focused on her book)
- **Loyalty rewards:**
  - Level 2: Unlocks "Study Session" event (extra customers who are students)
  - Level 3: Gives you a "Vintage Bookshelf" decoration
  - Level 5: Becomes a regular who brings friends
- **Storyline:** Struggling with finals → discovers the café as her study spot → graduates → considers working at the café

**2. Derek — The Programmer**
- **Schedule:** Afternoons (2–5 PM), any day
- **Favorite drinks:** Double Espresso, Black Coffee
- **Personality:** Quiet, focused, occasionally stares into space
- **Patience:** Medium (distracted by laptop)
- **Loyalty rewards:**
  - Level 2: Unlocks "Fast Wi-Fi" upgrade (attracts more tech customers)
  - Level 3: Gives you a "Mechanical Keyboard" decoration
  - Level 5: Offers to build you a website (social feature unlock)
- **Storyline:** Works remotely → becomes a fixture → eventually launches a startup from the café

**3. Rose — The Elderly Regular**
- **Schedule:** Mornings (8–11 AM), daily
- **Favorite drinks:** Cappuccino, Earl Grey Tea
- **Personality:** Warm, talkative, remembers everyone's name
- **Patience:** Very high (she's in no rush)
- **Loyalty rewards:**
  - Level 2: Shares a secret recipe ("Grandma's Hot Chocolate")
  - Level 3: Gives you a "Vintage Clock" decoration
  - Level 5: Brings her granddaughter (new customer unlock)
- **Storyline:** Lost her husband, found community in the café → becomes the heart of the neighborhood

**4. Kai — The Artist**
- **Schedule:** Afternoons (1–4 PM), weekends primarily
- **Favorite drinks:** Matcha Latte, Latte with art
- **Personality:** Creative, expressive, gives feedback on latte art
- **Patience:** Low (impatient but appreciates beauty)
- **Loyalty rewards:**
  - Level 2: Unlocks "Art Gallery" wall decoration set
  - Level 3: Paints a portrait of your café (wall decoration)
  - Level 5: Hosts an art show (seasonal event unlock)
- **Storyline:** Struggling artist → finds inspiration in the café → first gallery show → becomes successful

**5. Aiko — The Tourist**
- **Schedule:** Random, any time
- **Favorite drinks:** Whatever's special that day
- **Personality:** Curious, takes photos, asks questions
- **Patience:** Medium (easily distracted by new things)
- **Loyalty rewards:**
  - Level 2: Leaves a 5-star review (+reputation boost)
  - Level 3: Sends postcards (seasonal decorations)
  - Level 5: Becomes a travel blogger who features your café
- **Storyline:** Visiting the town → discovers the café → becomes an evangelist → returns every season

**6. Chef Tomo — Bakery Supplier** (occasional)
- **Schedule:** Early mornings (6–8 AM), 2x per week
- **Favorite drinks:** Americano, anything with pastry pairing
- **Personality:** Professional, passionate about quality
- **Special:** Delivers new pastry options when befriended

**7. Luna — The Musician** (occasional)
- **Schedule:** Evenings (4–6 PM), weekends
- **Favorite drinks:** Chai Latte, Honey Lavender Latte
- **Personality:** Dreamy, hums while waiting
- **Special:** Unlocks background music options when befriended

### Customer Arrival Logic

```
For each time tick (1 minute):
  1. Check which customers are available this hour
  2. Roll visitFrequency for each (modified by weather, decorations, reputation)
  3. If roll succeeds and café isn't at capacity (MVP: max 4 simultaneous):
     → Spawn customer at door
     → Walk to preferred seating (if available) or nearest seat
     → Generate order from favoriteDrinks or random from unlocked recipes
  4. Customer waits patienceBase seconds for order to be taken
  5. If not taken in time → slight frown, patience decreases, eventually leaves
```

### Customer Satisfaction

After being served, each customer's satisfaction is calculated:

```
satisfaction = drinkQuality × (1 + artBonus) × preferenceMatch × patienceRemaining
```

- **drinkQuality:** 0.5 (Weak) to 1.3 (Perfect)
- **artBonus:** 0 to 0.5 (if latte art was applied)
- **preferenceMatch:** 1.0 (favorite drink) to 0.7 (neutral) to 0.4 (disliked)
- **patienceRemaining:** 1.0 (served immediately) to 0.7 (took a while)

Satisfaction affects: tip amount, loyalty gain, reputation gain, dialogue triggers.

### Customer Dialogue

At loyalty thresholds, customers trigger short dialogue sequences:

- **Level 1:** "I really like this place."
- **Level 2:** Shares a personal detail + recipe/decoration gift
- **Level 3:** Deeper conversation about their life
- **Level 4:** Mentions the café to others (reputation boost)
- **Level 5:** Full storyline conclusion + unique reward

Dialogue is presented in a simple text box with the customer's portrait. No branching choices in MVP — the player reads and acknowledges.

---

## 6. Cat Employee System

### Cat Architecture

```typescript
interface Cat {
  id: string;
  name: string;
  breed: string;          // Visual descriptor
  personality: string;    // "Sleepy", "Playful", "Dignified", etc.
  
  // Visual
  sprite: string;
  idleAnimations: string[];  // "nap", "groom", "stretch", "play"
  outfit: string | null;
  
  // Gameplay
  role: CatRole;
  passiveAbility: string;
  abilityStrength: number;  // 0.1 – 0.5
  
  // Stats
  happiness: number;        // 0-100
  friendship: number;       // 0-100 (player-cats bond)
  
  // Preferences
  favoriteFood: string;
  favoriteBed: string;
  favoriteToy: string;
  
  // Progression
  unlockCondition: string;
  upgradePath: CatUpgrade[];
}
```

### Cat Roles (MVP: 3 roles)

| Role | Ability | Visual Behavior |
|------|---------|-----------------|
| **Greeter** | +15% customer patience, +10% tips | Sits near door, headbutts customers warmly |
| **Barista** | -10% minigame difficulty (wider perfect zones) | Stands on counter, watches you make drinks |
| **Janitor** | Auto-cleans tables between customers | Carries tiny mop, tidies up after customers |

### MVP Cats (3)

**1. Mochi — The Greeter Cat**
- **Appearance:** Round orange tabby, perpetually smiling
- **Personality:** Social butterfly, loves everyone
- **Unlock:** Available from Day 1 (starter cat)
- **Favorite spot:** The welcome mat by the door
- **Ability:** Increases customer patience by 15%
- **Upgrade path:**
  - Level 1: Basic greeter
  - Level 2: +5% tip bonus
  - Level 3: Unlocks "Welcome Bandana" outfit
  - Level 4: Customers occasionally bring Mochi treats
  - Level 5: Mochi learns to "predict" customer orders

**2. Espresso — The Barista Cat**
- **Appearance:** Sleek black cat with bright green eyes
- **Personality:** Focused, dignified, sits on the espresso machine
- **Unlock:** Reach reputation level 2 (Small Café)
- **Favorite spot:** On top of the espresso machine (warm)
- **Ability:** Widens perfect zone in minigames by 10%
- **Upgrade path:**
  - Level 1: Basic barista assistance
  - Level 2: +5% drink quality bonus
  - Level 3: Unlocks "Barista Apron" outfit
  - Level 4: Occasionally "pre-heats" the machine
  - Level 5: Espresso "invents" a secret recipe

**3. Biscuit — The Janitor Cat**
- **Appearance:** Fluffy calico with a serious expression
- **Personality:** Tidy, efficient, judges messy customers
- **Unlock:** Reach reputation level 3 (Popular Coffee Shop)
- **Favorite spot:** Under the counter, watching for spills
- **Ability:** Auto-cleans tables 50% faster
- **Upgrade path:**
  - Level 1: Basic cleaning
  - Level 2: +25% cleaning speed
  - Level 3: Unlocks "Cleaning Bowtie" outfit
  - Level 4: Restocks sugar/napkins automatically
  - Level 5: Biscuit organizes the stockroom (+10% ingredient efficiency)

### Cat Behavior System

Cats are autonomous entities in the café scene. They:

1. **Idle loop:** Cycle through animations (nap → groom → stretch → play → nap)
2. **Move between favorite spots:** Walk between preferred furniture
3. **React to customers:** Greeter cats headbutt customers, barista cats watch drink-making
4. **React to player:** When tapped, cats purr, roll over, or meow (random)
5. **Sleep cycle:** Cats nap more during quiet hours, more active during rushes
6. **Friendship growth:** Increases passively over time + bonus from petting + providing favorite items

### Cat Happiness

| Factor | Effect |
|--------|--------|
| Having favorite bed placed | +20 happiness |
| Having favorite toy placed | +10 happiness |
| Being fed favorite food | +15 happiness |
| Being petted by player | +5 happiness |
| Clean café environment | +10 happiness |
| Dirty café | -15 happiness |
| No cat furniture | -10 happiness |
| Multiple cats together | +5 happiness (social) |

Low happiness (<30): Cat sleeps more, less effective ability
High happiness (>70): Cat gets bonus animation, extra ability strength

### Cat Outfits (MVP)

| Outfit | Cat | Unlock |
|--------|-----|--------|
| Welcome Bandana | Mochi | Level 3 |
| Barista Apron | Espresso | Level 3 |
| Cleaning Bowtie | Biscuit | Level 3 |
| Raincoat | Any | Seasonal event |
| Santa Hat | Any | Winter event |

### Cat-to-Customer Interactions

- Greeter cats improve patience for ALL customers
- Barista cats improve quality for ALL drinks
- Janitor cats improve table turnover
- Cats occasionally sit on customer tables → customer reacts
- Cats have "favorite customers" — certain pairs get bonus friendship

---

## 7. Recipe & Ingredient Systems

### Recipe Architecture

```typescript
interface Recipe {
  id: string;
  name: string;
  category: string;          // "espresso" | "milk_drink" | "cold" | "tea" | "special"
  description: string;
  ingredients: IngredientRequirement[];
  minigames: MinigameType[];   // Ordered list of minigames to complete
  basePrice: number;
  reputationGain: number;
  unlockType: "start" | "reputation" | "customer" | "event" | "experiment";
  unlockValue: string | number;
  difficulty: 1 | 2 | 3;
  seasonal: boolean;
  tags: string[];              // "hot", "cold", "sweet", "strong", "art"
}
```

### MVP Recipes (12)

| # | Recipe | Category | Minigames | Price | Unlock |
|---|--------|----------|-----------|-------|--------|
| 1 | Espresso | Espresso | Extraction | 3 | Start |
| 2 | Americano | Espresso | Extraction | 4 | Start |
| 3 | Latte | Milk Drink | Extraction + Milk Steam | 5 | Start |
| 4 | Cappuccino | Milk Drink | Extraction + Milk Steam | 5 | Start |
| 5 | Flat White | Milk Drink | Extraction + Milk Steam | 6 | Rep Level 1 |
| 6 | Mocha | Milk Drink | Extraction + Milk Steam + Cold (warm) | 7 | Rep Level 2 |
| 7 | Macchiato | Espresso | Extraction + Milk Steam (small) | 6 | Rep Level 2 |
| 8 | Cold Brew | Cold | Extraction + Cold Brew assembly | 6 | Rep Level 2 |
| 9 | Hot Chocolate | Milk Drink | Milk Steam + Cold (warm) | 5 | Start |
| 10 | Green Tea | Tea | Tea Brew | 4 | Start |
| 11 | Chai Latte | Tea | Tea Brew + Milk Steam | 7 | Rep Level 3 |
| 12 | Iced Latte | Cold | Extraction + Cold Drink assembly | 6 | Rep Level 3 |

### Unlock Progression

- **Start (Day 1):** Espresso, Americano, Latte, Cappuccino, Hot Chocolate, Green Tea
- **Rep Level 1 (Neighborhood Cart → Small Café):** Flat White
- **Rep Level 2 (Small Café → Popular Coffee Shop):** Mocha, Macchiato, Cold Brew
- **Rep Level 3 (Popular Coffee Shop → Local Favorite):** Chai Latte, Iced Latte

### Ingredient System

```typescript
interface Ingredient {
  id: string;
  name: string;
  category: "bean" | "milk" | "tea" | "syrup" | "chocolate" | "fruit" | "topping";
  quality: 1 | 2 | 3;
  origin: string;
  cost: number;
  shelfLife: number;         // Days before expiry
  seasonal: boolean;
}
```

### MVP Ingredients (18)

**Coffee Beans (3):** Colombian (2), Ethiopian (3), Brazilian (2)
**Milk (3):** Whole Milk (1), Oat Milk (2), Almond Milk (2)
**Tea (3):** Green Tea (1), Earl Grey (2), Chai Blend (2)
**Syrups (4):** Vanilla (1), Caramel (1), Lavender (3, seasonal), Pumpkin Spice (3, seasonal)
**Chocolate (2):** Cocoa Powder (1), Dark Chocolate (2)
**Toppings (3):** Whipped Cream (1), Cinnamon (0.5), Chocolate Shavings (1)

### Ingredient Quality Effects

- Higher quality = higher drink quality ceiling
- Higher quality = higher price customers pay
- Higher quality = more reputation gain
- Some recipes REQUIRE specific quality levels

### Supplier System (MVP: Simple)

Each day, 3 random ingredients are "on sale" (50% off). The player buys ingredients before or during the day from a simple shop screen.

### Recipe Journal

Tracks: discovered recipes, ingredients needed, quality history, customer favorites.

---

## 8. Decoration System

### Decoration Architecture

```typescript
interface Decoration {
  id: string;
  name: string;
  category: "furniture" | "wall" | "floor" | "plant" | "lighting" | "cat" | "seasonal";
  subcategory: string;
  sprite: string;
  size: { width: number; height: number };  // In grid cells
  placement: "floor" | "wall" | "ceiling";
  effects: DecorationEffect[];
  cost: number;
  unlockCondition: string;
  style: string;
  seasonal: boolean;
}
```

### Grid System

- **Grid size:** 8×6 cells (MVP café is one room)
- **Cell size:** 64×64 pixels on canvas
- **Total café area:** 512×384 pixels (scales to screen)
- **Placement:** Tap a decoration in the shop, then tap a grid cell to place
- **Overlapping:** Not allowed (grid prevents it)

### Decoration Categories (MVP)

**Furniture (12 items):**

| Item | Cost | Size | Effect |
|------|------|------|--------|
| Wooden Table | 20 | 2×2 | +1 seating |
| Cozy Armchair | 30 | 2×2 | +patience for window seaters |
| Counter Stool | 15 | 1×1 | +1 counter seating |
| Bookshelf | 40 | 2×1 | +attracts students/readers |
| Plant Pot | 10 | 1×1 | +relaxation (+5% patience) |
| Large Plant | 25 | 2×2 | +relaxation (+10% patience) |
| Floor Lamp | 20 | 1×1 | +cozy atmosphere |
| Pendant Light | 30 | 1×1 | +aesthetic (+5% tips) |
| Wall Clock | 15 | 1×1 (wall) | +aesthetic |
| Framed Art | 25 | 2×1 (wall) | +attracts artists |
| Window Box | 20 | 2×1 (wall) | +outdoor feel |
| Coffee Display | 35 | 2×1 | +aesthetic, +reputation |

**Cat Furniture (4 items):**

| Item | Cost | Size | Effect |
|------|------|------|--------|
| Cat Bed | 15 | 1×1 | Cat happiness +20 |
| Cat Tree | 30 | 2×2 | Cat happiness +15, cat moves more |
| Cat Scratching Post | 20 | 1×1 | Cat happiness +10 |
| Cat Window Perch | 25 | 2×1 | Cat happiness +10, cats watch outside |

### Decoration Effects

All effects are gentle bonuses, never penalties:

| Effect | Mechanic |
|--------|----------|
| **+Relaxation** | Increases patience for all customers |
| **+Aesthetic** | Increases tips slightly |
| **+Attract (type)** | Makes certain customer types more likely to visit |
| **+Cozy** | Improves customer mood during cold/rainy weather |
| **+Cat happiness** | Improves cat mood and ability effectiveness |
| **+Seating** | Adds available seats (more customers can visit) |

### Decoration Mode UI

1. Café view dims slightly
2. Grid overlay appears on the floor
3. Bottom panel shows owned decorations (scrollable)
4. Tap an item → it follows the cursor
5. Tap a grid cell → place if valid (green) or invalid (red)
6. "Done" button exits decoration mode

### Decoration Placement Rules

- Items cannot overlap
- Items cannot block the door
- Items cannot be placed on the counter area
- Maximum 20 decorations in MVP

---

## 9. Economy, Reputation, & Progression

### Currency: Coins

Coins are the primary currency. Earned from serving drinks, tips, daily bonuses, and customer loyalty gifts.

### Economy Balance (MVP)

**Income per customer:**
| Quality | Base Price | Tip | Total |
|---------|-----------|-----|-------|
| Weak | ×0.7 | 0 | ~2–3 |
| Good | ×1.0 | 0–1 | ~4–6 |
| Perfect | ×1.3 | 1–3 | ~6–9 |
| Perfect + Art | ×1.3 | 2–5 | ~7–11 |

**Daily revenue target:** 30–60 coins per day
**Decoration budget:** ~1–2 decorations per day of active play

### Reputation System

Reputation increases based on drink quality, latte art, customer loyalty, daily specials, and café maintenance.

### Reputation Thresholds

| Level | Name | Rep Required | Unlocks |
|-------|------|-------------|---------|
| 1 | Neighborhood Cart | 0 | Start, 5 recipes, basic ingredients |
| 2 | Small Café | 50 | Flat White, espresso cat, 3 new decorations |
| 3 | Popular Coffee Shop | 150 | Chai Latte, Iced Latte, janitor cat |
| 4 | Local Favorite | 350 | 2 new customers, outdoor seating, seasonal events |
| 5 | City Landmark | 600 | Town map expansion, rare ingredients, 2 new cats |
| 6 | Famous Destination | 1000 | Second café location, advanced decorations |

### Progression Milestones

| Milestone | Reward |
|-----------|--------|
| Serve 100 drinks | "Experienced Barista" title, +5% quality bonus |
| Collect all 3 cats | "Cat Café" sign decoration |
| Achieve 10 perfect latte arts | Unlock Cat Face pattern |
| Befriend 3 customers to level 5 | "Heart of the Community" achievement |
| Earn 1000 total coins | "Business Savvy" title |
| Complete 7 consecutive days | "Dedicated Owner" bonus decoration |

### Equipment Upgrades

| Upgrade | Cost | Effect | Unlock |
|---------|------|--------|--------|
| Better Espresso Machine | 100 | +10% drink quality ceiling | Rep 2 |
| Milk Frother Pro | 80 | Wider perfect zone for milk steaming | Rep 2 |
| Cold Brew Station | 60 | Unlock cold brew recipes | Rep 3 |
| Grind Control | 70 | Wider perfect zone for grinding | Rep 3 |
| Premium Beans | 50/day | Access to premium bean inventory | Rep 4 |

---

## 10. Daily Specials, Weather, & Seasons

### Daily Special System

Each in-game day begins with the player selecting a Daily Special.

**Selection flow:**
1. Day opens → "Today's Special:" screen
2. Player sees 2–3 options (based on available ingredients and unlocked recipes)
3. Each option shows: drink name, bonus effects, ingredient cost
4. Player selects one → it becomes today's special
5. Special is highlighted on the café chalkboard

**Special effects:** +2 reputation per perfect serve, +20% demand for that drink.

### Weather System

| Weather | Effect |
|---------|--------|
| **Sunny** | +outdoor seating value, more iced drinks, +10% customer frequency |
| **Cloudy** | Neutral, balanced drink orders |
| **Rainy** | +hot drink demand, +cozy bonus from indoor furniture |
| **Stormy** | -30% customer frequency, remaining customers have +patience |
| **Snowy** | +hot chocolate demand, fireplace bonus |

**Weather frequency (MVP):** Sunny 30%, Cloudy 30%, Rainy 20%, Stormy 10%, Snowy 10%

### Seasonal System

Four seasons, each lasting 7 in-game days:

| Season | Theme | Special Recipes | Event |
|--------|-------|----------------|-------|
| **Spring** | Cherry blossoms | Cherry Blossom Latte | Art Festival |
| **Summer** | Warm, refreshing | Summer Lemonade, Mango Smoothie | Beach Week |
| **Autumn** | Cozy, harvest | Pumpkin Spice Latte, Maple Coffee | Harvest Festival |
| **Winter** | Comfort, celebration | Peppermint Mocha, Gingerbread Latte | Holiday Market |

Seasonal changes: visual palette shifts, new decorations, new customers, background music changes.

---

## 11. Town Map & Meta Progression

### Town Map (Post-MVP Foundation)

**MVP town locations (locked initially):**

| Location | Unlock | Purpose |
|----------|--------|---------|
| **Bakery** | Rep Level 2 | Buy pastries to sell alongside drinks |
| **Flower Shop** | Rep Level 2 | Buy plants for decoration |
| **Farmers Market** | Rep Level 3 | Buy seasonal ingredients at lower cost |
| **Bookstore** | Rep Level 3 | Attracts student/reader customers |
| **Cat Shelter** | Rep Level 4 | Adopt new cats |

Each location has a simple screen: illustrated background, NPC greeting, shop grid, buy button.

### Meta Progression: Second Café Location

After reaching Reputation Level 6 (Famous Destination), unlock a **Beach Café** with different layout, ambient sounds, weather, decorations, customers, and an exclusive cat. Player retains all progression across locations.

---

## 12. Social Features & Idle Progression

### Idle Progression (Limited)

When away: cats serve 1 drink per 30 min (Good quality), janitor cleans hourly, friendship grows slowly, coins accumulate at ~20% active rate. No recipe discovery, dialogue, or events offline.

Return bonus: "Welcome back!" screen showing offline earnings.

**Design rule:** Active play should always be 3–5× more rewarding than offline.

### Social Features (Post-MVP)

Visit friends' cafés, leave tips, share screenshots, weekly decoration contests, daily café tours, friend leaderboards, recipe sharing, seasonal community goals. All optional, never required for progression.

---

## 13. Monetization

### MVP Monetization: None

The MVP is entirely free. Build audience before asking for money.

### Post-MVP Options

**Acceptable:** Cosmetic furniture packs ($2–5), cat outfits ($1–2), café themes ($3–5), soundtrack ($5–10), supporter bundle ($10–15), optional rewarded ads (mobile only).

**Never:** Energy systems, forced ads, pay-to-win, loot boxes, required purchases, aggressive popups.

---

## 14. Audio Direction

### Music Layers

| Layer | Description | Volume |
|-------|-------------|--------|
| **Base track** | Gentle piano/guitar café music | 30% |
| **Ambience** | Soft café chatter, cups clinking | 20% |
| **Weather** | Rain on windows, wind, thunder | 15% |
| **Seasonal** | Season-appropriate melodic additions | 15% |

3–4 looping tracks per season (12–16 total), 2–3 minutes each, seamless loops with crossfade.

### Sound Effects

**Drink-making:** Espresso machine hum, steam hiss, liquid pour, grinder whir, ice clink, cup clink, "Perfect" chime.
**Café ambience:** Door bell, cash register, cat purr, cat meow, footsteps, pages turning.
**UI:** Soft click, coin jingle, level up fanfare, recipe discovery, cat adoption.

### Audio Technical

- Format: OGG (primary) + MP3 (fallback)
- Library: Howler.js
- Preload first day's audio on title screen
- Mobile: AudioContext resumed on first interaction

---

## 15. First 30 Minutes & First 7 Days

### First 30 Minutes

**Minute 0–2: Title Screen** — Animated logo, "New Game" / "Continue".

**Minute 2–5: Opening Tutorial** — Empty café, narrator guides first espresso, first customer (Mei) arrives, first drink served.

**Minute 5–10: First Real Gameplay** — Derek and Rose arrive, player manages 2–3 customers, discovers decoration menu, places first plant.

**Minute 10–15: Learning the Rhythm** — Morning rush (1 customer every 2 min), Mochi arrives, first Perfect espresso.

**Minute 15–20: First Day Peaks** — 3–4 customers quickly, satisfying serve→earn rhythm, coins accumulate.

**Minute 20–25: Afternoon Slowdown** — Fewer customers, first decoration purchase, Rose shares first dialogue.

**Minute 25–30: Day End** — Summary screen, "Next Day" transition.

### First 7 In-Game Days

| Day | Key Events | Earned | Rep |
|-----|-----------|--------|-----|
| 1 | Tutorial, meet Mei/Derek/Rose, unlock Mochi | ~35 coins | 0→12 |
| 2 | Daily special introduced, meet Kai, first decoration | ~40 coins | 12→28 |
| 3 | Rainy weather, Rose Level 1, first latte art | ~45 coins | 28→48 |
| 4 | Rep 50 → Level 2, unlock Flat White + espresso cat, meet Aiko | ~50 coins | 48→72 |
| 5 | More customers, Mei Level 1, bookshelf + lamp placed | ~55 coins | 72→98 |
| 6 | Rose Level 2 → "Grandma's Hot Chocolate" recipe, stormy weather | ~45 coins | 98→118 |
| 7 | Weekly summary, approaching Level 3, seasonal change | ~60+20 coins | 118→145 |

---

## 16. MVP Feature List & Development Roadmap

### Complete MVP Feature List

**Core Systems:** Game loop, day cycle, pause/resume, auto-save, manual save, load game.

**Minigames:** Espresso Extraction, Milk Steaming, Latte Art (3 patterns), Grinding, Cold Drink Assembly, quality scoring.

**Customers:** 5 recurring customers, arrival scheduling, order generation, patience, satisfaction, loyalty levels (0–5), dialogue triggers.

**Cats:** 3 cats, 3 roles, passive abilities, happiness, furniture preferences, behavior, petting.

**Recipes & Ingredients:** 12 recipes, 18 ingredients, unlock progression, ingredient shop, recipe journal.

**Decoration:** Grid-based placement (8×6), 16 decorations, decoration mode UI, gentle effects, decoration shop.

**Economy:** Coins, tips, reputation (6 levels), equipment upgrades (3).

**Daily Specials:** Daily selection (2–3 options), bonus effects.

**Weather:** 5 weather types, demand effects, visual effects.

**Seasons:** 4 seasons (7 days each), seasonal palette changes, 2–3 seasonal recipes/decorations each.

**UI:** Title screen, HUD, recipe book, decoration mode, shop, cat collection, day summary, settings, responsive layout.

**Audio:** Background music (4 tracks), ambience, drink SFX (8+), UI SFX (5+), volume controls.

### Phased Development Roadmap

**Phase 1: Foundation (Weeks 1–3)**
- Project setup (Vite, TS, React, PixiJS)
- Game loop + day cycle
- Save/load system (IndexedDB)
- Basic UI shell
- PixiJS café scene (placeholder)
- **Milestone: Functional game loop with placeholder content**

**Phase 2: Core Gameplay (Weeks 4–7)**
- All 5 minigames
- Customer system (arrival, ordering, serving)
- Recipe system (12 recipes, unlock logic)
- Ingredient system (18 ingredients, shop)
- **Milestone: Complete drink-making loop**

**Phase 3: World Building (Weeks 8–11)**
- 5 customer personalities + dialogue
- Cat system (3 cats, roles, behavior)
- Decoration system (grid, 16 items)
- Economy (coins, tips, reputation)
- Daily special + weather systems
- **Milestone: Complete MVP feature set (unpolished)**

**Phase 4: Polish (Weeks 12–14)**
- Placeholder art pass
- Animation polish (juice, particles)
- Audio integration
- Responsive layout
- Tutorial / onboarding
- Bug fixing + balance tuning
- **Milestone: Playable, polished MVP**

**Total:** 14 weeks (3.5 months) for a solo developer.

---

## 17. Save Data Schema

```typescript
interface SaveData {
  version: number;
  lastSaved: string;            // ISO timestamp
  
  player: {
    name: string;
    coins: number;
    totalCoinsEarned: number;
    totalDrinksServed: number;
    totalPerfectDrinks: number;
    totalLatteArts: number;
    playTimeMinutes: number;
  };
  
  cafe: {
    name: string;
    decorations: PlacedDecoration[];
    unlockedDecorations: string[];
    equipment: {
      espressoMachine: number;
      milkFrother: number;
      coldBrewStation: number;
      grinder: number;
    };
  };
  
  recipes: {
    discovered: string[];
    qualityHistory: Record<string, {
      bestQuality: number;
      timesServed: number;
      avgQuality: number;
    }>;
  };
  
  inventory: {
    ingredients: Record<string, number>;
  };
  
  customers: {
    unlocked: string[];
    loyalty: Record<string, number>;
    satisfactionHistory: Record<string, number>;
    dialogueSeen: Record<string, string[]>;
  };
  
  cats: {
    unlocked: string[];
    happiness: Record<string, number>;
    friendship: Record<string, number>;
    level: Record<string, number>;
    activeOutfit: Record<string, string | null>;
  };
  
  progression: {
    reputation: number;
    reputationLevel: number;
    milestones: string[];
    dayNumber: number;
    season: string;
    seasonDay: number;
  };
  
  dailyState: {
    weather: string;
    dailySpecial: string | null;
    customersServedToday: number;
    revenueToday: number;
    tipsToday: number;
    repGainToday: number;
  };
  
  settings: {
    musicVolume: number;
    sfxVolume: number;
    ambienceVolume: number;
    showTutorial: boolean;
    autoSave: boolean;
  };
}

interface PlacedDecoration {
  id: string;
  decorationId: string;
  gridX: number;
  gridY: number;
  rotation: number;
}
```

**Save triggers:** End of day, placing decoration, buying from shop, adopting cat, manual save, `beforeunload`, `visibilitychange`.

**Migration:** Version field checked on load; migrations applied in order.

---

## 18. Risks & Post-Launch Features

### Development Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep | High | High | Strict MVP scope, timeboxed phases |
| Minigame polish overruns | Medium | High | Start early, cut grinding if needed |
| Art bottleneck | High | Medium | Placeholder first, finalize post-MVP |
| Mobile layout issues | Medium | Medium | Mobile-first from Week 1 |
| Save corruption | Low | High | Versioned migrations, backup saves |
| Low-end device performance | Medium | Medium | Profile early, reduce particles on mobile |
| Player retention after Day 7 | Medium | High | Clear goals, variety, seasonal hooks |

### Features Delayed Until Post-Launch

| Feature | Reason | Priority |
|---------|--------|----------|
| Town map (interactive) | Additional art + screens | High |
| Social features | Backend infrastructure required | Medium |
| Cloud saves | Auth + backend required | Medium |
| PWA support | Service worker + offline testing | Medium |
| Second café location | Endgame content | Low |
| Deep customer storylines | Content-heavy, incremental | High |
| Full seasonal events | Event-specific mechanics | Medium |
| Freeform latte art | Complex scoring | Low |
| Ingredient experimentation | Complex recipe engine | Low |
| Cat outfits | Cosmetic only | Medium |
| Monetization | Needs audience first | Low |
| Accessibility features | Important, iterative | High |
| Localization | Translation infrastructure | Medium |
