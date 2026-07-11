import { customerById } from "../data/customers"
import { ingredientById } from "../data/ingredients"
import { recipeById, recipes } from "../data/recipes"
import { ASSIST_MASTERY_SERVES } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import panel from "./FeaturePanel.module.css"
import styles from "./RecipeBook.module.css"

export default function RecipeBook() {
  const discovered = useGameStore((state) => state.discoveredRecipes)
  const history = useGameStore((state) => state.recipeHistory)
  const setScreen = useGameStore((state) => state.setScreen)

  return (
    <div className={panel.overlay} role="dialog" aria-modal="true" aria-labelledby="recipes-title">
      <section className={panel.panel}>
        <header className={panel.header}>
          <div><p className={panel.eyebrow}>{discovered.length} of {recipes.length} recipes found</p><h2 id="recipes-title">Recipe journal</h2></div>
          <button className={panel.close} onClick={() => setScreen("cafe")} autoFocus>Back to cafe</button>
        </header>
        <div className={styles.book}>
          {recipes.map((recipe, index) => {
            const unlocked = discovered.includes(recipe.id)
            const timesServed = history[recipe.id]?.timesServed ?? 0
            const mastery = timesServed >= ASSIST_MASTERY_SERVES ? "Station assist mastered" : `${Math.min(timesServed, ASSIST_MASTERY_SERVES)} / ${ASSIST_MASTERY_SERVES} mastery`
            const favoriteCustomers = Object.values(customerById).filter((customer) => customer.favoriteDrinks.includes(recipe.id))
            return (
              <article className={`${styles.recipe} ${!unlocked ? styles.locked : ""}`} key={recipe.id}>
                <div className={styles.number}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.cup} data-category={recipe.category}><i /></div>
                <div>
                  <span className={panel.pill}>{unlocked ? recipe.category : recipe.unlockLevel === 99 ? "A regular knows this one" : `Unlocks at level ${recipe.unlockLevel}`}</span>
                  <h3>{unlocked ? recipe.name : "Undiscovered recipe"}</h3>
                  <p>{unlocked ? recipe.description : "Keep building your neighborhood reputation to reveal this page."}</p>
                  {unlocked && <div className={styles.ingredients}>{recipe.ingredients.map((item) => <span key={item.ingredientId}>{ingredientById[item.ingredientId].name}</span>)}</div>}
                  {unlocked && favoriteCustomers.length > 0 && <small>Loved by {favoriteCustomers.map((customer) => customer.name).join(", ")}</small>}
                  {unlocked && <small>{mastery}</small>}
                </div>
                <div className={styles.stats}>
                  <strong>{timesServed}</strong><span>served</span>
                  <strong>{history[recipe.id] ? `${Math.round(history[recipe.id].bestQuality * 100)}%` : "--"}</strong><span>best</span>
                  <b>{recipeById[recipe.id].basePrice} coins</b>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
