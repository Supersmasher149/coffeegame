import { recipes } from "../data/recipes"
import { calculateSale, canPlaceDecoration, createInitialSnapshot, createNextDay, getCafeCapacity, getReputationLevel, scoreDrink } from "./gameRules"

describe("game rules", () => {
  it("maps reputation thresholds to levels", () => {
    expect(getReputationLevel(49)).toBe(1)
    expect(getReputationLevel(50)).toBe(2)
    expect(getReputationLevel(150)).toBe(3)
    expect(getReputationLevel(1000)).toBe(6)
  })

  it("scores drink accuracy and rewards a perfect favorite", () => {
    const score = scoreDrink([{ type: "espresso", accuracy: 0.95 }])
    const sale = calculateSale(recipes[0], score, { preference: "favorite", patienceRatio: 1, tipBonus: 0, reputationBonus: 0, isDailySpecial: true })
    expect(score.quality).toBe("perfect")
    expect(sale.revenue).toBe(4)
    expect(sale.tip).toBeGreaterThan(0)
    expect(sale.reputation).toBeGreaterThan(recipes[0].reputationGain)
  })

  it("prevents out-of-bounds, blocked, and overlapping decoration placement", () => {
    expect(canPlaceDecoration({ gridX: 2, gridY: 2, width: 2, height: 2 }, [])).toBe(true)
    expect(canPlaceDecoration({ gridX: 7, gridY: 5, width: 2, height: 2 }, [])).toBe(false)
    expect(canPlaceDecoration({ gridX: 0, gridY: 5, width: 1, height: 1 }, [])).toBe(false)
    expect(canPlaceDecoration({ gridX: 2, gridY: 2, width: 1, height: 1 }, [{ id: "table", decorationId: "wooden-table", gridX: 2, gridY: 2, rotation: 0 }])).toBe(false)
  })

  it("rolls spring day seven into summer day one", () => {
    const snapshot = createInitialSnapshot()
    snapshot.progression.seasonDay = 7
    const next = createNextDay(snapshot)
    expect(next.progression.season).toBe("summer")
    expect(next.progression.seasonDay).toBe(1)
    expect(next.progression.dayNumber).toBe(2)
  })

  it("turns seating furniture into cafe capacity up to the MVP maximum", () => {
    expect(getCafeCapacity([])).toBe(2)
    expect(getCafeCapacity([{ id: "stool-1", decorationId: "counter-stool", gridX: 2, gridY: 2, rotation: 0 }])).toBe(3)
    expect(getCafeCapacity([
      { id: "stool-1", decorationId: "counter-stool", gridX: 2, gridY: 2, rotation: 0 },
      { id: "stool-2", decorationId: "counter-stool", gridX: 3, gridY: 2, rotation: 0 },
      { id: "table", decorationId: "wooden-table", gridX: 4, gridY: 2, rotation: 0 },
    ])).toBe(4)
  })
})
