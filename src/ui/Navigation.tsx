import type { AppScreen } from "../types/game"
import { useGameStore } from "../store/gameStore"
import styles from "./Navigation.module.css"

const links: Array<{ screen: AppScreen; label: string; mark: string }> = [
  { screen: "cafe", label: "Cafe", mark: "C" },
  { screen: "recipes", label: "Recipes", mark: "R" },
  { screen: "shop", label: "Shop", mark: "$" },
  { screen: "decorate", label: "Decorate", mark: "D" },
  { screen: "cats", label: "Cats", mark: "M" },
  { screen: "settings", label: "Settings", mark: "S" },
]

export default function Navigation() {
  const screen = useGameStore((state) => state.screen)
  const setScreen = useGameStore((state) => state.setScreen)
  return (
    <nav className={styles.nav} aria-label="Cafe menu">
      {links.map((link) => (
        <button key={link.screen} className={screen === link.screen ? styles.active : ""} aria-current={screen === link.screen ? "page" : undefined} onClick={() => setScreen(link.screen)}>
          <i>{link.mark}</i><span>{link.label}</span>
        </button>
      ))}
    </nav>
  )
}
