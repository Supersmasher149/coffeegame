import { recipeById } from "../data/recipes"
import { useGameStore } from "../store/gameStore"
import styles from "./DailySpecial.module.css"

export default function DailySpecial() {
  const discovered = useGameStore((state) => state.discoveredRecipes)
  const weather = useGameStore((state) => state.weather)
  const inventory = useGameStore((state) => state.inventory)
  const choose = useGameStore((state) => state.chooseDailySpecial)
  const skip = useGameStore((state) => state.skipDailySpecial)
  const available = discovered.filter((id) => recipeById[id].ingredients.every((item) => (inventory[item.ingredientId] ?? 0) >= item.quantity))
  const ordered = [...available].sort((a, b) => {
    const weatherTag = weather === "sunny" ? "cold" : weather === "rainy" || weather === "snowy" ? "hot" : ""
    return Number(recipeById[b]?.tags.includes(weatherTag)) - Number(recipeById[a]?.tags.includes(weatherTag))
  }).slice(0, 3)

  return (
    <div className={styles.scrim} role="dialog" aria-modal="true" aria-labelledby="special-title">
      <section className={styles.panel}>
        <p className={styles.eyebrow}>The chalkboard is waiting</p>
        <h2 id="special-title">Choose today's special</h2>
        <p>Perfect specials earn 2 extra reputation, and curious customers order them more often.</p>
        <div className={styles.cards}>
          {ordered.map((id, index) => {
            const recipe = recipeById[id]
            return (
              <button key={id} onClick={() => choose(id)} autoFocus={index === 0}>
                <span>0{index + 1}</span>
                <i className={styles.cup} />
                <strong>{recipe.name}</strong>
                <small>{recipe.description}</small>
                <b>{recipe.basePrice} coins</b>
              </button>
            )
          })}
          {ordered.length === 0 && (
            <div className={styles.emptySpecial}>
              <strong>The pantry shelves are bare.</strong>
              <span>Open quietly today and visit the market before the next rush.</span>
              <button onClick={skip} autoFocus>Open without a special</button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
