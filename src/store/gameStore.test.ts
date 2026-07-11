import { createInitialSnapshot } from "../systems/gameRules"
import { gameStore, getGameSnapshot, MAX_SPAWN_GAP, MIN_SPAWN_GAP } from "./gameStore"

describe("game store", () => {
  beforeEach(() => {
    gameStore.getState().hydrate(createInitialSnapshot())
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    for (let tick = 0; tick < 4; tick += 1) gameStore.getState().tick()
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

  it("uses station assistance for mastered routine steps and keeps latte art manual", () => {
    gameStore.setState((state) => ({
      cafe: { ...state.cafe, equipment: { ...state.cafe.equipment, espressoMachine: 2, milkFrother: 2 } },
      progression: { ...state.progression, level: 2, reputation: 50 },
      recipeHistory: { ...state.recipeHistory, latte: { bestQuality: 0.9, timesServed: 6, averageQuality: 0.8 } },
    }))
    gameStore.getState().spawnCustomer("kai", "latte")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)

    gameStore.getState().automateCurrentStep()
    gameStore.getState().automateCurrentStep()
    const preparing = gameStore.getState().activeCustomers[0]
    expect(preparing.minigameStep).toBe(2)
    expect(preparing.results).toEqual([
      { type: "espresso", accuracy: 0.82, automated: true },
      { type: "milk", accuracy: 0.82, automated: true },
    ])

    gameStore.getState().automateCurrentStep()
    expect(gameStore.getState().activeCustomers[0].minigameStep).toBe(2)
    gameStore.getState().recordMinigameResult({ type: "latteArt", accuracy: 0.95 })
    expect(gameStore.getState().activeCustomers[0].status).toBe("served")
  })

  it("rejects results for the wrong preparation step", () => {
    gameStore.getState().spawnCustomer("kai", "latte")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    gameStore.getState().recordMinigameResult({ type: "milk", accuracy: 1 })
    expect(gameStore.getState().activeCustomers[0].results).toHaveLength(0)
    expect(gameStore.getState().activeCustomers[0].minigameStep).toBe(0)
  })

  it("uses Biscuit to clear a served table faster", () => {
    gameStore.setState((state) => ({ progression: { ...state.progression, level: 3, reputation: 150 }, specialOpen: false }))
    gameStore.getState().spawnCustomer("mei", "americano")
    const orderId = gameStore.getState().activeCustomers[0].id
    gameStore.getState().acceptOrder(orderId)
    gameStore.getState().recordMinigameResult({ type: "espresso", accuracy: 0.95 })
    gameStore.getState().dismissDialogue()
    expect(gameStore.getState().activeCustomers[0].cleanupRemaining).toBe(2)
    gameStore.setState((state) => ({ lastSpawnMinute: state.minuteOfDay }))
    for (let tick = 0; tick < 2; tick += 1) gameStore.getState().tick()
    expect(gameStore.getState().activeCustomers.some((customer) => customer.id === orderId)).toBe(false)
  })

  it("does not spawn customers before the minimum gap", () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    gameStore.setState((state) => ({ specialOpen: false, activeCustomers: [], lastSpawnMinute: state.minuteOfDay }))

    for (let tick = 1; tick < MIN_SPAWN_GAP; tick += 1) gameStore.getState().tick()
    expect(gameStore.getState().activeCustomers).toHaveLength(0)

    gameStore.getState().tick()
    expect(gameStore.getState().activeCustomers).toHaveLength(1)
  })

  it("forces an available customer at the maximum gap", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999)
    gameStore.setState((state) => ({
      specialOpen: false,
      activeCustomers: [],
      lastSpawnMinute: state.minuteOfDay - MAX_SPAWN_GAP + 1,
    }))

    gameStore.getState().tick()
    expect(gameStore.getState().activeCustomers).toHaveLength(1)
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
