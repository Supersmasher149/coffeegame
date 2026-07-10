import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createInitialSnapshot } from "../systems/gameRules"
import { gameStore } from "../store/gameStore"
import DaySummary from "./DaySummary"

describe("day summary", () => {
  it("moves from spring day seven to summer day one", async () => {
    const snapshot = createInitialSnapshot()
    snapshot.progression.dayNumber = 7
    snapshot.progression.seasonDay = 7
    gameStore.getState().hydrate(snapshot)
    const user = userEvent.setup()
    render(<DaySummary />)
    await user.click(screen.getByRole("button", { name: /start day 8/i }))
    expect(gameStore.getState().progression.season).toBe("summer")
    expect(gameStore.getState().progression.seasonDay).toBe(1)
    expect(gameStore.getState().progression.milestones).toContain("dedicated-owner")
  })
})
