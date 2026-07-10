import { cats } from "../data/cats"
import { customers } from "../data/customers"
import { decorations, decorationById } from "../data/decorations"
import { ingredients } from "../data/ingredients"
import { getUnlockedRecipes } from "../data/recipes"
import type {
  DrinkScore,
  GameSnapshot,
  MinigameResult,
  PlacedDecoration,
  Recipe,
  SaleResult,
  Season,
  Weather,
} from "../types/game"

export const REPUTATION_LEVELS = [0, 50, 150, 350, 600, 1000] as const
export const REPUTATION_NAMES = ["Neighborhood Cart", "Small Cafe", "Popular Coffee Shop", "Local Favorite", "City Landmark", "Famous Destination"] as const
export const seasons: Season[] = ["spring", "summer", "autumn", "winter"]

export const getReputationLevel = (reputation: number) => {
  for (let index = REPUTATION_LEVELS.length - 1; index >= 0; index -= 1) {
    if (reputation >= REPUTATION_LEVELS[index]) return index + 1
  }
  return 1
}

export const getTimePhase = (minuteOfDay: number) => {
  if (minuteOfDay < 600) return "morning" as const
  if (minuteOfDay < 840) return "midday" as const
  if (minuteOfDay < 1020) return "afternoon" as const
  return "closing" as const
}

export const formatGameTime = (minuteOfDay: number) => {
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60
  const suffix = hours >= 12 ? "PM" : "AM"
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${suffix}`
}

export const scoreDrink = (results: MinigameResult[], accuracyBonus = 0): DrinkScore => {
  const averageAccuracy = results.length
    ? Math.min(1, results.reduce((sum, result) => sum + result.accuracy, 0) / results.length + accuracyBonus)
    : 0.5
  const artAccuracy = results.find((result) => result.type === "latteArt")?.accuracy ?? 0
  const quality = averageAccuracy >= 0.87 ? "perfect" : averageAccuracy >= 0.55 ? "good" : "weak"
  return {
    quality,
    multiplier: quality === "perfect" ? 1.3 : quality === "good" ? 1 : 0.7,
    averageAccuracy,
    artBonus: artAccuracy >= 0.9 ? 0.5 : artAccuracy >= 0.7 ? 0.2 : 0,
  }
}

export interface SaleModifiers {
  preference: "favorite" | "neutral" | "disliked"
  patienceRatio: number
  tipBonus: number
  reputationBonus: number
  isDailySpecial: boolean
}

export const calculateSale = (recipe: Recipe, score: DrinkScore, modifiers: SaleModifiers): SaleResult => {
  const preferenceMultiplier = modifiers.preference === "favorite" ? 1 : modifiers.preference === "disliked" ? 0.4 : 0.7
  const patienceMultiplier = 0.7 + Math.max(0, Math.min(1, modifiers.patienceRatio)) * 0.3
  const satisfaction = score.multiplier * (1 + score.artBonus) * preferenceMultiplier * patienceMultiplier
  const revenue = Math.max(1, Math.round(recipe.basePrice * score.multiplier))
  const baseTip = score.quality === "perfect" ? 2 : score.quality === "good" && satisfaction >= 0.72 ? 1 : 0
  const tip = Math.max(0, Math.round((baseTip + score.artBonus * 4) * (1 + modifiers.tipBonus)))
  const reputation = Math.max(0, Math.round(recipe.reputationGain * satisfaction + modifiers.reputationBonus + (modifiers.isDailySpecial && score.quality === "perfect" ? 2 : 0)))
  return { revenue, tip, reputation, satisfaction }
}

interface PlacementCandidate {
  gridX: number
  gridY: number
  width: number
  height: number
}

const occupiedCellsFor = (placed: PlacedDecoration[]) => {
  const occupied = new Set<string>()
  for (const item of placed) {
    const definition = decorationById[item.decorationId]
    if (!definition) continue
    for (let x = item.gridX; x < item.gridX + definition.size.width; x += 1) {
      for (let y = item.gridY; y < item.gridY + definition.size.height; y += 1) occupied.add(`${x}:${y}`)
    }
  }
  return occupied
}

export const canPlaceDecoration = (
  candidate: PlacementCandidate,
  placed: PlacedDecoration[],
  blockedCells = new Set(["0:5", "1:5", "6:0", "7:0"]),
) => {
  if (placed.length >= 20 || candidate.gridX < 0 || candidate.gridY < 0) return false
  if (candidate.gridX + candidate.width > 8 || candidate.gridY + candidate.height > 6) return false
  const occupied = occupiedCellsFor(placed)
  for (let x = candidate.gridX; x < candidate.gridX + candidate.width; x += 1) {
    for (let y = candidate.gridY; y < candidate.gridY + candidate.height; y += 1) {
      if (blockedCells.has(`${x}:${y}`) || occupied.has(`${x}:${y}`)) return false
    }
  }
  return true
}

export const pickWeather = (random = Math.random): Weather => {
  const roll = random()
  if (roll < 0.3) return "sunny"
  if (roll < 0.6) return "cloudy"
  if (roll < 0.8) return "rainy"
  if (roll < 0.9) return "stormy"
  return "snowy"
}

const recordFrom = <T,>(items: { id: string }[], value: T) => Object.fromEntries(items.map((item) => [item.id, value])) as Record<string, T>

export const createInitialSnapshot = (): GameSnapshot => ({
  version: 2,
  lastSaved: new Date().toISOString(),
  player: {
    name: "Barista",
    coins: 35,
    totalCoinsEarned: 0,
    totalDrinksServed: 0,
    totalPerfectDrinks: 0,
    totalLatteArts: 0,
    totalPerfectLatteArts: 0,
    playTimeMinutes: 0,
  },
  cafe: {
    name: "Juniper & Steam",
    decorations: [],
    ownedDecorations: { "plant-pot": 1 },
    equipment: { espressoMachine: 1, milkFrother: 1, coldBrewStation: 0, grinder: 1 },
  },
  inventory: Object.fromEntries(ingredients.map((ingredient) => [ingredient.id, ingredient.seasonal ? 0 : 5])),
  discoveredRecipes: getUnlockedRecipes(1).map((recipe) => recipe.id),
  recipeHistory: {},
  customerLoyalty: recordFrom(customers, 0),
  customerVisits: recordFrom(customers, 0),
  dialogueSeen: recordFrom(customers, [] as string[]),
  catHappiness: recordFrom(cats, 75),
  catFriendship: recordFrom(cats, 0),
  catLevels: recordFrom(cats, 1),
  progression: { reputation: 0, level: 1, dayNumber: 1, season: "spring", seasonDay: 1, milestones: [] },
  weather: "sunny",
  nextWeather: "cloudy",
  dailySpecial: null,
  dailyStats: { customersServed: 0, revenue: 0, tips: 0, reputation: 0, bestDrink: null, recipesDiscovered: [] },
  settings: { musicVolume: 0.3, sfxVolume: 0.65, ambienceVolume: 0.2, showTutorial: true, autoSave: true, reducedMotion: false },
  minuteOfDay: 360,
  activeCustomers: [],
  activeOrderId: null,
  dialogue: null,
})

export const createNextDay = (snapshot: GameSnapshot): GameSnapshot => {
  const seasonRolls = snapshot.progression.seasonDay >= 7
  const seasonIndex = seasons.indexOf(snapshot.progression.season)
  return {
    ...snapshot,
    lastSaved: new Date().toISOString(),
    progression: {
      ...snapshot.progression,
      dayNumber: snapshot.progression.dayNumber + 1,
      season: seasonRolls ? seasons[(seasonIndex + 1) % seasons.length] : snapshot.progression.season,
      seasonDay: seasonRolls ? 1 : snapshot.progression.seasonDay + 1,
    },
    weather: snapshot.nextWeather,
    nextWeather: pickWeather(),
    dailySpecial: null,
    dailyStats: { customersServed: 0, revenue: 0, tips: 0, reputation: 0, bestDrink: null, recipesDiscovered: [] },
    minuteOfDay: 360,
    activeCustomers: [],
    activeOrderId: null,
    dialogue: null,
  }
}

export const getDecorationBonuses = (placed: PlacedDecoration[]) => {
  const bonuses = { patience: 0, tips: 0, reputation: 0, catHappiness: 0, seating: 0, cozy: 0, attract: 0 }
  for (const item of placed) {
    const definition = decorationById[item.decorationId]
    for (const effect of definition?.effects ?? []) {
      if (effect.type in bonuses) bonuses[effect.type as keyof typeof bonuses] += effect.value
    }
  }
  return bonuses
}

export const getUnlockedDecorations = (level: number) => decorations.filter((decoration) => decoration.unlockLevel <= level)

export const getCafeCapacity = (placed: PlacedDecoration[]) => Math.min(4, 2 + Math.floor(getDecorationBonuses(placed).seating))

export const getDailySaleIngredientIds = (dayNumber: number) => {
  const available = ingredients.filter((ingredient) => !ingredient.seasonal)
  return Array.from({ length: 3 }, (_, offset) => available[(dayNumber * 5 + offset * 7) % available.length].id)
}
