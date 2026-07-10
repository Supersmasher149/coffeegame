import { useMemo, useState } from "react"
import type { MinigameResult } from "../../types/game"
import styles from "./MinigameOverlay.module.css"

interface AssemblyGameProps {
  order: string[]
  onComplete: (result: MinigameResult) => void
}

const pretty = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function AssemblyGame({ order, onComplete }: AssemblyGameProps) {
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState(0)
  const [shake, setShake] = useState(false)
  const options = useMemo(() => [...order].sort((a, b) => a.localeCompare(b)), [order])

  const add = (ingredient: string) => {
    if (ingredient !== order[step]) {
      setErrors((count) => count + 1)
      setShake(true)
      window.setTimeout(() => setShake(false), 260)
      return
    }
    const nextStep = step + 1
    setStep(nextStep)
    if (nextStep === order.length) {
      window.setTimeout(() => onComplete({ type: "cold", accuracy: errors === 0 ? 1 : errors === 1 ? 0.74 : 0.4 }), 520)
    }
  }

  return (
    <div className={styles.assemblyLayout}>
      <div className={`${styles.assemblyGlass} ${shake ? styles.shake : ""}`} aria-hidden="true">
        {order.map((ingredient, index) => <i key={ingredient} style={{ height: index < step ? `${78 / order.length}%` : 0, background: ["#e9d3a5", "#7a4936", "#eee6d4", "#c78a57"][index % 4] }} />)}
      </div>
      <div className={styles.gameContent}>
        <p className={styles.kicker}>Assembly counter</p>
        <h2>Build it in layers</h2>
        <p>Follow the recipe card from left to right.</p>
        <div className={styles.recipeStrip}>{order.map((item, index) => <span key={item} className={index < step ? styles.done : ""}>{index + 1}. {pretty(item)}</span>)}</div>
        <div className={styles.ingredients}>{options.map((item, index) => <button key={item} onClick={() => add(item)} disabled={step === order.length} autoFocus={index === 0}>{pretty(item)}</button>)}</div>
        <div className={styles.errors}>{errors ? `${errors} little mix-up${errors === 1 ? "" : "s"}` : "Every layer is tidy"}</div>
      </div>
    </div>
  )
}
