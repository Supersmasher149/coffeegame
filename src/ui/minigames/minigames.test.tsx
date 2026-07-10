import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AssemblyGame from "./AssemblyGame"
import LatteArtGame from "./LatteArtGame"
import MilkGame from "./MilkGame"
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

describe("timed minigames", () => {
  afterEach(() => vi.useRealTimers())

  it("finishes an incomplete assembly after eight seconds", () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<AssemblyGame order={["ice", "coffee"]} onComplete={onComplete} />)

    act(() => vi.advanceTimersByTime(8_000))

    expect(onComplete).toHaveBeenCalledWith({ type: "cold", accuracy: 0.4 })
  })

  it("finishes milk games with a fallback target", () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<MilkGame recipeId="grandmas-hot-chocolate" onComplete={onComplete} />)

    act(() => vi.advanceTimersByTime(5_050))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ type: "milk", accuracy: expect.any(Number) }))
  })
})

describe("latte art", () => {
  it("requires pointer checkpoints in order", () => {
    const onComplete = vi.fn()
    render(<LatteArtGame onComplete={onComplete} />)
    const surface = screen.getByRole("application")
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect)
    Object.assign(surface, { setPointerCapture: vi.fn() })

    fireEvent(surface, new MouseEvent("pointerdown", { bubbles: true, clientX: 50, clientY: 79 }))
    fireEvent(surface, new MouseEvent("pointermove", { bubbles: true, clientX: 24, clientY: 48 }))
    fireEvent.click(screen.getByRole("button", { name: /finish the art/i }))

    expect(onComplete).toHaveBeenCalledWith({ type: "latteArt", accuracy: 1 / 11 })
  })
})
