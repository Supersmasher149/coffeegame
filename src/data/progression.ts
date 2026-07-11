export type LocationId = "willow-square" | "riverside-market" | "arts-district" | "grand-avenue"

export interface ChapterDefinition {
  id: string
  name: string
  locationId: LocationId
  locationName: string
  startLevel: number
  endLevel: number
  description: string
  accent: string
}

export interface CafeLevelDefinition {
  level: number
  reputationRequired: number
  name: string
  chapterId: string
  majorUnlock: string
  difficultyBand: 1 | 2 | 3 | 4
}

export interface DifficultyProfile {
  patienceMultiplier: number
  rushMultiplier: number
  complexOrderChance: number
  qualityRequestChance: number
}

export const chapters: ChapterDefinition[] = [
  { id: "first-pour", name: "First Pour", locationId: "willow-square", locationName: "Willow Square", startLevel: 1, endLevel: 5, description: "A forgiving corner where regulars become friends.", accent: "#b86f52" },
  { id: "across-the-river", name: "Across the River", locationId: "riverside-market", locationName: "Riverside Market", startLevel: 6, endLevel: 10, description: "Market crowds bring tea, cold drinks, and brisk mornings.", accent: "#547e82" },
  { id: "creative-grounds", name: "Creative Grounds", locationId: "arts-district", locationName: "Arts District", startLevel: 11, endLevel: 15, description: "Craft, latte art, and exacting creative customers.", accent: "#86658c" },
  { id: "five-star-dreams", name: "Five-Star Dreams", locationId: "grand-avenue", locationName: "Grand Avenue", startLevel: 16, endLevel: 20, description: "Premium service on the road to a five-star review.", accent: "#a7833f" },
]

const thresholds = [0, 35, 80, 135, 200, 280, 370, 470, 580, 700, 830, 970, 1120, 1280, 1450, 1630, 1820, 2020, 2230, 2450]
const names = [
  "Corner Cart", "Coffee Counter", "Warm Welcome", "Neighborhood Nook", "Willow Favorite",
  "Market Newcomer", "Riverside Brewer", "Morning Fixture", "Market Standout", "River Landmark",
  "Studio Cafe", "Creative Pour", "Craft Specialist", "Gallery Favorite", "District Destination",
  "Grand Avenue Debut", "Premium House", "VIP Retreat", "Critic's Choice", "Five-Star Cafe",
]
const unlocks = [
  "Espresso and neighborhood regulars", "Milk steaming", "Mochi joins the crew", "Tea and cocoa recipes", "Willow Square expansion",
  "Riverside Market cafe", "Cold drinks and grinding", "Market suppliers", "Tea latte collection", "Riverside signature service",
  "Arts District cafe", "Advanced latte art", "Espresso joins the crew", "Station assistance", "VIP customers",
  "Grand Avenue cafe", "Premium ingredients", "Biscuit joins the crew", "Five-star review invitation", "Five-star review finale",
]

export const cafeLevels: CafeLevelDefinition[] = thresholds.map((reputationRequired, index) => {
  const level = index + 1
  const difficultyBand = Math.min(4, Math.ceil(level / 5)) as 1 | 2 | 3 | 4
  return { level, reputationRequired, name: names[index], chapterId: chapters[difficultyBand - 1].id, majorUnlock: unlocks[index], difficultyBand }
})

export const getCafeLevel = (reputation: number) => {
  for (let index = cafeLevels.length - 1; index >= 0; index -= 1) {
    if (reputation >= cafeLevels[index].reputationRequired) return cafeLevels[index]
  }
  return cafeLevels[0]
}

export const getChapterForLevel = (level: number) => chapters.find((chapter) => level >= chapter.startLevel && level <= chapter.endLevel) ?? chapters[chapters.length - 1]
export const getChapterForLocation = (locationId: LocationId) => chapters.find((chapter) => chapter.locationId === locationId) ?? chapters[0]
export const getUnlockedLocations = (level: number) => chapters.filter((chapter) => level >= chapter.startLevel).map((chapter) => chapter.locationId)
export const getDifficultyProfile = (level: number): DifficultyProfile => {
  const band = cafeLevels[Math.max(0, Math.min(19, level - 1))].difficultyBand
  return [
    { patienceMultiplier: 1, rushMultiplier: 1, complexOrderChance: 0.15, qualityRequestChance: 0 },
    { patienceMultiplier: 0.95, rushMultiplier: 1.05, complexOrderChance: 0.3, qualityRequestChance: 0.08 },
    { patienceMultiplier: 0.9, rushMultiplier: 1.1, complexOrderChance: 0.48, qualityRequestChance: 0.16 },
    { patienceMultiplier: 0.85, rushMultiplier: 1.15, complexOrderChance: 0.65, qualityRequestChance: 0.25 },
  ][band - 1]
}
