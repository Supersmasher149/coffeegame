import { useEffect, useMemo, useRef, useState } from "react"
import type { MinigameResult } from "../../types/game"
import styles from "./MinigameOverlay.module.css"

interface LatteArtGameProps {
  onComplete: (result: MinigameResult) => void
  pattern?: "heart" | "leaf" | "tulip" | "cat" | "star"
}

const patterns = {
  heart: [[50, 79], [34, 65], [24, 48], [28, 31], [41, 27], [50, 39], [59, 27], [72, 31], [76, 48], [66, 65], [50, 79]],
  leaf: [[24, 72], [34, 60], [44, 49], [55, 39], [70, 29], [65, 44], [57, 57], [45, 68], [31, 75], [44, 56], [58, 43]],
  tulip: [[50, 79], [40, 65], [35, 51], [42, 39], [50, 49], [58, 39], [65, 51], [60, 65], [50, 79], [50, 56], [50, 31]],
  cat: [[31, 68], [27, 41], [38, 27], [48, 39], [58, 27], [70, 41], [67, 68], [49, 77], [31, 68], [40, 53], [58, 53]],
  star: [[50, 22], [57, 43], [79, 43], [61, 56], [68, 78], [50, 65], [32, 78], [39, 56], [21, 43], [43, 43], [50, 22]],
} satisfies Record<string, number[][]>

export default function LatteArtGame({ onComplete, pattern = "heart" }: LatteArtGameProps) {
  const [drawing, setDrawing] = useState(false)
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const surfaceRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const points = patterns[pattern]
  const path = useMemo(() => points.map(([x, y]) => `${x},${y}`).join(" "), [points])

  useEffect(() => surfaceRef.current?.focus(), [])

  const trace = (clientX: number, clientY: number) => {
    const bounds = surfaceRef.current?.getBoundingClientRect()
    if (!bounds) return
    const x = (clientX - bounds.left) / bounds.width * 100
    const y = (clientY - bounds.top) / bounds.height * 100
    setVisited((current) => {
      const next = new Set(current)
      const [px, py] = points[current.size]
      if (Math.hypot(px - x, py - y) < 10) next.add(current.size)
      return next
    })
  }

  const finish = () => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete({ type: "latteArt", accuracy: visited.size / points.length })
  }

  const advanceWithKeyboard = () => {
    setVisited((current) => {
      const next = new Set(current)
      if (next.size < points.length) next.add(next.size)
      return next
    })
  }

  return (
    <div className={styles.artLayout}>
      <div
        ref={surfaceRef}
        className={styles.latteSurface}
        role="application"
        tabIndex={0}
        aria-label={`Trace the ${pattern} art. Press Space or Right Arrow to follow each checkpoint.`}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDrawing(true); trace(event.clientX, event.clientY) }}
        onPointerMove={(event) => { if (drawing) trace(event.clientX, event.clientY) }}
        onPointerUp={() => setDrawing(false)}
        onPointerCancel={() => setDrawing(false)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "ArrowRight" || event.key === "Enter") {
            event.preventDefault()
            advanceWithKeyboard()
          }
        }}
      >
        <svg viewBox="0 0 100 100" aria-label="Trace the heart from the glowing dot">
          <polyline points={path} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.4" strokeDasharray="2 3" />
          {points.map(([x, y], index) => <circle key={`${x}-${y}-${index}`} cx={x} cy={y} r={visited.has(index) ? 3.4 : index === 0 ? 3.8 : 2.2} fill={visited.has(index) ? "#fff7cf" : index === 0 ? "#f6d177" : "rgba(255,255,255,.58)"} />)}
        </svg>
      </div>
      <div className={styles.gameContent}>
        <p className={styles.kicker}>Finishing touch</p>
        <h2>Pour a {pattern}</h2>
        <p>Press and trace through the glowing path. Keyboard players can follow checkpoints with Space.</p>
        <div className={styles.artScore}><i style={{ width: `${visited.size / points.length * 100}%` }} /><span>{visited.size} / {points.length} points</span></div>
        <button className={styles.actionButton} onClick={finish}>Finish the art</button>
      </div>
    </div>
  )
}
