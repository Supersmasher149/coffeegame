import { createInitialSnapshot } from "../systems/gameRules"
import { gameStore, getGameSnapshot } from "./gameStore"

describe("game store", () => {
  beforeEach(() => {
    gameStore.getState().hydrate(createInitialSnapshot())
  })

  it("settles a completed order and advances progression totals", () => {
    const startingCoins = gameStore.getState().player.coins
    gameStore.getState().spawnCustomer("mei", "americano")
    const order = gameStore.getState().activeCustomers[0]
    gameStore.getState().acceptOrder(order.id)
    gameStore.getState().recordMinigameResult({ type: "espresso", accuracy: 0.95 })
    expect(gameStore.getState().player.coins).toBeGreaterThan(startingCoins)
    expect(gameStore.getState().player.totalDrinksServed).toBe(1)
    expect(gameStore.getState().activeCustomers[0].status).toBe("served")
    gameStore.getState().dismissDialogue()
    gameStore.setState({ specialOpen: false })
    for (let second = 0; second < 8; second += 1) gameStore.getState().tick()
    expect(gameStore.getState().activeCustomers.some((customer) => customer.id === order.id)).toBe(false)
  })

  it("purchases and places an owned decoration", () => {
    gameStore.getState().placeDecoration("plant-pot", 2, 2)
    expect(gameStore.getState().cafe.decorations).toHaveLength(1)
    expect(gameStore.getState().cafe.ownedDecorations["plant-pot"]).toBe(0)
  })

  it("resumes the saved time and in-progress order", () => {
    gameStore.setState({ minuteOfDay: 900 })
    gameStore.getState().spawnCustomer("mei", "americano")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    const saved = getGameSnapshot()
    gameStore.getState().hydrate(createInitialSnapshot())
    gameStore.getState().hydrate(saved)
    expect(gameStore.getState().minuteOfDay).toBe(900)
    expect(gameStore.getState().activeOrderId).toBe(orderId)
    expect(gameStore.getState().activeCustomers[0].status).toBe("preparing")
  })

  it("refuses orders that cannot be made and reserves stock on acceptance", () => {
    gameStore.setState((state) => ({ inventory: { ...state.inventory, "colombian-beans": 1 } }))
    gameStore.getState().spawnCustomer("mei", "americano")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    expect(gameStore.getState().inventory["colombian-beans"]).toBe(0)
    gameStore.getState().spawnCustomer("derek", "espresso")
    expect(gameStore.getState().activeCustomers).toHaveLength(1)
  })

  it("preserves an unread active dialogue in snapshots", () => {
    gameStore.getState().spawnCustomer("mei", "americano")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    gameStore.getState().recordMinigameResult({ type: "espresso", accuracy: 0.95 })
    const saved = getGameSnapshot()
    gameStore.getState().dismissDialogue()
    gameStore.getState().hydrate(saved)
    expect(gameStore.getState().dialogue?.customerId).toBe("mei")
  })

  it("completes a chained latte and records perfect art", () => {
    gameStore.getState().spawnCustomer("kai", "latte")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    gameStore.getState().recordMinigameResult({ type: "espresso", accuracy: 0.94 })
    gameStore.getState().recordMinigameResult({ type: "milk", accuracy: 0.91 })
    gameStore.getState().recordMinigameResult({ type: "latteArt", accuracy: 0.96 })
    expect(gameStore.getState().player.totalDrinksServed).toBe(1)
    expect(gameStore.getState().player.totalPerfectLatteArts).toBe(1)
    expect(gameStore.getState().activeCustomers[0].status).toBe("served")
  })

  it("uses Biscuit to clear a served table faster", () => {
    gameStore.setState((state) => ({ progression: { ...state.progression, level: 3, reputation: 150 }, specialOpen: false }))
    gameStore.getState().spawnCustomer("mei", "americano")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    gameStore.getState().recordMinigameResult({ type: "espresso", accuracy: 0.95 })
    gameStore.getState().dismissDialogue()
    expect(gameStore.getState().activeCustomers[0].cleanupRemaining).toBe(4)
    gameStore.setState((state) => ({ lastSpawnMinute: state.minuteOfDay }))
    for (let second = 0; second < 4; second += 1) gameStore.getState().tick()
    expect(gameStore.getState().activeCustomers.some((customer) => customer.id === orderId)).toBe(false)
  })

  it("gives stormy-weather arrivals extra patience", () => {
    gameStore.setState((state) => ({ weather: "stormy", specialOpen: false }))
    gameStore.getState().spawnCustomer("mei", "americano")
    expect(gameStore.getState().activeCustomers[0].maxPatience).toBe(110)
  })

  it("unlocks Rose's secret recipe at loyalty level two", () => {
    for (let visit = 0; visit < 2; visit += 1) {
      gameStore.getState().spawnCustomer("rose", "green-tea")
      const orderId = gameStore.getState().activeCustomers.find((customer) => customer.status === "waiting")!.id
      gameStore.getState().acceptOrder(orderId)
      gameStore.getState().recordMinigameResult({ type: "tea", accuracy: 0.96 })
      gameStore.getState().dismissDialogue()
      gameStore.setState({ activeCustomers: [] })
    }
    expect(gameStore.getState().customerLoyalty.rose).toBe(2)
    expect(gameStore.getState().discoveredRecipes).toContain("grandmas-hot-chocolate")
  })

  it("does not mutate base cat happiness when furniture is moved", () => {
    gameStore.setState((state) => ({ cafe: { ...state.cafe, ownedDecorations: { ...state.cafe.ownedDecorations, "cat-bed": 1 } } }))
    gameStore.getState().placeDecoration("cat-bed", 2, 2)
    const placedId = gameStore.getState().cafe.decorations[0].id
    expect(gameStore.getState().catHappiness.mochi).toBe(75)
    gameStore.getState().removeDecoration(placedId)
    expect(gameStore.getState().catHappiness.mochi).toBe(75)
  })
})
