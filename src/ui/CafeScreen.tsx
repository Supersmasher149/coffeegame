import { customerById } from "../data/customers"
import { recipeById } from "../data/recipes"
import CafeCanvas from "../game/CafeCanvas"
import { getCafeCapacity } from "../systems/gameRules"
import { useGameStore } from "../store/gameStore"
import styles from "./CafeScreen.module.css"

export default function CafeScreen() {
  const activeCustomers = useGameStore((state) => state.activeCustomers)
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const acceptOrder = useGameStore((state) => state.acceptOrder)
  const decorations = useGameStore((state) => state.cafe.decorations)
  const showTutorial = useGameStore((state) => state.settings.showTutorial)
  const visibleOrders = activeCustomers.filter((customer) => customer.status !== "served")
  const capacity = getCafeCapacity(decorations)

  return (
    <main className={styles.cafe}>
      <CafeCanvas />
      <aside className={styles.orders} aria-label="Waiting orders">
        <div className={styles.ordersHead}>
          <span>Order rail</span>
          <b>{activeCustomers.length} / {capacity} seats</b>
        </div>
        {visibleOrders.length === 0 ? (
          <div className={styles.quiet}><i /><strong>A quiet moment</strong><span>The bell will ring again soon.</span></div>
        ) : visibleOrders.map((active) => {
          const customer = customerById[active.customerId]
          const recipe = recipeById[active.recipeId]
          const patience = Math.max(0, active.patience / active.maxPatience * 100)
          return (
            <article className={styles.order} key={active.id}>
              <div className={styles.avatar} style={{ background: customer.color }}>{customer.avatar}</div>
              <div className={styles.orderText}>
                <span>{customer.name}</span>
                <strong>{recipe.name}</strong>
                <div className={styles.patience} title={`${Math.round(patience)}% patience`}><i style={{ width: `${patience}%` }} /></div>
              </div>
              <button onClick={() => acceptOrder(active.id)} disabled={Boolean(activeOrderId) || active.status !== "waiting"} aria-label={`Make ${recipe.name} for ${customer.name}`}>Make</button>
            </article>
          )
        })}
      </aside>
      {showTutorial && <div className={styles.hint}>Select an order to step behind the counter</div>}
    </main>
  )
}
