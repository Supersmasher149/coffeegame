import { recipeById } from "../../data/recipes"
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
  const level = useGameStore((state) => state.progression.level)
  const milestones = useGameStore((state) => state.progression.milestones)
  const showTutorial = useGameStore((state) => state.settings.showTutorial)
  if (!activeOrderId || !order) return null
  const recipe = recipeById[order.recipeId]
  const type = recipe.minigames[order.minigameStep]
  const artPattern = milestones.includes("cat-face-art") ? "cat" : level >= 5 ? "star" : level >= 3 ? "tulip" : level >= 2 ? "leaf" : "heart"
  const key = `${order.id}-${order.minigameStep}`

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`Prepare ${recipe.name}`}>
      <header className={styles.header}>
        <div><span>Now making</span><strong>{recipe.name}</strong></div>
        <ol>{recipe.minigames.map((step, index) => <li key={`${step}-${index}`} className={index === order.minigameStep ? styles.current : index < order.minigameStep ? styles.complete : ""}><i>{index < order.minigameStep ? "ok" : index + 1}</i>{labels[step]}</li>)}</ol>
      </header>
      <section className={styles.board} key={key}>
        {(type === "espresso" || type === "grind" || type === "tea") && <TimingGame type={type} onComplete={complete} />}
        {type === "milk" && <MilkGame recipeId={recipe.id} onComplete={complete} />}
        {type === "latteArt" && <LatteArtGame pattern={artPattern} onComplete={complete} />}
        {type === "cold" && <AssemblyGame order={recipe.assemblyOrder ?? ["ice", "coffee", "milk"]} onComplete={complete} />}
      </section>
      {showTutorial && <p className={styles.reassurance}>There are no ruined drinks here, only cups with character.</p>}
    </div>
  )
}
