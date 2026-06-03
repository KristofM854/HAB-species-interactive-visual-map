import { useState, useCallback } from 'react'
import SyndromeSelector from './components/SyndromeSelector.jsx'
import SpeciesGrid from './components/SpeciesGrid.jsx'
import SankeyView from './components/SankeyView.jsx'
import About from './components/About.jsx'
import { useHabData } from './hooks/useHabData.js'
import './App.css'

export default function App() {
  const { syndromes, species, speciesBySyndrome, error } = useHabData()
  const [selectedSyndrome, setSelectedSyndrome] = useState('PSP')
  const [showAbout, setShowAbout] = useState(false)
  const [focusedSpeciesId, setFocusedSpeciesId] = useState(null)

  const handleSpeciesFocus = useCallback((aphiaId) => {
    const sp = species.find(s => s.aphiaId === aphiaId)
    if (!sp) return
    // If no syndrome selected, switch to first matching one
    if (!selectedSyndrome) {
      const first = ['PSP','DSP','ASP','NSP','CFP','AZP'].find(sid => {
        const ts = new Set(syndromes[sid]?.toxins || [])
        return sp.toxins?.some(t => ts.has(t))
      })
      if (first) setSelectedSyndrome(first)
    }
    setFocusedSpeciesId(aphiaId)
    setTimeout(() => setFocusedSpeciesId(null), 2500)
  }, [species, syndromes, selectedSyndrome])

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

        <section className="section-sankey">
          <p className="section-label">Syndrome → Toxin → Species</p>
          <SankeyView
            syndromes={syndromes}
            species={species}
            selectedSyndrome={selectedSyndrome}
            onSpeciesFocus={handleSpeciesFocus}
          />
        </section>

        <section className="section-syndromes">
          <p className="section-label">Select a poisoning syndrome</p>
          <SyndromeSelector
            syndromes={syndromes}
            selected={selectedSyndrome}
            onSelect={setSelectedSyndrome}
          />
        </section>

        {selectedSyndrome && (
          <section className="section-species">
            <SpeciesGrid
              syndrome={selectedSyndrome}
              syndromeInfo={syndromes[selectedSyndrome]}
              species={speciesBySyndrome[selectedSyndrome] ?? []}
              focusedSpeciesId={focusedSpeciesId}
              onSpeciesFocus={handleSpeciesFocus}
            />
          </section>
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
