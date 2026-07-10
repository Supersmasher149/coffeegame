import { useMemo, useState } from "react"
import { decorationById, decorations } from "../data/decorations"
import { canPlaceDecoration } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import panel from "./FeaturePanel.module.css"
import styles from "./DecorationScreen.module.css"

export default function DecorationScreen() {
  const cafe = useGameStore((state) => state.cafe)
  const place = useGameStore((state) => state.placeDecoration)
  const remove = useGameStore((state) => state.removeDecoration)
  const setScreen = useGameStore((state) => state.setScreen)
  const firstOwned = decorations.find((item) => (cafe.ownedDecorations[item.id] ?? 0) > 0)?.id ?? null
  const [selected, setSelected] = useState<string | null>(firstOwned)
  const occupied = useMemo(() => {
    const cells = new Map<string, string>()
    cafe.decorations.forEach((placed) => {
      const item = decorationById[placed.decorationId]
      for (let x = placed.gridX; x < placed.gridX + item.size.width; x += 1) {
        for (let y = placed.gridY; y < placed.gridY + item.size.height; y += 1) cells.set(`${x}:${y}`, placed.id)
      }
    })
    return cells
  }, [cafe.decorations])

  const selectedItem = selected ? decorationById[selected] : null

  return (
    <div className={panel.overlay} role="dialog" aria-modal="true" aria-labelledby="decorate-title">
      <section className={panel.panel}>
        <header className={panel.header}>
          <div><p className={panel.eyebrow}>{cafe.decorations.length} of 20 pieces placed</p><h2 id="decorate-title">Arrange the cafe</h2></div>
          <button className={panel.close} onClick={() => setScreen("cafe")} autoFocus>Done decorating</button>
        </header>
        <div className={styles.layout}>
          <aside className={styles.storage}>
            <h3>Storage</h3>
            <p>Select a piece, then choose a free square.</p>
            <div>
              {decorations.filter((item) => (cafe.ownedDecorations[item.id] ?? 0) > 0).map((item) => (
                <button key={item.id} className={selected === item.id ? styles.selected : ""} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
                  <i data-type={item.category}>{item.name.slice(0, 1)}</i>
                  <span><strong>{item.name}</strong><small>{item.size.width}x{item.size.height} / {cafe.ownedDecorations[item.id]} owned</small></span>
                </button>
              ))}
              {!firstOwned && <div className={panel.empty}>Storage is empty.<br />Visit the market shelf to buy a piece.</div>}
            </div>
          </aside>
          <div className={styles.roomWrap}>
            <div className={styles.roomLabel}><span>Window wall</span><b>{selectedItem ? `Placing: ${selectedItem.name}` : "Select an item"}</b></div>
            <div className={styles.room}>
              {Array.from({ length: 48 }, (_, index) => {
                const x = index % 8
                const y = Math.floor(index / 8)
                const placedId = occupied.get(`${x}:${y}`)
                const placed = cafe.decorations.find((item) => item.id === placedId)
                const isOrigin = placed?.gridX === x && placed?.gridY === y
                const valid = selectedItem ? canPlaceDecoration({ gridX: x, gridY: y, width: selectedItem.size.width, height: selectedItem.size.height }, cafe.decorations) : false
                return (
                  <button
                    key={`${x}:${y}`}
                    className={`${placedId ? styles.occupied : ""} ${valid ? styles.valid : ""}`}
                    aria-label={`Row ${y + 1} column ${x + 1}${placed ? `, ${decorationById[placed.decorationId].name}` : ""}`}
                    onClick={() => placedId ? remove(placedId) : selected && place(selected, x, y)}
                  >
                    {isOrigin && <span>{decorationById[placed.decorationId].name}</span>}
                  </button>
                )
              })}
            </div>
            <p className={styles.help}>Occupied pieces can be tapped to return them to storage. Door and counter squares stay clear.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
