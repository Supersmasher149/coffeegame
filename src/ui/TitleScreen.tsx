import { useState } from "react"
import styles from "./TitleScreen.module.css"

interface TitleScreenProps {
  canContinue: boolean
  onNewGame: (name: string) => void
  onContinue: () => void
}

export default function TitleScreen({ canContinue, onNewGame, onContinue }: TitleScreenProps) {
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState("Juniper & Steam")

  return (
    <main className={styles.screen}>
      <div className={styles.sun} />
      <div className={styles.grain} />
      <section className={styles.intro}>
        <p className={styles.eyebrow}>A neighborhood story</p>
        <h1>Cozy<br /><em>Coffee</em> Shop</h1>
        <p className={styles.pitch}>Pull bright espresso, learn the stories of your regulars, and build a warm little corner for every cat in town.</p>
        {!naming ? (
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => setNaming(true)}>New cafe</button>
            <button className={styles.secondary} onClick={onContinue} disabled={!canContinue}>Continue</button>
          </div>
        ) : (
          <form className={styles.naming} onSubmit={(event) => { event.preventDefault(); onNewGame(name) }}>
            <label htmlFor="cafe-name">What is your cafe called?</label>
            <div>
              <input id="cafe-name" value={name} maxLength={32} autoFocus onChange={(event) => setName(event.target.value)} />
              <button className={styles.primary} type="submit">Open the doors</button>
            </div>
          </form>
        )}
      </section>
      <section className={styles.vignette} aria-hidden="true">
        <div className={styles.window}><i /><i /><i /></div>
        <div className={styles.shelf}><span /><span /><span /></div>
        <div className={styles.cup}><b /></div>
        <div className={styles.cat}><span /><span /></div>
        <div className={styles.table} />
      </section>
      <p className={styles.footer}>Made for slow afternoons</p>
    </main>
  )
}
