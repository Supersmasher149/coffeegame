import { useStore } from "zustand"
import { createStore } from "zustand/vanilla"
import { cats } from "../data/cats"
import { customerById, customers } from "../data/customers"
import { decorationById } from "../data/decorations"
import { ingredientById } from "../data/ingredients"
import { getUnlockedRecipes, recipeById } from "../data/recipes"
import { equipmentUpgrades } from "../data/upgrades"
import {
  calculateSale,
  canPlaceDecoration,
  createInitialSnapshot,
  createNextDay,
  getDecorationBonuses,
  getCafeCapacity,
  getDailySaleIngredientIds,
  getReputationLevel,
  getTimePhase,
  scoreDrink,
} from "../systems/gameRules"
import type {
  ActiveCustomer,
  AppScreen,
  GameSnapshot,
  MinigameResult,
  PlacedDecoration,
  SettingsState,
} from "../types/game"

export interface GameRuntimeState {
  hydrated: boolean
  started: boolean
  screen: AppScreen
  specialOpen: boolean
  toast: string | null
  lastSpawnMinute: number
}

export interface GameActions {
  newGame: (cafeName?: string) => void
  hydrate: (snapshot: GameSnapshot | null) => void
  setScreen: (screen: AppScreen) => void
  tick: () => void
  spawnCustomer: (customerId?: string, recipeId?: string) => void
  acceptOrder: (orderId: string) => void
  recordMinigameResult: (result: MinigameResult) => void
  chooseDailySpecial: (recipeId: string) => void
  skipDailySpecial: () => void
  purchaseIngredient: (ingredientId: string) => void
  purchaseDecoration: (decorationId: string) => void
  purchaseEquipment: (equipmentId: keyof GameSnapshot["cafe"]["equipment"]) => void
  placeDecoration: (decorationId: string, gridX: number, gridY: number) => void
  removeDecoration: (placedId: string) => void
  petCat: (catId: string) => void
  finishDay: () => void
  startNextDay: () => void
  updateSettings: (settings: Partial<SettingsState>) => void
  dismissDialogue: () => void
  clearToast: () => void
}

export type GameState = GameSnapshot & GameRuntimeState & GameActions

export const GAME_TICK_MS = 700
export const MIN_SPAWN_GAP = 5
export const MAX_SPAWN_GAP = 20

const spawnChanceByPhase = {
  morning: 0.06,
  midday: 0.045,
  afternoon: 0.03,
  closing: 0.075,
} as const

const runtimeDefaults: GameRuntimeState = {
  hydrated: false,
  started: false,
  screen: "cafe",
  specialOpen: false,
  toast: null,
  lastSpawnMinute: 345,
}

const withoutActions = (state: GameState): GameSnapshot => ({
  version: state.version,
  lastSaved: state.lastSaved,
  player: state.player,
  cafe: state.cafe,
  inventory: state.inventory,
  discoveredRecipes: state.discoveredRecipes,
  recipeHistory: state.recipeHistory,
  customerLoyalty: state.customerLoyalty,
  customerVisits: state.customerVisits,
  dialogueSeen: state.dialogueSeen,
  catHappiness: state.catHappiness,
  catFriendship: state.catFriendship,
  catLevels: state.catLevels,
  progression: state.progression,
  weather: state.weather,
  nextWeather: state.nextWeather,
  dailySpecial: state.dailySpecial,
  dailyStats: state.dailyStats,
  settings: state.settings,
  minuteOfDay: state.minuteOfDay,
  activeCustomers: state.activeCustomers,
  activeOrderId: state.activeOrderId,
  dialogue: state.dialogue,
})

const canMakeRecipe = (state: GameState, recipeId: string) => {
  const recipe = recipeById[recipeId]
  return Boolean(recipe && recipe.ingredients.every((requirement) => (state.inventory[requirement.ingredientId] ?? 0) >= requirement.quantity))
}

const chooseOrder = (state: GameState, customerId: string): string | null => {
  const customer = customerById[customerId]
  const available = state.discoveredRecipes.map((id) => recipeById[id]).filter((recipe) => recipe && canMakeRecipe(state, recipe.id))
  if (state.dailySpecial && available.some((recipe) => recipe.id === state.dailySpecial) && Math.random() < 0.2) return state.dailySpecial
  const weatherTag = state.weather === "sunny" ? "cold" : state.weather === "rainy" || state.weather === "snowy" ? "hot" : null
  const weatherPool = weatherTag ? available.filter((recipe) => recipe.tags.includes(weatherTag)) : []
  if (weatherPool.length && Math.random() < 0.35) return weatherPool[Math.floor(Math.random() * weatherPool.length)].id
  const favorite = customer.favoriteDrinks.filter((id) => available.some((recipe) => recipe.id === id))
  const pool = favorite.length && Math.random() < 0.7 ? favorite : available.map((recipe) => recipe.id)
  return pool[Math.floor(Math.random() * pool.length)] ?? null
}

const getCatStrength = (state: GameState, role: "greeter" | "barista" | "janitor") => {
  const cat = cats.find((item) => item.role === role && item.unlockLevel <= state.progression.level)
  if (!cat) return 0
  const furnitureHappiness = getDecorationBonuses(state.cafe.decorations).catHappiness
  const happiness = Math.min(100, (state.catHappiness[cat.id] ?? 70) + furnitureHappiness)
  const moodMultiplier = happiness < 30 ? 0.5 : happiness > 70 ? 1.1 : 1
  return cat.abilityStrength * moodMultiplier
}

const makeCustomer = (state: GameState, customerId: string, recipeId?: string): ActiveCustomer | null => {
  const definition = customerById[customerId]
  const selectedRecipe = recipeId ?? chooseOrder(state, customerId)
  if (!definition || !selectedRecipe || !canMakeRecipe(state, selectedRecipe)) return null
  const bonuses = getDecorationBonuses(state.cafe.decorations)
  const weatherCozy = state.weather === "rainy" || state.weather === "snowy" ? bonuses.cozy : 0
  const stormyPatience = state.weather === "stormy" ? 0.25 : 0
  const patienceBoost = bonuses.patience + weatherCozy + stormyPatience + getCatStrength(state, "greeter")
  const maxPatience = Math.round(definition.patienceBase * (1 + patienceBoost))
  return {
    id: `${customerId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerId,
    recipeId: selectedRecipe,
    status: "waiting",
    patience: maxPatience,
    maxPatience,
    arrivedAt: state.minuteOfDay,
    minigameStep: 0,
    results: [],
  }
}

const createActions = (set: (updater: (state: GameState) => Partial<GameState> | GameState) => void, get: () => GameState): GameActions => ({
  newGame: (cafeName = "Juniper & Steam") => set(() => ({
    ...createInitialSnapshot(),
    ...runtimeDefaults,
    hydrated: true,
    started: true,
    specialOpen: true,
    cafe: { ...createInitialSnapshot().cafe, name: cafeName.trim() || "Juniper & Steam" },
  } as GameState)),
  hydrate: (snapshot) => set(() => {
    if (!snapshot) return { hydrated: true }
    const elapsedMinutes = Math.max(0, (Date.now() - new Date(snapshot.lastSaved).getTime()) / 60000)
    const offlineDrinks = Math.min(24, Math.floor(elapsedMinutes / 30))
    return {
      ...snapshot,
      hydrated: true,
      started: true,
      screen: snapshot.minuteOfDay >= 1080 ? "summary" : "cafe",
      specialOpen: snapshot.minuteOfDay < 1080 && snapshot.dailySpecial === null,
      lastSpawnMinute: snapshot.minuteOfDay - 10,
      toast: offlineDrinks ? `Welcome back! The cats earned ${offlineDrinks * 2} coins.` : null,
      player: {
        ...snapshot.player,
        coins: snapshot.player.coins + offlineDrinks * 2,
        totalCoinsEarned: snapshot.player.totalCoinsEarned + offlineDrinks * 2,
      },
    }
  }),
  setScreen: (screen) => set(() => ({ screen })),
  tick: () => set((state) => {
    if (!state.started || state.screen !== "cafe" || state.activeOrderId || state.specialOpen || state.dialogue || state.minuteOfDay >= 1080) return {}
    const minuteOfDay = state.minuteOfDay + 1
    const waiting = state.activeCustomers
      .map((customer) => customer.status === "waiting"
        ? { ...customer, patience: customer.patience - 1 }
        : customer.status === "served" ? { ...customer, cleanupRemaining: (customer.cleanupRemaining ?? 1) - 1 } : customer)
      .filter((customer) => customer.status === "served" ? (customer.cleanupRemaining ?? 0) > 0 : customer.patience > 0)
    const leftCount = state.activeCustomers.filter((customer) => customer.status === "waiting" && customer.patience <= 1).length
    if (minuteOfDay >= 1080) {
      return { minuteOfDay: 1080, activeCustomers: waiting, screen: "summary", toast: "The last cup is washed. Time to close.", lastSaved: new Date().toISOString() }
    }
    const phase = getTimePhase(minuteOfDay)
    const baseChance = spawnChanceByPhase[phase]
    const weatherFactor = state.weather === "sunny" ? 1.1 : state.weather === "stormy" ? 0.7 : 1
    const decorationAttraction = getDecorationBonuses(state.cafe.decorations).attract
    const capacity = getCafeCapacity(state.cafe.decorations)
    const spawnGap = minuteOfDay - state.lastSpawnMinute
    const forcedSpawn = spawnGap >= MAX_SPAWN_GAP
    const shouldSpawn = waiting.length < capacity && spawnGap >= MIN_SPAWN_GAP && (Math.random() < baseChance * weatherFactor * (1 + decorationAttraction) || forcedSpawn)
    let activeCustomers = waiting
    let lastSpawnMinute = state.lastSpawnMinute
    if (shouldSpawn) {
      const activeIds = new Set(waiting.map((customer) => customer.customerId))
      const available = customers.filter((customer) => customer.unlockLevel <= state.progression.level && !activeIds.has(customer.id))
      const eligible = forcedSpawn
        ? available
        : available.filter((customer) => Math.random() <= customer.visitFrequency && (customer.preferredTimes.includes(phase) || Math.random() < 0.2))
      const selected = eligible[Math.floor(Math.random() * eligible.length)]
      if (selected) {
        const nextCustomer = makeCustomer({ ...state, minuteOfDay } as GameState, selected.id)
        if (nextCustomer) {
          activeCustomers = [...waiting, nextCustomer]
          lastSpawnMinute = minuteOfDay
        }
      }
    }
    return {
      minuteOfDay,
      activeCustomers,
      lastSpawnMinute,
      player: { ...state.player, playTimeMinutes: state.player.playTimeMinutes + 1 / 60 },
      toast: leftCount ? "A customer slipped out before ordering." : state.toast,
    }
  }),
  spawnCustomer: (customerId = "mei", recipeId) => set((state) => {
    if (state.activeCustomers.length >= getCafeCapacity(state.cafe.decorations) || !customerById[customerId]) return {}
    const customer = makeCustomer(state, customerId, recipeId)
    if (!customer) return { toast: "The pantry cannot make that order right now." }
    return { activeCustomers: [...state.activeCustomers, customer], lastSpawnMinute: state.minuteOfDay }
  }),
  acceptOrder: (orderId) => set((state) => {
    if (state.activeOrderId) return {}
    const order = state.activeCustomers.find((customer) => customer.id === orderId && customer.status === "waiting")
    if (!order || !canMakeRecipe(state, order.recipeId)) return { toast: "That order needs a quick pantry restock." }
    const inventory = { ...state.inventory }
    for (const requirement of recipeById[order.recipeId].ingredients) inventory[requirement.ingredientId] -= requirement.quantity
    return {
      inventory,
      activeOrderId: orderId,
      activeCustomers: state.activeCustomers.map((customer) => customer.id === orderId ? { ...customer, status: "preparing" } : customer),
      lastSaved: new Date().toISOString(),
    }
  }),
  recordMinigameResult: (result) => set((state) => {
    const order = state.activeCustomers.find((customer) => customer.id === state.activeOrderId)
    if (!order) return { activeOrderId: null }
    const recipe = recipeById[order.recipeId]
    const results = [...order.results, result]
    if (results.length < recipe.minigames.length) {
      return { activeCustomers: state.activeCustomers.map((customer) => customer.id === order.id ? { ...customer, results, minigameStep: customer.minigameStep + 1 } : customer) }
    }

    const definition = customerById[order.customerId]
    const equipmentBonus = results.reduce((bonus, minigame) => {
      if (minigame.type === "espresso" && state.cafe.equipment.espressoMachine > 1) return bonus + 0.04
      if (minigame.type === "milk" && state.cafe.equipment.milkFrother > 1) return bonus + 0.04
      if (minigame.type === "grind" && state.cafe.equipment.grinder > 1) return bonus + 0.04
      if (minigame.type === "cold" && state.cafe.equipment.coldBrewStation > 0) return bonus + 0.03
      return bonus
    }, 0)
    const milestoneBonus = state.progression.milestones.includes("experienced-barista") ? 0.05 : 0
    const score = scoreDrink(results, getCatStrength(state, "barista") + equipmentBonus / results.length + milestoneBonus)
    const bonuses = getDecorationBonuses(state.cafe.decorations)
    const preference = definition.favoriteDrinks.includes(recipe.id) ? "favorite" : definition.dislikedDrinks.includes(recipe.id) ? "disliked" : "neutral"
    const sale = calculateSale(recipe, score, {
      preference,
      patienceRatio: order.patience / order.maxPatience,
      tipBonus: bonuses.tips + (cats[0].unlockLevel <= state.progression.level ? 0.05 : 0),
      reputationBonus: bonuses.reputation,
      isDailySpecial: state.dailySpecial === recipe.id,
    })
    const earned = sale.revenue + sale.tip
    const previousHistory = state.recipeHistory[recipe.id]
    const nextCount = (previousHistory?.timesServed ?? 0) + 1
    const previousAverage = previousHistory?.averageQuality ?? 0
    const dialogueEvent = definition.storyline.find((event) => event.loyalty === Math.min(5, (state.customerLoyalty[definition.id] ?? 0) + (sale.satisfaction >= 0.9 ? 1 : 0)))
    const dialogueAlreadySeen = dialogueEvent && state.dialogueSeen[definition.id]?.includes(dialogueEvent.text)
    const inventory = { ...state.inventory }
    const rewardRecipes: string[] = []
    const ownedDecorations = { ...state.cafe.ownedDecorations }
    const bestDrink = !state.dailyStats.bestDrink || score.averageAccuracy > state.dailyStats.bestDrink.accuracy
      ? { name: recipe.name, quality: score.quality, accuracy: score.averageAccuracy }
      : state.dailyStats.bestDrink
    const totalDrinksServed = state.player.totalDrinksServed + 1
    const totalCoinsEarned = state.player.totalCoinsEarned + earned
    const totalLatteArts = state.player.totalLatteArts + (results.some((item) => item.type === "latteArt") ? 1 : 0)
    const perfectArt = results.some((item) => item.type === "latteArt" && item.accuracy >= 0.9)
    const totalPerfectLatteArts = state.player.totalPerfectLatteArts + (perfectArt ? 1 : 0)
    const milestones = [...state.progression.milestones]
    if (totalDrinksServed >= 100 && !milestones.includes("experienced-barista")) milestones.push("experienced-barista")
    if (totalCoinsEarned >= 1000 && !milestones.includes("business-savvy")) milestones.push("business-savvy")
    if (totalPerfectLatteArts >= 10 && !milestones.includes("cat-face-art")) milestones.push("cat-face-art")
    let rewardReputation = 0
    if (dialogueEvent?.reward && !dialogueAlreadySeen) {
      const decorationRewards: Record<string, string> = { "Vintage Bookshelf": "bookshelf", "Vintage Clock": "wall-clock", "Art Gallery Set": "framed-art" }
      const decorationReward = decorationRewards[dialogueEvent.reward]
      if (decorationReward) ownedDecorations[decorationReward] = (ownedDecorations[decorationReward] ?? 0) + 1
      if (dialogueEvent.reward === "Grandma's Hot Chocolate") rewardRecipes.push("grandmas-hot-chocolate")
      if (dialogueEvent.reward === "Bakery Deliveries") inventory["whipped-cream"] = (inventory["whipped-cream"] ?? 0) + 3
      if (dialogueEvent.reward === "Five-star Review") rewardReputation = 15
      const milestoneId = dialogueEvent.reward.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      if (!milestones.includes(milestoneId)) milestones.push(milestoneId)
    }
    const reputation = state.progression.reputation + sale.reputation + rewardReputation
    const level = getReputationLevel(reputation)
    const newlyDiscovered = [...getUnlockedRecipes(level).map((item) => item.id), ...rewardRecipes].filter((id, index, list) => !state.discoveredRecipes.includes(id) && list.indexOf(id) === index)
    return {
      inventory,
      activeOrderId: null,
      activeCustomers: state.activeCustomers.map((customer) => customer.id === order.id ? { ...customer, status: "served", cleanupRemaining: Math.max(1, Math.round(4 * (1 - getCatStrength(state, "janitor")))) } : customer),
      discoveredRecipes: [...state.discoveredRecipes, ...newlyDiscovered],
      recipeHistory: {
        ...state.recipeHistory,
        [recipe.id]: {
          bestQuality: Math.max(previousHistory?.bestQuality ?? 0, score.averageAccuracy),
          timesServed: nextCount,
          averageQuality: (previousAverage * (nextCount - 1) + score.averageAccuracy) / nextCount,
        },
      },
      player: {
        ...state.player,
        coins: state.player.coins + earned,
        totalCoinsEarned,
        totalDrinksServed,
        totalPerfectDrinks: state.player.totalPerfectDrinks + (score.quality === "perfect" ? 1 : 0),
        totalLatteArts,
        totalPerfectLatteArts,
      },
      cafe: { ...state.cafe, ownedDecorations },
      progression: { ...state.progression, reputation, level, milestones },
      customerLoyalty: { ...state.customerLoyalty, [definition.id]: Math.min(5, (state.customerLoyalty[definition.id] ?? 0) + (sale.satisfaction >= 0.9 ? 1 : 0)) },
      customerVisits: { ...state.customerVisits, [definition.id]: (state.customerVisits[definition.id] ?? 0) + 1 },
      dialogueSeen: dialogueEvent && !dialogueAlreadySeen ? { ...state.dialogueSeen, [definition.id]: [...(state.dialogueSeen[definition.id] ?? []), dialogueEvent.text] } : state.dialogueSeen,
      dialogue: dialogueEvent && !dialogueAlreadySeen ? { customerId: definition.id, text: dialogueEvent.text, reward: dialogueEvent.reward } : null,
      dailyStats: {
        customersServed: state.dailyStats.customersServed + 1,
        revenue: state.dailyStats.revenue + sale.revenue,
        tips: state.dailyStats.tips + sale.tip,
        reputation: state.dailyStats.reputation + sale.reputation + rewardReputation,
        bestDrink,
        recipesDiscovered: [...state.dailyStats.recipesDiscovered, ...newlyDiscovered],
      },
      toast: `${recipe.name}: ${score.quality}! +${earned} coins`,
      lastSaved: new Date().toISOString(),
    }
  }),
  chooseDailySpecial: (recipeId) => set((state) => {
    if (!state.discoveredRecipes.includes(recipeId) || !canMakeRecipe(state, recipeId)) return { toast: "Restock this recipe before putting it on the chalkboard." }
    const openingGuest = state.progression.dayNumber === 1 && state.activeCustomers.length === 0 ? makeCustomer(state, "mei", "americano") : null
    const activeCustomers = openingGuest ? [openingGuest] : state.activeCustomers
    return { dailySpecial: recipeId, specialOpen: false, activeCustomers, toast: `${recipeById[recipeId].name} is today's special.`, lastSaved: new Date().toISOString() }
  }),
  skipDailySpecial: () => set(() => ({ dailySpecial: null, specialOpen: false, toast: "The chalkboard is resting today.", lastSaved: new Date().toISOString() })),
  purchaseIngredient: (ingredientId) => set((state) => {
    const ingredient = ingredientById[ingredientId]
    const isOnSale = getDailySaleIngredientIds(state.progression.dayNumber).includes(ingredientId)
    const price = isOnSale ? Math.max(1, Math.ceil(ingredient.cost / 2)) : ingredient?.cost
    if (!ingredient || state.player.coins < price) return { toast: "Not enough coins for that ingredient." }
    return { player: { ...state.player, coins: state.player.coins - price }, inventory: { ...state.inventory, [ingredientId]: (state.inventory[ingredientId] ?? 0) + 3 }, toast: `Restocked ${ingredient.name}.`, lastSaved: new Date().toISOString() }
  }),
  purchaseDecoration: (decorationId) => set((state) => {
    const item = decorationById[decorationId]
    if (!item || item.unlockLevel > state.progression.level) return {}
    if (state.player.coins < item.cost) return { toast: "Not enough coins for that piece." }
    return { player: { ...state.player, coins: state.player.coins - item.cost }, cafe: { ...state.cafe, ownedDecorations: { ...state.cafe.ownedDecorations, [decorationId]: (state.cafe.ownedDecorations[decorationId] ?? 0) + 1 } }, toast: `${item.name} added to storage.`, lastSaved: new Date().toISOString() }
  }),
  purchaseEquipment: (equipmentId) => set((state) => {
    const upgrade = equipmentUpgrades.find((item) => item.id === equipmentId)
    if (!upgrade || upgrade.unlockLevel > state.progression.level) return {}
    const currentLevel = state.cafe.equipment[equipmentId]
    if (currentLevel >= upgrade.maxLevel) return { toast: `${upgrade.name} is already fully upgraded.` }
    if (state.player.coins < upgrade.cost) return { toast: "The cafe tin is a little light for that upgrade." }
    return {
      player: { ...state.player, coins: state.player.coins - upgrade.cost },
      cafe: { ...state.cafe, equipment: { ...state.cafe.equipment, [equipmentId]: currentLevel + 1 } },
      toast: `${upgrade.name} installed.`,
      lastSaved: new Date().toISOString(),
    }
  }),
  placeDecoration: (decorationId, gridX, gridY) => set((state) => {
    const definition = decorationById[decorationId]
    if (!definition || !(state.cafe.ownedDecorations[decorationId] > 0)) return { toast: "Buy or store this item before placing it." }
    if (!canPlaceDecoration({ gridX, gridY, width: definition.size.width, height: definition.size.height }, state.cafe.decorations)) return { toast: "That spot needs a little more room." }
    const placed: PlacedDecoration = { id: `${decorationId}-${Date.now()}`, decorationId, gridX, gridY, rotation: 0 }
    return { cafe: { ...state.cafe, decorations: [...state.cafe.decorations, placed], ownedDecorations: { ...state.cafe.ownedDecorations, [decorationId]: state.cafe.ownedDecorations[decorationId] - 1 } }, toast: `${definition.name} placed.`, lastSaved: new Date().toISOString() }
  }),
  removeDecoration: (placedId) => set((state) => {
    const placed = state.cafe.decorations.find((item) => item.id === placedId)
    if (!placed) return {}
    return { cafe: { ...state.cafe, decorations: state.cafe.decorations.filter((item) => item.id !== placedId), ownedDecorations: { ...state.cafe.ownedDecorations, [placed.decorationId]: (state.cafe.ownedDecorations[placed.decorationId] ?? 0) + 1 } }, toast: "Decoration returned to storage.", lastSaved: new Date().toISOString() }
  }),
  petCat: (catId) => set((state) => {
    const cat = cats.find((item) => item.id === catId)
    if (!cat || cat.unlockLevel > state.progression.level) return {}
    const reactions = ["purrs like a tiny espresso machine", "rolls over dramatically", "offers a very slow blink", "chirps and bumps your hand"]
    return { catHappiness: { ...state.catHappiness, [catId]: Math.min(100, (state.catHappiness[catId] ?? 70) + 5) }, catFriendship: { ...state.catFriendship, [catId]: Math.min(100, (state.catFriendship[catId] ?? 0) + 3) }, toast: `${cat.name} ${reactions[Math.floor(Math.random() * reactions.length)]}.`, lastSaved: new Date().toISOString() }
  }),
  finishDay: () => set(() => ({ screen: "summary", minuteOfDay: 1080, activeOrderId: null, lastSaved: new Date().toISOString() })),
  startNextDay: () => set((state) => {
    const next = createNextDay(withoutActions(state))
    if (next.progression.dayNumber >= 8 && !next.progression.milestones.includes("dedicated-owner")) {
      next.progression.milestones = [...next.progression.milestones, "dedicated-owner"]
      next.cafe.ownedDecorations = { ...next.cafe.ownedDecorations, "framed-art": (next.cafe.ownedDecorations["framed-art"] ?? 0) + 1 }
    }
    return { ...next, screen: "cafe", minuteOfDay: 360, activeCustomers: [], activeOrderId: null, specialOpen: true, dialogue: null, lastSpawnMinute: 345 }
  }),
  updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings }, lastSaved: new Date().toISOString() })),
  dismissDialogue: () => set(() => ({ dialogue: null, lastSaved: new Date().toISOString() })),
  clearToast: () => set(() => ({ toast: null })),
})

export const gameStore = createStore<GameState>()((set, get) => ({
  ...createInitialSnapshot(),
  ...runtimeDefaults,
  ...createActions(set, get),
}))

export const useGameStore = <T,>(selector: (state: GameState) => T) => useStore(gameStore, selector)
export const getGameSnapshot = () => withoutActions(gameStore.getState())
