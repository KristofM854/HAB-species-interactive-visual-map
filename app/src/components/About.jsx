import './About.css'

export default function About({ onClose }) {
  return (
    <div
      className="about-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="About this tool"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="about-panel">
        <div className="about-header">
          <h2>About</h2>
          <button className="about-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-body">
          <section>
            <h3>What is this?</h3>
            <p>
              An interactive educational tool mapping marine biotoxin poisoning syndromes
              to the harmful microalgal (HAB) species that cause them. For educational use only —
              not a clinical reference.
            </p>
          </section>

          <section>
            <h3>Data sources</h3>
            <p>
              Species data derives from the{' '}
              <a href="https://www.ioc-unesco.org/" target="_blank" rel="noopener">IOC-UNESCO</a>{' '}
              Taxonomic Reference List of Harmful Micro Algae, accessed via the{' '}
              <a href="https://www.marinespecies.org/" target="_blank" rel="noopener">World Register of Marine Species (WoRMS)</a>{' '}
              REST API and the SHARK4R R package.
              The IOC-UNESCO dataset is published under{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.
            </p>
            <p>
              Species images are sourced from WoRMS and individually credited.
              License terms vary by image; images with restrictive terms are excluded.
            </p>
          </section>

          <section>
            <h3>Methods</h3>
            <p>
              An R pipeline (SHARK4R + WoRMS REST API) generates a versioned static JSON
              snapshot committed to the repository. The application reads only this
              committed file — no runtime API calls are made at browse time.
            </p>
            <p>
              The toxin→syndrome mapping is curated manually in{' '}
              <code>app/src/data/toxin-syndrome-map.json</code>.
              One toxin code may appear in multiple syndromes (many-to-many).
            </p>
          </section>

          <section>
            <h3>Citation &amp; code</h3>
            <p>
              Source code:{' '}
              <a href="https://github.com/kristofm854/hab-species-interactive-visual-map" target="_blank" rel="noopener">
                github.com/kristofm854/hab-species-interactive-visual-map
              </a>{' '}
              (MIT license).
            </p>
            <p>
              <strong>Zenodo DOI:</strong>{' '}
              <span className="placeholder-doi">— pending first archive release —</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
