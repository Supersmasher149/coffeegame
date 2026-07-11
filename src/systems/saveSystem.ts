import { openDB } from "idb"
import type { GameSnapshot } from "../types/game"
import { createInitialSnapshot } from "./gameRules"
import { getCafeLevel } from "../data/progression"

const DB_NAME = "cozy-coffee-shop"
const STORE_NAME = "saves"
const SAVE_KEY = "primary"

const getDatabase = () => openDB(DB_NAME, 1, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME)
  },
})

export const saveSnapshot = async (snapshot: GameSnapshot) => {
  const database = await getDatabase()
  await database.put(STORE_NAME, { ...snapshot, lastSaved: new Date().toISOString() }, SAVE_KEY)
}

export const migrateSnapshot = (saved: Partial<GameSnapshot>): GameSnapshot => {
  const defaults = createInitialSnapshot()
  const legacyCafe = saved.cafe as (Partial<GameSnapshot["cafe"]> & { unlockedDecorations?: string[] }) | undefined
  const { unlockedDecorations = [], ...savedCafe } = legacyCafe ?? {}
  const migratedDecorations = unlockedDecorations.reduce<Record<string, number>>((owned, decorationId) => {
    owned[decorationId] = (owned[decorationId] ?? 0) + 1
    return owned
  }, {})
  const cafe = {
    ...defaults.cafe,
    ...savedCafe,
    ownedDecorations: { ...defaults.cafe.ownedDecorations, ...migratedDecorations, ...savedCafe.ownedDecorations },
    equipment: { ...defaults.cafe.equipment, ...savedCafe.equipment },
  }
  const inventory = { ...defaults.inventory, ...saved.inventory }
  const player = { ...defaults.player, ...saved.player }
  const activeLocationId = saved.activeLocationId ?? "willow-square"
  const locations = {
    ...defaults.locations,
    ...saved.locations,
    [activeLocationId]: { cafe, inventory, coins: player.coins },
  }
  const reputation = saved.progression?.reputation ?? defaults.progression.reputation
  const level = getCafeLevel(reputation).level
  return {
    ...defaults,
    ...saved,
    version: defaults.version,
    player,
    cafe,
    inventory,
    locations,
    activeLocationId,
    progression: { ...defaults.progression, ...saved.progression, reputation, level },
    dailyStats: { ...defaults.dailyStats, ...saved.dailyStats },
    settings: { ...defaults.settings, ...saved.settings },
  }
}

export const loadSnapshot = async (): Promise<GameSnapshot | null> => {
  const database = await getDatabase()
  const saved = await database.get(STORE_NAME, SAVE_KEY) as Partial<GameSnapshot> | undefined
  if (!saved) return null
  return migrateSnapshot(saved)
}

export const hasSavedGame = async () => Boolean(await loadSnapshot())

export const deleteSave = async () => {
  const database = await getDatabase()
  await database.delete(STORE_NAME, SAVE_KEY)
}
