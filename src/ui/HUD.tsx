import { recipeById } from "../data/recipes"
import { cafeLevels, getChapterForLevel, getChapterForLocation } from "../data/progression"
import { formatGameTime } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import styles from "./HUD.module.css"

const weatherLabel = { sunny: "Clear", cloudy: "Cloudy", rainy: "Rainy", stormy: "Storm", snowy: "Snow" }

export default function HUD() {
  const player = useGameStore((state) => state.player)
  const progression = useGameStore((state) => state.progression)
  const minuteOfDay = useGameStore((state) => state.minuteOfDay)
  const weather = useGameStore((state) => state.weather)
  const dailySpecial = useGameStore((state) => state.dailySpecial)
  const activeLocationId = useGameStore((state) => state.activeLocationId)
  const currentLevel = cafeLevels[progression.level - 1]
  const nextLevel = cafeLevels[progression.level]
  const chapter = getChapterForLevel(progression.level)
  const location = getChapterForLocation(activeLocationId)
  const progress = nextLevel ? ((progression.reputation - currentLevel.reputationRequired) / (nextLevel.reputationRequired - currentLevel.reputationRequired)) * 100 : 100

  return (
    <header className={styles.hud}>
      <div className={styles.day}>
        <span>Day {progression.dayNumber}</span>
        <small>{location.locationName}</small>
        <strong>{formatGameTime(minuteOfDay)}</strong>
      </div>
      <div className={styles.weather} data-weather={weather}>
        <i />
        <span>{weatherLabel[weather]}<small>{progression.season}</small></span>
      </div>
      <div className={styles.special}>
        <span>{progression.finaleStatus === "active" ? "Five-star review" : "Today's special"}</span>
        <strong>{dailySpecial ? recipeById[dailySpecial]?.name : "Choosing..."}</strong>
      </div>
      <div className={styles.rep} title={`${progression.reputation} reputation`}>
        <span>Level {progression.level} / {currentLevel.name}<small>{chapter.name}</small></span>
        <div><i style={{ width: `${Math.max(2, Math.min(100, progress))}%` }} /></div>
      </div>
      <div className={styles.coins}><i /> <strong>{player.coins}</strong><span>coins</span></div>
    </header>
  )
}
