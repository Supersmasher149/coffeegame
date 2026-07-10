# Cozy Coffee Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive browser MVP in which the player can run timed cafe days, serve customers through chained drink minigames, collect and pet cats, purchase ingredients and decorations, progress reputation, and save locally.

**Architecture:** React owns screen routing, overlays, HUD, and input-heavy minigames; a direct PixiJS application renders the living cafe scene beneath those controls. A single Zustand store is the canonical serializable game state, while pure rule functions calculate economy, progression, availability, and daily transitions. IndexedDB stores versioned snapshots and Howler owns optional sound playback.

**Tech Stack:** Vite, TypeScript, React 18, PixiJS 8, Zustand, idb, Howler.js, CSS Modules, Vitest, Testing Library.

## Global Constraints

- Desktop browsers are primary, and all gameplay must remain usable in responsive mobile browsers.
- A cafe day runs from 6:00 AM to 6:00 PM at one in-game hour per real minute.
- Decoration, recipe, shop, cat collection, settings, and minigame screens pause the day clock.
- The MVP has no fail state; imperfect input produces lower drink quality but always allows service to continue.
- Recipes, customers, cats, ingredients, and decorations are data objects rather than component-specific constants.
- Save data is versioned and persisted in IndexedDB after durable progression changes and day transitions.
- The cafe placement grid is 8 by 6, prevents overlap and blocked cells, and allows at most 20 placed decorations.

---

### Task 1: Project Foundation And Domain Data

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/vite-env.d.ts`
- Create: `src/types/game.ts`
- Create: `src/data/recipes.ts`, `src/data/ingredients.ts`, `src/data/customers.ts`, `src/data/cats.ts`, `src/data/decorations.ts`
- Test: `src/data/data.test.ts`

**Interfaces:**
- Produces: `Recipe`, `Ingredient`, `CustomerDefinition`, `CatDefinition`, `DecorationDefinition`, `GameSnapshot`, and exported data arrays with stable string IDs.
- Produces: `getRecipe(id: string): Recipe | undefined` and equivalent lookup helpers where needed.

- [ ] **Step 1: Scaffold Vite and configure strict TypeScript plus Vitest**

```json
{
  "scripts": { "dev": "vite", "build": "tsc -b && vite build", "test": "vitest run" },
  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1", "pixi.js": "^8.0.0", "zustand": "^5.0.0", "idb": "^8.0.0", "howler": "^2.2.4" }
}
```

- [ ] **Step 2: Write a data-integrity test**

```ts
it("defines unique recipes with valid ingredient references", () => {
  expect(new Set(recipes.map((recipe) => recipe.id)).size).toBe(recipes.length)
  expect(recipes.every((recipe) => recipe.ingredients.every((item) => ingredientIds.has(item.ingredientId)))).toBe(true)
})
```

- [ ] **Step 3: Run the test and verify it fails before data exports exist**

Run: `npm test -- src/data/data.test.ts`
Expected: FAIL because the data modules do not exist.

- [ ] **Step 4: Add all 12 MVP recipes, 18 ingredients, 7 customers, 3 cats, and 16 decorations as typed data**

- [ ] **Step 5: Run the integrity test**

Run: `npm test -- src/data/data.test.ts`
Expected: PASS.

### Task 2: Pure Game Rules And Persistence

**Files:**
- Create: `src/systems/gameRules.ts`, `src/systems/saveSystem.ts`
- Test: `src/systems/gameRules.test.ts`

**Interfaces:**
- Consumes: domain definitions from `src/types/game.ts`.
- Produces: `getReputationLevel(reputation: number): number`, `scoreDrink(results: MinigameResult[]): DrinkScore`, `calculateSale(recipe: Recipe, score: DrinkScore, modifiers: SaleModifiers): SaleResult`, `canPlaceDecoration(...)`, `createInitialSnapshot(): GameSnapshot`, `createNextDay(snapshot: GameSnapshot): GameSnapshot`.
- Produces: `loadSnapshot(): Promise<GameSnapshot | null>` and `saveSnapshot(snapshot: GameSnapshot): Promise<void>`.

- [ ] **Step 1: Add failing tests for reputation boundaries, quality scoring, sale rewards, placement overlap, and next-day season rollover**

```ts
expect(getReputationLevel(49)).toBe(1)
expect(getReputationLevel(50)).toBe(2)
expect(canPlaceDecoration({ gridX: 0, gridY: 0, width: 2, height: 2 }, [], blockedCells)).toBe(true)
expect(canPlaceDecoration({ gridX: 7, gridY: 5, width: 2, height: 2 }, [], blockedCells)).toBe(false)
```

- [ ] **Step 2: Run tests and verify missing-export failures**

Run: `npm test -- src/systems/gameRules.test.ts`
Expected: FAIL because the rule functions do not exist.

- [ ] **Step 3: Implement deterministic rule functions without React or PixiJS dependencies**

- [ ] **Step 4: Add versioned IndexedDB persistence with migration-safe defaults**

```ts
const database = await openDB("cozy-coffee-shop", 1, {
  upgrade(db) { db.createObjectStore("saves") },
})
await database.put("saves", snapshot, "primary")
```

- [ ] **Step 5: Run rule tests**

Run: `npm test -- src/systems/gameRules.test.ts`
Expected: PASS.

### Task 3: Canonical Zustand Game Store

**Files:**
- Create: `src/store/gameStore.ts`
- Test: `src/store/gameStore.test.ts`

**Interfaces:**
- Consumes: `createInitialSnapshot`, game rule functions, and data lookups.
- Produces: `useGameStore`, `gameStore`, and actions `newGame`, `hydrate`, `tick`, `setScreen`, `chooseDailySpecial`, `acceptOrder`, `recordMinigameResult`, `purchaseIngredient`, `purchaseDecoration`, `placeDecoration`, `petCat`, `finishDay`, `startNextDay`, and `updateSettings`.

- [ ] **Step 1: Add tests that reset the vanilla store and exercise one complete sale**

```ts
gameStore.getState().newGame("Juniper Cafe")
gameStore.getState().spawnCustomer("mei", "americano")
const orderId = gameStore.getState().activeCustomers[0].id
gameStore.getState().acceptOrder(orderId)
gameStore.getState().recordMinigameResult({ type: "espresso", accuracy: 0.95 })
expect(gameStore.getState().player.coins).toBeGreaterThan(30)
```

- [ ] **Step 2: Verify the store test fails before implementation**

Run: `npm test -- src/store/gameStore.test.ts`
Expected: FAIL because `gameStore` does not exist.

- [ ] **Step 3: Implement state transitions as atomic Zustand actions**

- [ ] **Step 4: Add scheduled customer generation based on time, weather, reputation, capacity, and customer preferences**

- [ ] **Step 5: Run store and rule tests**

Run: `npm test -- src/store/gameStore.test.ts src/systems/gameRules.test.ts`
Expected: PASS.

### Task 4: App Shell, Title Flow, HUD, And Cafe Scene

**Files:**
- Create: `src/App.tsx`, `src/App.module.css`, `src/styles/global.css`
- Create: `src/ui/TitleScreen.tsx`, `src/ui/TitleScreen.module.css`, `src/ui/HUD.tsx`, `src/ui/HUD.module.css`, `src/ui/CafeScreen.tsx`, `src/ui/CafeScreen.module.css`, `src/ui/Navigation.tsx`
- Create: `src/game/CafeCanvas.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `useGameStore` selectors and actions.
- Produces: title-to-game flow, loading state, responsive HUD, PixiJS cafe visualization, customer order cards, cat interaction targets, and the main feature navigation.

- [ ] **Step 1: Write a title-screen test**

```tsx
render(<App />)
expect(await screen.findByRole("heading", { name: /cozy coffee shop/i })).toBeVisible()
await user.click(screen.getByRole("button", { name: /new cafe/i }))
expect(await screen.findByText(/day 1/i)).toBeVisible()
```

- [ ] **Step 2: Run the test and verify the app import fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because `App.tsx` does not exist.

- [ ] **Step 3: Implement the warm editorial title screen and game shell**

- [ ] **Step 4: Initialize and destroy one PixiJS application per mounted cafe canvas, drawing the room, counter, weather, cats, and current customers from store subscriptions**

- [ ] **Step 5: Add a one-second day-cycle interval that dispatches `tick` only while the cafe screen is unpaused**

- [ ] **Step 6: Run the app test and production build**

Run: `npm test -- src/App.test.tsx && npm run build`
Expected: PASS and a generated `dist` directory.

### Task 5: Chained Drink Minigames

**Files:**
- Create: `src/ui/minigames/MinigameOverlay.tsx`, `src/ui/minigames/MinigameOverlay.module.css`
- Create: `src/ui/minigames/TimingGame.tsx`, `src/ui/minigames/MilkGame.tsx`, `src/ui/minigames/LatteArtGame.tsx`, `src/ui/minigames/AssemblyGame.tsx`
- Test: `src/ui/minigames/minigames.test.tsx`

**Interfaces:**
- Consumes: active order recipe `minigames` and `recordMinigameResult(result: MinigameResult)`.
- Produces: keyboard, pointer, mouse, and touch operable implementations for espresso, grinding, tea, milk, latte art, and cold assembly.

- [ ] **Step 1: Add a test that stops a timing game and reports normalized accuracy**

```tsx
render(<TimingGame type="espresso" onComplete={onComplete} />)
await user.click(screen.getByRole("button", { name: /stop extraction/i }))
expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ type: "espresso" }))
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- src/ui/minigames/minigames.test.tsx`
Expected: FAIL because the minigame components do not exist.

- [ ] **Step 3: Implement timing games with forgiving good and perfect zones**

- [ ] **Step 4: Implement five-second milk control, checkpoint latte tracing, and ordered ingredient assembly**

- [ ] **Step 5: Chain recipe steps in `MinigameOverlay`; every completion advances or settles the sale and dismisses the overlay**

- [ ] **Step 6: Run minigame and store tests**

Run: `npm test -- src/ui/minigames/minigames.test.tsx src/store/gameStore.test.ts`
Expected: PASS.

### Task 6: Specials, Recipe Journal, Shop, Cats, And Decorations

**Files:**
- Create: `src/ui/DailySpecial.tsx`, `src/ui/RecipeBook.tsx`, `src/ui/ShopScreen.tsx`, `src/ui/CatCollection.tsx`, `src/ui/DecorationScreen.tsx`, `src/ui/FeaturePanel.module.css`
- Test: `src/ui/featureScreens.test.tsx`

**Interfaces:**
- Consumes: store inventory, ownership, placement, recipes, cats, special candidates, and purchasing actions.
- Produces: accessible overlays for special selection, recipe discovery, ingredient and decoration purchases, cat mood and petting, plus an interactive 8 by 6 placement grid.

- [ ] **Step 1: Add a placement-screen test that purchases, selects, and places a one-cell plant**

```tsx
render(<DecorationScreen />)
await user.click(screen.getByRole("button", { name: /plant pot/i }))
await user.click(screen.getByRole("button", { name: /row 2 column 2/i }))
expect(gameStore.getState().cafe.decorations).toHaveLength(1)
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/ui/featureScreens.test.tsx`
Expected: FAIL because the feature screens do not exist.

- [ ] **Step 3: Implement daily special choices from unlocked recipes and available stock**

- [ ] **Step 4: Implement the recipe journal, two-tab shop, and cat collection**

- [ ] **Step 5: Implement owned-decoration selection and valid grid placement feedback**

- [ ] **Step 6: Run feature tests**

Run: `npm test -- src/ui/featureScreens.test.tsx`
Expected: PASS.

### Task 7: Day Summary, Settings, Audio, And Save Lifecycle

**Files:**
- Create: `src/ui/DaySummary.tsx`, `src/ui/SettingsScreen.tsx`
- Create: `src/systems/audioSystem.ts`
- Modify: `src/App.tsx`, `src/store/gameStore.ts`
- Test: `src/ui/daySummary.test.tsx`

**Interfaces:**
- Consumes: `dailyStats`, settings state, `finishDay`, `startNextDay`, `saveSnapshot`, and Howler volume controls.
- Produces: daily results and next-day preview, settings controls, manual save feedback, autosave after durable actions, and lifecycle saves on visibility changes.

- [ ] **Step 1: Add a summary test that advances the season after day seven**

```tsx
gameStore.setState({ progression: { ...progression, dayNumber: 7, season: "spring", seasonDay: 7 } })
render(<DaySummary />)
await user.click(screen.getByRole("button", { name: /start day 8/i }))
expect(gameStore.getState().progression.season).toBe("summer")
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/ui/daySummary.test.tsx`
Expected: FAIL because the summary screen does not exist.

- [ ] **Step 3: Implement summary metrics, next-day transition, and weather preview**

- [ ] **Step 4: Implement settings and Howler volume synchronization**

- [ ] **Step 5: Wire IndexedDB hydration, manual save, autosave, `visibilitychange`, and `beforeunload` best-effort save**

- [ ] **Step 6: Run all tests**

Run: `npm test`
Expected: PASS.

### Task 8: Responsive Polish And Release Verification

**Files:**
- Modify: all CSS Modules and `src/styles/global.css`
- Create: `README.md`

**Interfaces:**
- Consumes: complete application.
- Produces: keyboard-visible focus, reduced-motion handling, 44-pixel mobile targets, desktop and mobile layouts without horizontal overflow, and documented development commands.

- [ ] **Step 1: Add responsive breakpoints at 900px and 620px, safe-area padding, and reduced-motion overrides**

- [ ] **Step 2: Verify title, cafe, minigames, shop, recipe book, cats, decoration grid, settings, and summary at desktop and mobile widths**

- [ ] **Step 3: Run the complete automated verification suite**

Run: `npm test && npm run build`
Expected: all tests PASS, TypeScript reports no errors, and Vite emits a production bundle.

- [ ] **Step 4: Start the production preview and smoke-test a full customer sale plus save/load flow**

Run: `npm run preview -- --host 127.0.0.1`
Expected: the app loads, a drink can be completed, rewards update, and Continue restores the saved cafe.

## Scope Notes

The implementation includes all local, playable MVP systems in the approved design. Networked social features, monetization, cloud saves, interactive town locations, a second cafe, and installable PWA support remain post-MVP exactly as designated in the spec. Final sprite sheets, recorded music, and authored story content use polished procedural/placeholder presentation because no binary art or audio source assets are present in the workspace.
