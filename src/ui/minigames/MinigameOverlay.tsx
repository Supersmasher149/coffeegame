import { recipeById } from "../../data/recipes"
import { ASSIST_MASTERY_SERVES, canAutomateStep, getAutomatedAccuracy } from "../../systems/gameRules"
import { useGameStore } from "../../store/gameStore"
import AssemblyGame from "./AssemblyGame"
import LatteArtGame from "./LatteArtGame"
import MilkGame from "./MilkGame"
import TimingGame from "./TimingGame"
import styles from "./MinigameOverlay.module.css"

const labels = { espresso: "Extract", milk: "Steam", latteArt: "Art", grind: "Grind", cold: "Assemble", tea: "Steep" }

export default function MinigameOverlay() {
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const order = useGameStore((state) => state.activeCustomers.find((customer) => customer.id === state.activeOrderId))
  const complete = useGameStore((state) => state.recordMinigameResult)
  const automate = useGameStore((state) => state.automateCurrentStep)
  const equipment = useGameStore((state) => state.cafe.equipment)
  const timesServed = useGameStore((state) => order ? state.recipeHistory[order.recipeId]?.timesServed ?? 0 : 0)
  const baristaUnlocked = useGameStore((state) => state.progression.level >= 2)
  const level = useGameStore((state) => state.progression.level)
  const milestones = useGameStore((state) => state.progression.milestones)
  const showTutorial = useGameStore((state) => state.settings.showTutorial)
  if (!activeOrderId || !order) return null
  const recipe = recipeById[order.recipeId]
  const type = recipe.minigames[order.minigameStep]
  const artPattern = milestones.includes("cat-face-art") ? "cat" : level >= 5 ? "star" : level >= 3 ? "tulip" : level >= 2 ? "leaf" : "heart"
  const key = `${order.id}-${order.minigameStep}`
  const assistAvailable = canAutomateStep(recipe, order.minigameStep, equipment, timesServed)
  const assistAccuracy = Math.round(getAutomatedAccuracy(baristaUnlocked ? 0.1 : 0) * 100)

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`Prepare ${recipe.name}`}>
      <header className={styles.header}>
        <div><span>Now making</span><strong>{recipe.name}</strong></div>
        <ol>{recipe.minigames.map((step, index) => <li key={`${step}-${index}`} className={index === order.minigameStep ? styles.current : index < order.minigameStep ? styles.complete : ""}><i>{index < order.minigameStep ? "ok" : index + 1}</i>{labels[step]}</li>)}</ol>
      </header>
      {assistAvailable && (
        <div className={styles.assist}>
          <div><strong>Station assist ready</strong><span>Reliable {assistAccuracy}% result. Play manually for perfect quality.</span></div>
          <button onClick={automate}>Use station assist</button>
        </div>
      )}
      <section className={styles.board} key={key}>
        {(type === "espresso" || type === "grind" || type === "tea") && <TimingGame type={type} onComplete={complete} />}
        {type === "milk" && <MilkGame recipeId={recipe.id} onComplete={complete} />}
        {type === "latteArt" && <LatteArtGame pattern={artPattern} onComplete={complete} />}
        {type === "cold" && <AssemblyGame order={recipe.assemblyOrder ?? ["ice", "coffee", "milk"]} onComplete={complete} />}
      </section>
      {showTutorial && <p className={styles.reassurance}>{timesServed < ASSIST_MASTERY_SERVES ? `Serve this recipe ${ASSIST_MASTERY_SERVES - timesServed} more time${ASSIST_MASTERY_SERVES - timesServed === 1 ? "" : "s"} to master its routine steps.` : "There are no ruined drinks here, only cups with character."}</p>}
    </div>
  )
}
