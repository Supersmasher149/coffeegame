import { Howler } from "howler"
import type { SettingsState } from "../types/game"

let sfxVolume = 0.65

export const syncAudioSettings = (settings: SettingsState) => {
  sfxVolume = settings.sfxVolume
  Howler.volume(1)
}

export const playTone = (kind: "click" | "coin" | "perfect" = "click") => {
  const context = Howler.ctx
  const output = Howler.masterGain
  if (!context || !output) return
  if (context.state === "suspended") void context.resume()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime
  oscillator.type = kind === "perfect" ? "sine" : "triangle"
  oscillator.frequency.setValueAtTime(kind === "coin" ? 620 : kind === "perfect" ? 740 : 300, now)
  if (kind !== "click") oscillator.frequency.exponentialRampToValueAtTime(kind === "perfect" ? 1120 : 820, now + 0.12)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.08 * sfxVolume), now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
  oscillator.connect(gain)
  gain.connect(output)
  oscillator.start(now)
  oscillator.stop(now + 0.2)
}
