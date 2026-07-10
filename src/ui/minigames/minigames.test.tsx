import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TimingGame from "./TimingGame"

describe("timing minigame", () => {
  it("reports a normalized espresso result when stopped", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<TimingGame type="espresso" onComplete={onComplete} />)
    await user.click(screen.getByRole("button", { name: /stop extraction/i }))
    await vi.waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ type: "espresso", accuracy: expect.any(Number) })))
  })
})
