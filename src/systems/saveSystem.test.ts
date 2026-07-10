import { createInitialSnapshot } from "./gameRules"
import { migrateSnapshot } from "./saveSystem"

describe("save migration", () => {
  it("upgrades version-one snapshots and fills new runtime fields", () => {
    const oldSave = createInitialSnapshot() as Partial<ReturnType<typeof createInitialSnapshot>>
    oldSave.version = 1
    delete oldSave.dialogue
    delete oldSave.activeCustomers
    const migrated = migrateSnapshot(oldSave)
    expect(migrated.version).toBe(2)
    expect(migrated.dialogue).toBeNull()
    expect(migrated.activeCustomers).toEqual([])
    expect(migrated.player.totalPerfectLatteArts).toBe(0)
  })
})
