import { cafeLevels, chapters, getCafeLevel, getChapterForLevel, getDifficultyProfile, getUnlockedLocations } from "./progression"

describe("campaign progression", () => {
  it("defines twenty monotonic levels across four five-level chapters", () => {
    expect(cafeLevels).toHaveLength(20)
    expect(chapters).toHaveLength(4)
    expect(chapters.every((chapter) => chapter.endLevel - chapter.startLevel === 4)).toBe(true)
    expect(cafeLevels.every((level, index) => index === 0 || level.reputationRequired > cafeLevels[index - 1].reputationRequired)).toBe(true)
  })

  it("maps chapter and location unlock boundaries", () => {
    expect(getCafeLevel(2449).level).toBe(19)
    expect(getCafeLevel(2450).level).toBe(20)
    expect(getChapterForLevel(11).locationId).toBe("arts-district")
    expect(getUnlockedLocations(5)).toEqual(["willow-square"])
    expect(getUnlockedLocations(16)).toEqual(["willow-square", "riverside-market", "arts-district", "grand-avenue"])
  })

  it("increases pressure gradually while keeping late patience bounded", () => {
    expect(getDifficultyProfile(1)).toMatchObject({ patienceMultiplier: 1, rushMultiplier: 1 })
    expect(getDifficultyProfile(20)).toMatchObject({ patienceMultiplier: 0.85, rushMultiplier: 1.15 })
    expect(getDifficultyProfile(20).complexOrderChance).toBeGreaterThan(getDifficultyProfile(1).complexOrderChance)
  })
})
