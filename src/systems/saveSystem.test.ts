import { createInitialSnapshot } from "./gameRules"
import { migrateSnapshot } from "./saveSystem"

describe("save migration", () => {
  it("upgrades version-one snapshots and fills new runtime fields", () => {
    const oldSave = createInitialSnapshot() as Partial<ReturnType<typeof createInitialSnapshot>>
    oldSave.version = 1
    delete oldSave.dialogue
    delete oldSave.activeCustomers
    const migrated = migrateSnapshot(oldSave)
    expect(migrated.version).toBe(3)
    expect(migrated.dialogue).toBeNull()
    expect(migrated.activeCustomers).toEqual([])
    expect(migrated.player.totalPerfectLatteArts).toBe(0)
  })

  it("moves a legacy cafe into Willow Square and derives its new level", () => {
    const oldSave = createInitialSnapshot() as Partial<ReturnType<typeof createInitialSnapshot>>
    oldSave.version = 2
    delete oldSave.locations
    delete oldSave.activeLocationId
    oldSave.player = { ...oldSave.player!, coins: 91 }
    oldSave.progression = { ...oldSave.progression!, reputation: 700, level: 5 }

    const migrated = migrateSnapshot(oldSave)

    expect(migrated.activeLocationId).toBe("willow-square")
    expect(migrated.locations["willow-square"].coins).toBe(91)
    expect(migrated.progression.level).toBe(10)
    expect(migrated.progression.finaleStatus).toBe("locked")
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
