import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App from "./App"
import { gameStore } from "./store/gameStore"

describe("application flow", () => {
  it("opens a named cafe from the title screen", async () => {
    gameStore.setState({ hydrated: false, started: false, specialOpen: false })
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole("heading", { name: /cozy coffee shop/i })).toBeVisible()
    await user.click(screen.getByRole("button", { name: /new cafe/i }))
    const name = screen.getByLabelText(/what is your cafe called/i)
    await user.clear(name)
    await user.type(name, "Fern & Foam")
    await user.click(screen.getByRole("button", { name: /open the doors/i }))
    expect(await screen.findByText("Day 1")).toBeVisible()
    expect(screen.getByRole("heading", { name: /choose today's special/i })).toBeVisible()
  })
})
