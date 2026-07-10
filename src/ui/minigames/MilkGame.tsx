import { useEffect, useRef, useState } from "react"
import type { MinigameResult } from "../../types/game"
import styles from "./MinigameOverlay.module.css"

interface MilkGameProps {
  recipeId: string
  onComplete: (result: MinigameResult) => void
}

const targets: Record<string, [number, number]> = {
  latte: [0.78, 0.36],
  cappuccino: [0.8, 0.75],
  "flat-white": [0.68, 0.18],
  macchiato: [0.75, 0.55],
  mocha: [0.76, 0.4],
  "hot-chocolate": [0.72, 0.32],
  "chai-latte": [0.72, 0.42],
}

export default function MilkGame({ recipeId, onComplete }: MilkGameProps) {
  const [temperature, setTemperature] = useState(0.18)
  const [foam, setFoam] = useState(0.05)
  const [timeLeft, setTimeLeft] = useState(5)
  const [holding, setHolding] = useState(false)
  const holdingRef = useRef(false)
  const valuesRef = useRef([temperature, foam])
  const completedRef = useRef(false)
  const target = targets[recipeId] ?? [0.75, 0.4]

  useEffect(() => {
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000
      const [currentTemperature, currentFoam] = valuesRef.current
      const nextTemperature = Math.max(0, Math.min(1, currentTemperature + (holdingRef.current ? 0.014 : -0.004)))
      const foamChange = holdingRef.current && nextTemperature > 0.48 ? 0.009 : holdingRef.current ? -0.001 : -0.002
      const nextFoam = Math.max(0, Math.min(1, currentFoam + foamChange))
      valuesRef.current = [nextTemperature, nextFoam]
      setTemperature(nextTemperature)
      setFoam(nextFoam)
      setTimeLeft(Math.max(0, 5 - elapsed))
      if (elapsed >= 5 && !completedRef.current) {
        completedRef.current = true
        window.clearInterval(timer)
        const distance = Math.hypot(nextTemperature - target[0], nextFoam - target[1])
        onComplete({ type: "milk", accuracy: Math.max(0, 1 - distance / 0.75) })
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [onComplete, target])

  const setSteam = (active: boolean) => {
    holdingRef.current = active
    setHolding(active)
  }

  return (
    <div className={styles.gameBody}>
      <div className={styles.pitcher} aria-hidden="true">
        <div className={styles.milkLevel} style={{ height: `${32 + foam * 40}%`, background: `hsl(${205 - temperature * 160} 45% ${88 - temperature * 8}%)` }} />
        <div className={`${styles.steamCloud} ${holding ? styles.activeSteam : ""}`}><i /><i /><i /></div>
      </div>
      <div className={styles.gameContent}>
        <p className={styles.kicker}>Milk pitcher</p>
        <h2>Texture the milk</h2>
        <p>Hold to heat. Foam builds once the milk is warm.</p>
        <div className={styles.milkGauge}>
          <span className={styles.milkTarget} style={{ left: `${target[1] * 100}%`, bottom: `${target[0] * 100}%` }} />
          <i style={{ left: `${foam * 100}%`, bottom: `${temperature * 100}%` }} />
          <b>foam</b><em>heat</em>
        </div>
        <div className={styles.timer}><i style={{ width: `${timeLeft / 5 * 100}%` }} /></div>
        <button
          className={`${styles.actionButton} ${holding ? styles.holding : ""}`}
          autoFocus
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setSteam(true) }}
          onPointerUp={() => setSteam(false)}
          onPointerCancel={() => setSteam(false)}
          onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") setSteam(true) }}
          onKeyUp={() => setSteam(false)}
        >
          {holding ? "Steaming... release to cool" : "Press and hold to steam"}
        </button>
      </div>
    </div>
  )
}
