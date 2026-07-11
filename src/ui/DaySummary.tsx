import { catById } from "../data/cats"
import { recipeById } from "../data/recipes"
import { cafeLevels, getChapterForLevel } from "../data/progression"
import { useGameStore } from "../store/gameStore"
import styles from "./DaySummary.module.css"

export default function DaySummary() {
  const stats = useGameStore((state) => state.dailyStats)
  const progression = useGameStore((state) => state.progression)
  const nextWeather = useGameStore((state) => state.nextWeather)
  const catHappiness = useGameStore((state) => state.catHappiness)
  const startNextDay = useGameStore((state) => state.startNextDay)
  const startFiveStarReview = useGameStore((state) => state.startFiveStarReview)
  const activeLocationId = useGameStore((state) => state.activeLocationId)
  const activeCats = Object.entries(catHappiness).filter(([id]) => catById[id]?.unlockLevel <= progression.level)
  const averageHappiness = activeCats.length ? Math.round(activeCats.reduce((sum, [, value]) => sum + value, 0) / activeCats.length) : 0
  const level = cafeLevels[progression.level - 1]
  const nextLevel = cafeLevels[progression.level]
  const chapter = getChapterForLevel(progression.level)

  return (
    <div className={styles.summary} role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div className={styles.moon} />
      <section>
        <p className={styles.eyebrow}>The chairs are up, the lights are low</p>
        <h2 id="summary-title">Day {progression.dayNumber}, in the books.</h2>
        <p className={styles.eyebrow}>Chapter: {chapter.name} / Cafe Level {level.level}: {level.name}</p>
        <div className={styles.stats}>
          <article><span>Customers served</span><strong>{stats.customersServed}</strong></article>
          <article><span>Drink revenue</span><strong>{stats.revenue}</strong><small>coins</small></article>
          <article><span>Tips tucked in the jar</span><strong>{stats.tips}</strong><small>coins</small></article>
          <article><span>Neighborhood reputation</span><strong>+{stats.reputation}</strong></article>
        </div>
        <div className={styles.notes}>
          <div><span>Best cup</span><strong>{stats.bestDrink ? `${stats.bestDrink.name}, ${stats.bestDrink.quality}` : "Tomorrow's first cup"}</strong></div>
          <div><span>Cat crew mood</span><strong>{averageHappiness}% happy</strong></div>
          <div><span>Recipes discovered</span><strong>{stats.recipesDiscovered.length ? stats.recipesDiscovered.map((id) => recipeById[id].name).join(", ") : "No new pages today"}</strong></div>
        </div>
        <footer>
          <p>Tomorrow looks <strong>{nextWeather}</strong>. Fresh chalk, fresh cups, fresh stories.</p>
          <p>{nextLevel ? `${nextLevel.reputationRequired - progression.reputation} reputation until ${nextLevel.majorUnlock}.` : progression.finaleStatus === "available" ? "Your five-star review day is ready." : "Five-star campaign complete."}</p>
          {progression.finaleStatus === "available" && activeLocationId === "grand-avenue"
            ? <button onClick={startFiveStarReview} autoFocus>Begin the five-star review day</button>
            : <button onClick={startNextDay} autoFocus>{progression.finaleStatus === "completed" ? "Continue serving" : `Start day ${progression.dayNumber + 1}`}</button>}
        </footer>
      </section>
    </div>
  )
}
