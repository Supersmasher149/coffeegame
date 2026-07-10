import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createInitialSnapshot } from "../systems/gameRules"
import { gameStore } from "../store/gameStore"
import CatCollection from "./CatCollection"
import DecorationScreen from "./DecorationScreen"

describe("management screens", () => {
  beforeEach(() => gameStore.getState().hydrate(createInitialSnapshot()))

  it("places the starter plant on an open grid cell", async () => {
    const user = userEvent.setup()
    render(<DecorationScreen />)
    await user.click(screen.getByRole("button", { name: /row 2 column 2/i }))
    expect(gameStore.getState().cafe.decorations).toHaveLength(1)
    expect(gameStore.getState().cafe.decorations[0]).toMatchObject({ decorationId: "plant-pot", gridX: 1, gridY: 1 })
  })

  it("petting Mochi improves friendship and happiness", async () => {
    const user = userEvent.setup()
    render(<CatCollection />)
    await user.click(screen.getByRole("button", { name: /pet mochi/i }))
    expect(gameStore.getState().catFriendship.mochi).toBe(3)
    expect(gameStore.getState().catHappiness.mochi).toBe(80)
  })
})
