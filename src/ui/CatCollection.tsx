import { cats } from "../data/cats"
import { getDecorationBonuses } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import panel from "./FeaturePanel.module.css"
import styles from "./CatCollection.module.css"

export default function CatCollection() {
  const level = useGameStore((state) => state.progression.level)
  const happiness = useGameStore((state) => state.catHappiness)
  const friendship = useGameStore((state) => state.catFriendship)
  const petCat = useGameStore((state) => state.petCat)
  const setScreen = useGameStore((state) => state.setScreen)
  const furnitureHappiness = useGameStore((state) => getDecorationBonuses(state.cafe.decorations).catHappiness)

  return (
    <div className={panel.overlay} role="dialog" aria-modal="true" aria-labelledby="cats-title">
      <section className={panel.panel}>
        <header className={panel.header}>
          <div><p className={panel.eyebrow}>Staff meeting, naps permitted</p><h2 id="cats-title">Cat crew</h2></div>
          <button className={panel.close} onClick={() => setScreen("cafe")} autoFocus>Back to cafe</button>
        </header>
        <div className={styles.cats}>
          {cats.map((cat) => {
            const unlocked = cat.unlockLevel <= level
            return (
              <article className={`${styles.catCard} ${!unlocked ? styles.locked : ""}`} key={cat.id}>
                <div className={styles.catPortrait} style={{ "--cat-color": cat.color } as React.CSSProperties} aria-hidden="true"><i /><b /><span /></div>
                <span className={panel.pill}>{unlocked ? cat.role : `Unlocks at level ${cat.unlockLevel}`}</span>
                <h3>{unlocked ? cat.name : "A mysterious cat"}</h3>
                <strong>{cat.breed}</strong>
                <p>{unlocked ? cat.personality : "A new pair of ears has been spotted near the cafe window."}</p>
                {unlocked && <>
                  <div className={styles.stat}><span>Happiness</span><div><i style={{ width: `${Math.min(100, happiness[cat.id] + furnitureHappiness)}%` }} /></div><b>{Math.min(100, happiness[cat.id] + furnitureHappiness)}</b></div>
                  <div className={styles.stat}><span>Friendship</span><div><i style={{ width: `${friendship[cat.id]}%` }} /></div><b>{friendship[cat.id]}</b></div>
                  <div className={styles.ability}><small>Staff ability</small><strong>{cat.passiveAbility}</strong></div>
                  <button className={panel.buy} onClick={() => petCat(cat.id)}>Pet {cat.name}</button>
                </>}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
