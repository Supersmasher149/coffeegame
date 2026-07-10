import type { CafeState } from "../types/game"

export interface EquipmentUpgrade {
  id: keyof CafeState["equipment"]
  name: string
  description: string
  cost: number
  unlockLevel: number
  maxLevel: number
}

export const equipmentUpgrades: EquipmentUpgrade[] = [
  { id: "espressoMachine", name: "Better Espresso Machine", description: "A steadier pressure profile adds a small accuracy bonus to extraction.", cost: 100, unlockLevel: 2, maxLevel: 2 },
  { id: "milkFrother", name: "Milk Frother Pro", description: "A finer steam tip makes silky milk easier to texture.", cost: 80, unlockLevel: 2, maxLevel: 2 },
  { id: "coldBrewStation", name: "Cold Brew Station", description: "A tidy dedicated station improves cold-drink assembly.", cost: 60, unlockLevel: 3, maxLevel: 1 },
  { id: "grinder", name: "Grind Control", description: "More precise burr alignment improves grind-size accuracy.", cost: 70, unlockLevel: 3, maxLevel: 2 },
]
