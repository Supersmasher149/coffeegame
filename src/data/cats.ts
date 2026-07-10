import type { CatDefinition } from "../types/game"

export const cats: CatDefinition[] = [
  { id: "mochi", name: "Mochi", breed: "Round orange tabby", personality: "Social butterfly and committed welcome committee.", color: "#d98445", role: "greeter", passiveAbility: "+15% customer patience", abilityStrength: 0.15, favoriteFood: "Salmon bites", favoriteBed: "Welcome mat", favoriteToy: "Bell ball", unlockLevel: 1 },
  { id: "espresso-cat", name: "Espresso", breed: "Sleek black shorthair", personality: "Focused supervisor of every pulled shot.", color: "#343033", role: "barista", passiveAbility: "+10% minigame accuracy", abilityStrength: 0.1, favoriteFood: "Tuna flakes", favoriteBed: "Espresso machine", favoriteToy: "Cork mouse", unlockLevel: 2 },
  { id: "biscuit", name: "Biscuit", breed: "Fluffy calico", personality: "Tidy, efficient, and quietly judgmental of crumbs.", color: "#c89270", role: "janitor", passiveAbility: "Tables clear 50% faster", abilityStrength: 0.5, favoriteFood: "Chicken treats", favoriteBed: "Counter nook", favoriteToy: "Tiny mop", unlockLevel: 3 },
]

export const catById = Object.fromEntries(cats.map((cat) => [cat.id, cat]))
