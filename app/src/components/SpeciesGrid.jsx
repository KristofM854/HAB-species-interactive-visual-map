import SpeciesCard from './SpeciesCard.jsx'
import './SpeciesGrid.css'

export default function SpeciesGrid({ syndrome, syndromeInfo, species }) {
  return (
    <div className="species-grid-section">
      <div className="species-grid-header">
        <h2
          className="species-grid-title"
          style={{ '--syndrome-color': `var(--color-${syndrome.toLowerCase()})` }}
        >
          {syndromeInfo.fullName}
          <span className="species-grid-acronym">{syndrome}</span>
        </h2>
        {syndromeInfo.shortDescription && (
          <p className="species-grid-desc">{syndromeInfo.shortDescription}</p>
        )}
        <p className="species-grid-count">
          {species.length} associated {species.length === 1 ? 'species' : 'species'} in this dataset
        </p>
      </div>

      {species.length === 0 ? (
        <p className="species-grid-empty">
          No species found for {syndrome} in the current dataset.
        </p>
      ) : (
        <div className="species-grid">
          {species.map(sp => (
            <SpeciesCard key={sp.aphiaId} species={sp} syndrome={syndrome} />
          ))}
        </div>
      )}
    </div>
  )
}
