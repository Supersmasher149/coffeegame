import { useState } from "react"
import { decorations } from "../data/decorations"
import { ingredients } from "../data/ingredients"
import { equipmentUpgrades } from "../data/upgrades"
import { getDailySaleIngredientIds } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import panel from "./FeaturePanel.module.css"

export default function ShopScreen() {
  const [tab, setTab] = useState<"ingredients" | "decorations" | "equipment">("ingredients")
  const coins = useGameStore((state) => state.player.coins)
  const inventory = useGameStore((state) => state.inventory)
  const progression = useGameStore((state) => state.progression)
  const season = useGameStore((state) => state.progression.season)
  const owned = useGameStore((state) => state.cafe.ownedDecorations)
  const equipment = useGameStore((state) => state.cafe.equipment)
  const buyIngredient = useGameStore((state) => state.purchaseIngredient)
  const buyDecoration = useGameStore((state) => state.purchaseDecoration)
  const buyEquipment = useGameStore((state) => state.purchaseEquipment)
  const setScreen = useGameStore((state) => state.setScreen)
  const saleIds = getDailySaleIngredientIds(progression.dayNumber)

  return (
    <div className={panel.overlay} role="dialog" aria-modal="true" aria-labelledby="shop-title">
      <section className={panel.panel}>
        <header className={panel.header}>
          <div><p className={panel.eyebrow}>Paper bags, local goods, friendly prices</p><h2 id="shop-title">Market shelf</h2></div>
          <button className={panel.close} onClick={() => setScreen("cafe")} autoFocus>Back to cafe</button>
        </header>
        <div className={panel.tabs}>
          <button className={tab === "ingredients" ? panel.active : ""} onClick={() => setTab("ingredients")}>Ingredients</button>
          <button className={tab === "decorations" ? panel.active : ""} onClick={() => setTab("decorations")}>Decorations</button>
          <button className={tab === "equipment" ? panel.active : ""} onClick={() => setTab("equipment")}>Equipment</button>
        </div>
        <p><strong>{coins} coins</strong> in the cafe tin</p>
        <div className={panel.grid}>
          {tab === "ingredients" ? ingredients.filter((ingredient) => !ingredient.seasonal || ingredient.seasonal === season).map((ingredient) => {
            const sale = saleIds.includes(ingredient.id)
            const price = sale ? Math.max(1, Math.ceil(ingredient.cost / 2)) : ingredient.cost
            return (
              <article className={panel.card} key={ingredient.id}>
                {sale && <span className={panel.sale}>Half price</span>}
                <span className={panel.pill}>{ingredient.category} / quality {ingredient.quality}</span>
                <h3>{ingredient.name}</h3>
                <p>From {ingredient.origin}. One parcel adds three servings to the pantry.</p>
                <div className={panel.meta}><span>{inventory[ingredient.id] ?? 0} in stock</span><span>{ingredient.shelfLife} day shelf life</span></div>
                <div className={panel.cardFooter}><span className={panel.price}>{price} coins</span><button className={panel.buy} onClick={() => buyIngredient(ingredient.id)} disabled={coins < price}>Restock</button></div>
              </article>
            )
          }) : tab === "decorations" ? decorations.filter((item) => item.unlockLevel <= progression.level).map((item) => (
            <article className={panel.card} key={item.id}>
              <span className={panel.pill}>{item.category} / {item.size.width}x{item.size.height}</span>
              <h3>{item.name}</h3>
              <p>{item.style} style. {item.effects.map((effect) => `+${effect.value < 1 ? Math.round(effect.value * 100) + "%" : effect.value} ${effect.type}`).join(", ")}.</p>
              <div className={panel.meta}><span>{owned[item.id] ?? 0} in storage</span><span>Level {item.unlockLevel}</span></div>
              <div className={panel.cardFooter}><span className={panel.price}>{item.cost} coins</span><button className={panel.buy} onClick={() => buyDecoration(item.id)} disabled={coins < item.cost}>Buy</button></div>
            </article>
          )) : equipmentUpgrades.filter((item) => item.unlockLevel <= progression.level).map((item) => {
            const current = equipment[item.id]
            const complete = current >= item.maxLevel
            return (
              <article className={panel.card} key={item.id}>
                <span className={panel.pill}>Equipment / level {current}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className={panel.meta}><span>Unlock level {item.unlockLevel}</span><span>Maximum {item.maxLevel}</span></div>
                <div className={panel.cardFooter}><span className={panel.price}>{complete ? "Installed" : `${item.cost} coins`}</span><button className={panel.buy} onClick={() => buyEquipment(item.id)} disabled={complete || coins < item.cost}>{complete ? "Complete" : "Upgrade"}</button></div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
