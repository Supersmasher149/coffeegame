import { saveSnapshot } from "../systems/saveSystem"
import { getGameSnapshot, useGameStore } from "../store/gameStore"
import panel from "./FeaturePanel.module.css"
import styles from "./SettingsScreen.module.css"

export default function SettingsScreen() {
  const settings = useGameStore((state) => state.settings)
  const update = useGameStore((state) => state.updateSettings)
  const setScreen = useGameStore((state) => state.setScreen)
  const clearToast = useGameStore((state) => state.clearToast)

  const manualSave = async () => {
    await saveSnapshot(getGameSnapshot())
    clearToast()
    window.alert("Cafe saved locally.")
  }

  const sliders = [
    ["Music", "musicVolume"],
    ["Sound effects", "sfxVolume"],
    ["Cafe ambience", "ambienceVolume"],
  ] as const

  return (
    <div className={panel.overlay} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <section className={panel.panel}>
        <header className={panel.header}>
          <div><p className={panel.eyebrow}>A few quiet adjustments</p><h2 id="settings-title">Settings</h2></div>
          <button className={panel.close} onClick={() => setScreen("cafe")} autoFocus>Back to cafe</button>
        </header>
        <div className={styles.settings}>
          <section>
            <h3>Sound</h3>
            {sliders.map(([label, key]) => <label className={styles.slider} key={key}><span>{label}<b>{Math.round(settings[key] * 100)}%</b></span><input type="range" min="0" max="1" step="0.05" value={settings[key]} onChange={(event) => update({ [key]: Number(event.target.value) })} /></label>)}
          </section>
          <section>
            <h3>Comfort</h3>
            <label className={styles.toggle}><span><strong>Show gentle guidance</strong><small>Keep contextual tips visible during early days.</small></span><input type="checkbox" checked={settings.showTutorial} onChange={(event) => update({ showTutorial: event.target.checked })} /></label>
            <label className={styles.toggle}><span><strong>Reduced motion</strong><small>Limit decorative animation and transitions.</small></span><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => update({ reducedMotion: event.target.checked })} /></label>
            <label className={styles.toggle}><span><strong>Auto-save</strong><small>Save after purchases, placement, drinks, and day changes.</small></span><input type="checkbox" checked={settings.autoSave} onChange={(event) => update({ autoSave: event.target.checked })} /></label>
          </section>
          <section className={styles.saveCard}>
            <h3>Local save</h3>
            <p>Your cafe lives only in this browser. Manual save writes a fresh IndexedDB snapshot now.</p>
            <button className={panel.buy} onClick={() => void manualSave()}>Save cafe now</button>
          </section>
        </div>
      </section>
    </div>
  )
}
