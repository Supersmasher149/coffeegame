import { chapters, getUnlockedLocations } from "../data/progression"
import { useGameStore } from "../store/gameStore"
import panel from "./FeaturePanel.module.css"
import styles from "./TownMap.module.css"

export default function TownMap() {
  const level = useGameStore((state) => state.progression.level)
  const activeLocationId = useGameStore((state) => state.activeLocationId)
  const locations = useGameStore((state) => state.locations)
  const activeCafe = useGameStore((state) => state.cafe)
  const activeInventory = useGameStore((state) => state.inventory)
  const activeCoins = useGameStore((state) => state.player.coins)
  const switchLocation = useGameStore((state) => state.switchLocation)
  const setScreen = useGameStore((state) => state.setScreen)
  const unlocked = getUnlockedLocations(level)

  return (
    <div className={panel.overlay} role="dialog" aria-modal="true" aria-labelledby="map-title">
      <section className={panel.panel}>
        <header className={panel.header}>
          <div><p className={panel.eyebrow}>Four neighborhoods, one coffee story</p><h2 id="map-title">Town map</h2></div>
          <button className={panel.close} onClick={() => setScreen("cafe")} autoFocus>Back to cafe</button>
        </header>
        <div className={styles.route}>
          {chapters.map((chapter, index) => {
            const available = unlocked.includes(chapter.locationId)
            const active = activeLocationId === chapter.locationId
            const storedLocation = locations[chapter.locationId]
            const location = active ? { cafe: activeCafe, inventory: activeInventory, coins: activeCoins } : storedLocation
            return (
              <article className={`${styles.stop} ${active ? styles.active : ""} ${!available ? styles.locked : ""}`} style={{ "--accent": chapter.accent } as React.CSSProperties} key={chapter.id}>
                <div className={styles.marker}>{index + 1}</div>
                <span className={panel.pill}>Chapter {index + 1} / Levels {chapter.startLevel}–{chapter.endLevel}</span>
                <h3>{chapter.locationName}</h3>
                <strong>{chapter.name}</strong>
                <p>{chapter.description}</p>
                <div className={styles.local}>
                  <span>{location.coins} local coins</span>
                  <span>{Object.values(location.inventory).reduce((sum, count) => sum + count, 0)} pantry items</span>
                </div>
                <button onClick={() => switchLocation(chapter.locationId)} disabled={!available || active}>
                  {active ? "Current cafe" : available ? "Travel here" : `Unlock at Level ${chapter.startLevel}`}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
