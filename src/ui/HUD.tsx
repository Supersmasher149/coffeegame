import { recipeById } from "../data/recipes"
import { formatGameTime, REPUTATION_LEVELS, REPUTATION_NAMES } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import styles from "./HUD.module.css"

const weatherLabel = { sunny: "Clear", cloudy: "Cloudy", rainy: "Rainy", stormy: "Storm", snowy: "Snow" }

export default function HUD() {
  const player = useGameStore((state) => state.player)
  const progression = useGameStore((state) => state.progression)
  const minuteOfDay = useGameStore((state) => state.minuteOfDay)
  const weather = useGameStore((state) => state.weather)
  const dailySpecial = useGameStore((state) => state.dailySpecial)
  const currentThreshold = REPUTATION_LEVELS[progression.level - 1]
  const nextThreshold = REPUTATION_LEVELS[progression.level] ?? currentThreshold + 500
  const progress = ((progression.reputation - currentThreshold) / (nextThreshold - currentThreshold)) * 100

  return (
    <header className={styles.hud}>
      <div className={styles.day}>
        <span>Day {progression.dayNumber}</span>
        <strong>{formatGameTime(minuteOfDay)}</strong>
      </div>
      <div className={styles.weather} data-weather={weather}>
        <i />
        <span>{weatherLabel[weather]}<small>{progression.season}</small></span>
      </div>
      <div className={styles.special}>
        <span>Today's special</span>
        <strong>{dailySpecial ? recipeById[dailySpecial]?.name : "Choosing..."}</strong>
      </div>
      <div className={styles.rep} title={`${progression.reputation} reputation`}>
        <span>Level {progression.level} / {REPUTATION_NAMES[progression.level - 1]}</span>
        <div><i style={{ width: `${Math.max(2, Math.min(100, progress))}%` }} /></div>
      </div>
      <div className={styles.coins}><i /> <strong>{player.coins}</strong><span>coins</span></div>
    </header>
  )
}
