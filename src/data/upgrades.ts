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
  { id: "espressoMachine", name: "Better Espresso Machine", description: "Improves manual extraction and assists routine shots in practiced recipes at level 2.", cost: 100, unlockLevel: 2, maxLevel: 2 },
  { id: "milkFrother", name: "Milk Frother Pro", description: "Improves manual steaming and assists routine milk steps in practiced recipes at level 2.", cost: 80, unlockLevel: 2, maxLevel: 2 },
  { id: "coldBrewStation", name: "Cold Brew Station", description: "Improves cold assembly and assists routine assembly when another step remains manual.", cost: 60, unlockLevel: 3, maxLevel: 1 },
  { id: "grinder", name: "Grind Control", description: "Improves manual grinding and assists routine grinds in practiced recipes at level 2.", cost: 70, unlockLevel: 3, maxLevel: 2 },
]
