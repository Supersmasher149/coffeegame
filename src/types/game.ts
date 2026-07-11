export type Quality = "weak" | "good" | "perfect" | "burnt"
export type MinigameType = "espresso" | "milk" | "latteArt" | "grind" | "cold" | "tea"
export type RecipeCategory = "espresso" | "milk" | "cold" | "tea" | "special"
export type IngredientCategory = "bean" | "milk" | "tea" | "syrup" | "chocolate" | "topping"
export type Weather = "sunny" | "cloudy" | "rainy" | "stormy" | "snowy"
export type Season = "spring" | "summer" | "autumn" | "winter"
export type CustomerStatus = "waiting" | "preparing" | "served"
import type { LocationId } from "../data/progression"

export type AppScreen = "cafe" | "map" | "recipes" | "shop" | "cats" | "decorate" | "settings" | "summary"

export interface IngredientRequirement {
  ingredientId: string
  quantity: number
}

export interface Recipe {
  id: string
  name: string
  category: RecipeCategory
  description: string
  ingredients: IngredientRequirement[]
  minigames: MinigameType[]
  basePrice: number
  reputationGain: number
  unlockLevel: number
  difficulty: 1 | 2 | 3
  tags: string[]
  assemblyOrder?: string[]
}

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  quality: 1 | 2 | 3
  origin: string
  cost: number
  shelfLife: number
  seasonal?: Season
}

export interface StoryEvent {
  loyalty: number
  text: string
  reward?: string
}

export interface CustomerDefinition {
  id: string
  name: string
  title: string
  personality: string
  color: string
  avatar: string
  favoriteDrinks: string[]
  dislikedDrinks: string[]
  preferredSeating: "counter" | "table" | "window" | "outdoor"
  patienceBase: number
  visitFrequency: number
  preferredTimes: Array<"morning" | "midday" | "afternoon" | "closing">
  unlockLevel: number
  storyline: StoryEvent[]
}

export interface CatDefinition {
  id: string
  name: string
  breed: string
  personality: string
  color: string
  role: "greeter" | "barista" | "janitor"
  passiveAbility: string
  abilityStrength: number
  favoriteFood: string
  favoriteBed: string
  favoriteToy: string
  unlockLevel: number
}

export interface DecorationEffect {
  type: "patience" | "tips" | "attract" | "cozy" | "catHappiness" | "seating" | "reputation"
  value: number
}

export interface DecorationDefinition {
  id: string
  name: string
  category: "furniture" | "wall" | "plant" | "lighting" | "cat"
  icon: string
  size: { width: number; height: number }
  placement: "floor" | "wall"
  effects: DecorationEffect[]
  cost: number
  unlockLevel: number
  style: string
}

export interface PlacedDecoration {
  id: string
  decorationId: string
  gridX: number
  gridY: number
  rotation: number
}

export interface ActiveCustomer {
  id: string
  customerId: string
  recipeId: string
  status: CustomerStatus
  patience: number
  maxPatience: number
  arrivedAt: number
  minigameStep: number
  results: MinigameResult[]
  cleanupRemaining?: number
}

export interface MinigameResult {
  type: MinigameType
  accuracy: number
  automated?: boolean
}

export interface DrinkScore {
  quality: Quality
  multiplier: number
  averageAccuracy: number
  artBonus: number
}

export interface SaleResult {
  revenue: number
  tip: number
  reputation: number
  satisfaction: number
}

export interface DailyStats {
  customersServed: number
  revenue: number
  tips: number
  reputation: number
  bestDrink: { name: string; quality: Quality; accuracy: number } | null
  recipesDiscovered: string[]
}

export interface PlayerState {
  name: string
  coins: number
  totalCoinsEarned: number
  totalDrinksServed: number
  totalPerfectDrinks: number
  totalLatteArts: number
  totalPerfectLatteArts: number
  playTimeMinutes: number
}

export interface CafeState {
  name: string
  decorations: PlacedDecoration[]
  ownedDecorations: Record<string, number>
  equipment: Record<"espressoMachine" | "milkFrother" | "coldBrewStation" | "grinder", number>
}

export interface CafeLocationState {
  cafe: CafeState
  inventory: Record<string, number>
  coins: number
}

export interface ProgressionState {
  reputation: number
  level: number
  dayNumber: number
  season: Season
  seasonDay: number
  milestones: string[]
  finaleStatus: "locked" | "available" | "active" | "completed"
}

export interface SettingsState {
  musicVolume: number
  sfxVolume: number
  ambienceVolume: number
  showTutorial: boolean
  autoSave: boolean
  reducedMotion: boolean
}

export interface GameSnapshot {
  version: number
  lastSaved: string
  player: PlayerState
  cafe: CafeState
  locations: Record<LocationId, CafeLocationState>
  activeLocationId: LocationId
  inventory: Record<string, number>
  discoveredRecipes: string[]
  recipeHistory: Record<string, { bestQuality: number; timesServed: number; averageQuality: number }>
  customerLoyalty: Record<string, number>
  customerVisits: Record<string, number>
  dialogueSeen: Record<string, string[]>
  catHappiness: Record<string, number>
  catFriendship: Record<string, number>
  catLevels: Record<string, number>
  progression: ProgressionState
  weather: Weather
  nextWeather: Weather
  dailySpecial: string | null
  dailyStats: DailyStats
  settings: SettingsState
  minuteOfDay: number
  activeCustomers: ActiveCustomer[]
  activeOrderId: string | null
  dialogue: { customerId: string; text: string; reward?: string } | null
}
