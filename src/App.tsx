import { lazy, Suspense, useEffect, useRef, useState } from "react"
import styles from "./App.module.css"
import { customerById } from "./data/customers"
import { playTone, syncAudioSettings } from "./systems/audioSystem"
import { loadSnapshot, saveSnapshot } from "./systems/saveSystem"
import { gameStore, getGameSnapshot, useGameStore } from "./store/gameStore"
import type { GameSnapshot } from "./types/game"
import CatCollection from "./ui/CatCollection"
import DailySpecial from "./ui/DailySpecial"
import DaySummary from "./ui/DaySummary"
import DecorationScreen from "./ui/DecorationScreen"
import HUD from "./ui/HUD"
import MinigameOverlay from "./ui/minigames/MinigameOverlay"
import Navigation from "./ui/Navigation"
import RecipeBook from "./ui/RecipeBook"
import SettingsScreen from "./ui/SettingsScreen"
import ShopScreen from "./ui/ShopScreen"
import TitleScreen from "./ui/TitleScreen"

const CafeScreen = lazy(() => import("./ui/CafeScreen"))

export default function App() {
  const hydrated = useGameStore((state) => state.hydrated)
  const started = useGameStore((state) => state.started)
  const screen = useGameStore((state) => state.screen)
  const specialOpen = useGameStore((state) => state.specialOpen)
  const dialogue = useGameStore((state) => state.dialogue)
  const toast = useGameStore((state) => state.toast)
  const settings = useGameStore((state) => state.settings)
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const tick = useGameStore((state) => state.tick)
  const newGame = useGameStore((state) => state.newGame)
  const hydrate = useGameStore((state) => state.hydrate)
  const dismissDialogue = useGameStore((state) => state.dismissDialogue)
  const clearToast = useGameStore((state) => state.clearToast)
  const [availableSave, setAvailableSave] = useState<GameSnapshot | null>(null)
  const startedRef = useRef(started)
  const gameRef = useRef<HTMLDivElement>(null)
  startedRef.current = started

  useEffect(() => {
    let active = true
    loadSnapshot().then((snapshot) => {
      if (!active) return
      setAvailableSave(snapshot)
      hydrate(null)
    }).catch(() => hydrate(null))
    return () => { active = false }
  }, [hydrate])

  useEffect(() => {
    if (!started) return
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [started, tick])

  useEffect(() => {
    syncAudioSettings(settings)
  }, [settings])

  useEffect(() => {
    let timeout = 0
    const unsubscribe = gameStore.subscribe((state, previous) => {
      if (!state.started || !state.settings.autoSave || state.lastSaved === previous.lastSaved) return
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => { void saveSnapshot(getGameSnapshot()) }, 500)
    })
    const saveOnHide = () => {
      if (startedRef.current && document.visibilityState === "hidden") void saveSnapshot(getGameSnapshot())
    }
    const saveBeforeClose = () => {
      if (startedRef.current) void saveSnapshot(getGameSnapshot())
    }
    document.addEventListener("visibilitychange", saveOnHide)
    window.addEventListener("beforeunload", saveBeforeClose)
    return () => {
      unsubscribe()
      window.clearTimeout(timeout)
      document.removeEventListener("visibilitychange", saveOnHide)
      window.removeEventListener("beforeunload", saveBeforeClose)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    if (/coins|perfect/i.test(toast)) playTone(/perfect/i.test(toast) ? "perfect" : "coin")
    const timeout = window.setTimeout(clearToast, 3200)
    return () => window.clearTimeout(timeout)
  }, [toast, clearToast])

  const modalOpen = specialOpen || Boolean(activeOrderId) || Boolean(dialogue) || screen !== "cafe"

  useEffect(() => {
    if (gameRef.current) gameRef.current.inert = modalOpen
  }, [modalOpen])

  if (!hydrated) return <div className={styles.loading}>Warming the espresso machine...</div>

  if (!started) {
    return (
      <div className={styles.app}>
        <TitleScreen canContinue={Boolean(availableSave)} onNewGame={(name) => { playTone("click"); newGame(name) }} onContinue={() => availableSave && hydrate(availableSave)} />
      </div>
    )
  }

  const speaker = dialogue ? customerById[dialogue.customerId] : null

  return (
    <div className={styles.app} data-reduced-motion={settings.reducedMotion}>
      <div className={styles.game} ref={gameRef} aria-hidden={modalOpen || undefined}>
        <Suspense fallback={<div className={styles.loading}>Opening the cafe...</div>}><CafeScreen /></Suspense>
        {screen !== "summary" && <HUD />}
        {screen === "cafe" && !activeOrderId && !specialOpen && !dialogue && <Navigation />}
      </div>
      {screen === "recipes" && <RecipeBook />}
      {screen === "shop" && <ShopScreen />}
      {screen === "cats" && <CatCollection />}
      {screen === "decorate" && <DecorationScreen />}
      {screen === "settings" && <SettingsScreen />}
      {screen === "summary" && <DaySummary />}
      {specialOpen && <DailySpecial />}
      {activeOrderId && <MinigameOverlay />}
      {dialogue && speaker && (
        <div className={styles.scrim} role="dialog" aria-modal="true" aria-label={`Conversation with ${speaker.name}`}>
          <section className={styles.dialogue}>
            <div className={styles.speaker}>
              <span className={styles.portrait} style={{ background: speaker.color }}>{speaker.avatar}</span>
              <div><strong>{speaker.name}</strong><span>{speaker.title}</span></div>
            </div>
            <p className={styles.quote}>"{dialogue.text}"</p>
            {dialogue.reward && <p className={styles.reward}>New: {dialogue.reward}</p>}
            <button className={styles.primary} onClick={dismissDialogue} autoFocus>That means a lot</button>
          </section>
        </div>
      )}
      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </div>
  )
}
