import { useEffect, useRef } from "react"
import { Application, Container, Graphics, Text } from "pixi.js"
import { catById, cats } from "../data/cats"
import { customerById } from "../data/customers"
import { decorationById } from "../data/decorations"
import { gameStore } from "../store/gameStore"

const colorNumber = (value: string) => Number.parseInt(value.replace("#", ""), 16)

const addLabel = (container: Container, text: string, x: number, y: number, size = 14, color = 0x4a3027) => {
  const label = new Text({ text, style: { fontFamily: "DM Sans, sans-serif", fontSize: size, fill: color, fontWeight: "600" } })
  label.anchor.set(0.5)
  label.position.set(x, y)
  container.addChild(label)
}

const drawScene = (stage: Container, width: number, height: number) => {
  for (const child of stage.removeChildren()) child.destroy({ children: true })
  const state = gameStore.getState()
  const scale = Math.min(width / 960, height / 650)
  const ox = (width - 960 * scale) / 2
  const oy = (height - 650 * scale) / 2
  const room = new Container()
  room.scale.set(scale)
  room.position.set(ox, oy)
  stage.addChild(room)

  const background = new Graphics().roundRect(15, 20, 930, 600, 28).fill({ color: state.weather === "rainy" || state.weather === "stormy" ? 0xc9b89e : 0xe8d6b8 })
  room.addChild(background)
  const wall = new Graphics().roundRect(20, 25, 920, 345, 24).fill({ color: state.progression.season === "spring" ? 0xead8c2 : state.progression.season === "summer" ? 0xe6d9b0 : state.progression.season === "autumn" ? 0xddc2a2 : 0xd4d7d2 })
  room.addChild(wall)
  const floor = new Graphics().rect(20, 355, 920, 260).fill({ color: 0xb98562 })
  for (let line = 0; line < 11; line += 1) floor.moveTo(20 + line * 92, 355).lineTo(20 + line * 92, 615).stroke({ color: 0xa97657, alpha: 0.5, width: 2 })
  room.addChild(floor)

  const window = new Graphics().roundRect(75, 65, 310, 210, 80).fill({ color: state.weather === "sunny" ? 0x9fc4bd : 0x82979d }).roundRect(88, 78, 284, 184, 68).stroke({ color: 0xf4ead7, width: 14 })
  window.moveTo(230, 78).lineTo(230, 262).moveTo(88, 172).lineTo(372, 172).stroke({ color: 0xf4ead7, width: 8 })
  room.addChild(window)
  if (state.weather === "rainy" || state.weather === "stormy") {
    const rain = new Graphics()
    for (let drop = 0; drop < 18; drop += 1) {
      const x = 100 + ((drop * 47) % 260)
      const y = 90 + ((drop * 61) % 150)
      rain.moveTo(x, y).lineTo(x - 7, y + 18)
    }
    rain.stroke({ color: 0xd9eef2, alpha: 0.75, width: 3 })
    room.addChild(rain)
  }

  const counter = new Graphics().roundRect(510, 105, 355, 190, 16).fill({ color: 0x714737 }).rect(485, 95, 405, 38).fill({ color: 0x4e3028 }).roundRect(548, 65, 96, 62, 12).fill({ color: 0x4f5653 }).circle(594, 80, 13).fill({ color: 0x262b29 })
  room.addChild(counter)
  addLabel(room, state.cafe.name, 688, 235, 20, 0xf8e9d2)

  const tables = [[225, 430], [482, 482], [750, 430]]
  for (const [x, y] of tables) {
    const table = new Graphics().ellipse(x, y, 88, 38).fill({ color: 0x76503e }).rect(x - 9, y, 18, 72).fill({ color: 0x5c3b31 })
    room.addChild(table)
  }

  for (const placed of state.cafe.decorations) {
    const item = decorationById[placed.decorationId]
    if (!item) continue
    const x = 88 + placed.gridX * 103
    const y = 340 + placed.gridY * 40
    const deco = new Graphics().roundRect(x, y, Math.max(35, item.size.width * 52), Math.max(24, item.size.height * 27), 8).fill({ color: item.category === "plant" ? 0x66805c : item.category === "cat" ? 0xd5aa7d : 0x91634c, alpha: 0.95 })
    room.addChild(deco)
  }

  const unlockedCats = cats.filter((cat) => cat.unlockLevel <= state.progression.level)
  unlockedCats.forEach((cat, index) => {
    const x = 105 + index * 210
    const y = index % 2 ? 555 : 322
    const shape = new Graphics().ellipse(x, y, 34, 22).fill({ color: colorNumber(cat.color) }).circle(x + 27, y - 17, 22).fill({ color: colorNumber(cat.color) }).poly([x + 12, y - 29, x + 17, y - 52, x + 29, y - 34]).fill({ color: colorNumber(cat.color) }).poly([x + 31, y - 34, x + 45, y - 50, x + 47, y - 25]).fill({ color: colorNumber(cat.color) })
    room.addChild(shape)
    addLabel(room, cat.name, x + 5, y + 35, 12)
  })

  state.activeCustomers.forEach((active, index) => {
    const customer = customerById[active.customerId]
    const [x, y] = tables[index % tables.length]
    const person = new Graphics().circle(x, y - 82, 29).fill({ color: colorNumber(customer.color) }).roundRect(x - 29, y - 55, 58, 67, 20).fill({ color: colorNumber(customer.color) })
    room.addChild(person)
    addLabel(room, customer.avatar, x, y - 82, 19, 0xffffff)
    if (active.status === "waiting") {
      const bubble = new Graphics().roundRect(x + 27, y - 140, 66, 38, 18).fill({ color: 0xfffbef }).poly([x + 39, y - 104, x + 53, y - 104, x + 39, y - 94]).fill({ color: 0xfffbef })
      room.addChild(bubble)
      addLabel(room, "order", x + 60, y - 121, 11, 0x725044)
    }
  })
}

export default function CafeCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hostRef.current || import.meta.env.MODE === "test") return
    let disposed = false
    let app: Application | null = null
    let unsubscribe = () => {}
    const start = async () => {
      const instance = new Application()
      await instance.init({ resizeTo: hostRef.current!, antialias: true, backgroundAlpha: 0, resolution: Math.min(window.devicePixelRatio, 2), autoDensity: true })
      if (disposed) { instance.destroy(true); return }
      app = instance
      hostRef.current!.appendChild(instance.canvas)
      const redraw = () => drawScene(instance.stage, instance.screen.width, instance.screen.height)
      redraw()
      let signature = ""
      unsubscribe = gameStore.subscribe((state) => {
        const nextSignature = JSON.stringify({
          weather: state.weather,
          season: state.progression.season,
          level: state.progression.level,
          cafe: state.cafe.name,
          decorations: state.cafe.decorations,
          customers: state.activeCustomers.map((customer) => [customer.id, customer.status]),
        })
        if (nextSignature === signature) return
        signature = nextSignature
        redraw()
      })
      instance.renderer.on("resize", redraw)
    }
    void start()
    return () => {
      disposed = true
      unsubscribe()
      app?.destroy(true, { children: true })
    }
  }, [])

  return <div ref={hostRef} style={{ position: "absolute", inset: 0 }} aria-hidden="true" />
}
