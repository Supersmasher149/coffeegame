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

  it("converts legacy unlocked decorations into counted ownership", () => {
    const oldSave = createInitialSnapshot() as Partial<ReturnType<typeof createInitialSnapshot>>
    oldSave.version = 1
    const legacyCafe = oldSave.cafe as typeof oldSave.cafe & { unlockedDecorations?: string[] }
    legacyCafe.unlockedDecorations = ["bookshelf", "bookshelf", "wall-clock"]
    oldSave.cafe = legacyCafe

    const migrated = migrateSnapshot(oldSave)

    expect(migrated.cafe.ownedDecorations).toMatchObject({ "plant-pot": 1, bookshelf: 2, "wall-clock": 1 })
  })
})
