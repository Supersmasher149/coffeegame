# Cozy Coffee Shop

A responsive browser cafe-management game built from the approved design in `docs/superpowers/specs/2026-07-10-cozy-coffee-shop-design.md`.

## Run Locally

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Verification

```bash
npm test
npm run build
npm run preview
```

## Gameplay

1. Name the cafe and select a daily special.
2. Accept customer order cards from the cafe view.
3. Complete the recipe's chained espresso, milk, latte-art, grinding, tea, or assembly games.
4. Spend coins at the market, arrange the 8 by 6 cafe grid, and pet the cat crew between orders.
5. Build reputation to discover drinks, customers, equipment, decorations, and cats.
6. Reach 6:00 PM to review the day and advance the weather and seven-day season cycle.

Progress is versioned and saved to IndexedDB after durable actions. Continue restores that local snapshot and grants limited offline cat earnings.

## Architecture

- React renders navigation, dialogs, management screens, and minigame input.
- PixiJS renders the cafe room, current customers, cats, weather, and placed furniture.
- Zustand is the single canonical game store.
- Pure functions in `src/systems/gameRules.ts` calculate scoring, sales, progression, placement, weather, and day transitions.
- Content in `src/data` defines the 12 reputation recipes plus Rose's secret recipe, 18 ingredients, 7 customers, 3 cats, 16 decorations, and equipment upgrades.
