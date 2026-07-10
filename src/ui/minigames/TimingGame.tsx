import { useEffect, useRef, useState } from "react"
import type { MinigameResult, MinigameType } from "../../types/game"
import styles from "./MinigameOverlay.module.css"

interface TimingGameProps {
  type: Extract<MinigameType, "espresso" | "grind" | "tea">
  onComplete: (result: MinigameResult) => void
}

const config = {
  espresso: { title: "Pull the shot", instruction: "Stop in the golden crema band.", target: 0.78, action: "Stop extraction" },
  grind: { title: "Find the grind", instruction: "Catch the marker in the highlighted grind size.", target: 0.34, action: "Stop grinder" },
  tea: { title: "Steep gently", instruction: "Lift the tea as the color reaches its warmest point.", target: 0.72, action: "Lift tea bag" },
}

export default function TimingGame({ type, onComplete }: TimingGameProps) {
  const [position, setPosition] = useState(0.05)
  const [stopped, setStopped] = useState(false)
  const positionRef = useRef(position)
  const directionRef = useRef(1)
  const details = config[type]

  useEffect(() => {
    if (stopped) return
    const timer = window.setInterval(() => {
      let next = positionRef.current + 0.013 * directionRef.current
      if (next >= 1 || next <= 0) {
        directionRef.current *= -1
        next = Math.max(0, Math.min(1, next))
      }
      positionRef.current = next
      setPosition(next)
    }, 30)
    return () => window.clearInterval(timer)
  }, [stopped])

  const stop = () => {
    if (stopped) return
    setStopped(true)
    const accuracy = Math.max(0, 1 - Math.abs(positionRef.current - details.target) / 0.52)
    window.setTimeout(() => onComplete({ type, accuracy }), 420)
  }

  const quality = Math.abs(position - details.target) <= 0.07 ? "Perfect" : Math.abs(position - details.target) <= 0.22 ? "Good" : "Keep watching"

  return (
    <div className={styles.gameBody}>
      <div className={`${styles.appliance} ${styles[type]}`} aria-hidden="true">
        <div className={styles.steam}><i /><i /><i /></div>
        <div className={styles.cupFill} style={{ height: `${20 + position * 72}%` }} />
      </div>
      <div className={styles.gameContent}>
        <p className={styles.kicker}>{type === "grind" ? "Grinder" : type === "tea" ? "Tea service" : "Espresso machine"}</p>
        <h2>{details.title}</h2>
        <p>{details.instruction}</p>
        <div className={styles.timingBar} data-stopped={stopped}>
          <div className={styles.goodZone} style={{ left: `${(details.target - 0.2) * 100}%`, width: "40%" }} />
          <div className={styles.perfectZone} style={{ left: `${(details.target - 0.07) * 100}%`, width: "14%" }} />
          <i style={{ left: `${position * 100}%` }} />
        </div>
        <div className={styles.liveResult}>{stopped ? quality : ""}</div>
        <button className={styles.actionButton} onClick={stop} disabled={stopped} autoFocus>{stopped ? quality : details.action}</button>
      </div>
    </div>
  )
}
