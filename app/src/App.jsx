import { useState } from 'react'
import SyndromeSelector from './components/SyndromeSelector.jsx'
import SpeciesGrid from './components/SpeciesGrid.jsx'
import About from './components/About.jsx'
import { useHabData } from './hooks/useHabData.js'
import './App.css'

export default function App() {
  const { syndromes, speciesBySyndrome, error } = useHabData()
  const [selectedSyndrome, setSelectedSyndrome] = useState(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-title">
            <h1>HAB Species Map</h1>
            <p className="header-subtitle">Marine biotoxin syndromes &amp; causative microalgae</p>
          </div>
          <nav className="header-nav">
            <button className="nav-link" onClick={() => setShowAbout(true)}>About</button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">Failed to load species data: {error}</div>
        )}

        <section className="section-syndromes">
          <p className="section-label">Select a poisoning syndrome</p>
          <SyndromeSelector
            syndromes={syndromes}
            selected={selectedSyndrome}
            onSelect={setSelectedSyndrome}
          />
        </section>

        {selectedSyndrome ? (
          <section className="section-species">
            <SpeciesGrid
              syndrome={selectedSyndrome}
              syndromeInfo={syndromes[selectedSyndrome]}
              species={speciesBySyndrome[selectedSyndrome] ?? []}
            />
          </section>
        ) : (
          <div className="empty-state">
            <p>Choose a syndrome above to explore associated HAB species.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Species data:&nbsp;
          <a href="https://ioc-unesco.org" target="_blank" rel="noopener">IOC-UNESCO</a>
          &nbsp;/&nbsp;
          <a href="https://www.marinespecies.org" target="_blank" rel="noopener">WoRMS</a>.
          &nbsp;Code:&nbsp;
          <a href="https://github.com/kristofm854/hab-species-interactive-visual-map" target="_blank" rel="noopener">MIT license</a>.
          &nbsp;Non-commercial educational use.
        </p>
      </footer>

      {showAbout && <About onClose={() => setShowAbout(false)} />}
    </div>
  )
}
