import { useState, useEffect } from 'react'
import ImageAttribution from './ImageAttribution.jsx'
import './SpeciesCard.css'

export default function SpeciesCard({ species, syndrome, focused }) {
  const [expanded, setExpanded] = useState(false)
  const { scientificName, authority, classification, toxins, notes, image } = species

  useEffect(() => {
    if (focused) {
      setExpanded(true)
      document.getElementById(`species-card-${species.aphiaId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focused, species.aphiaId])

  return (
    <div
      id={`species-card-${species.aphiaId}`}
      className={`species-card${expanded ? ' species-card--expanded' : ''}${focused ? ' species-card--focused' : ''}`}
      style={{ '--syndrome-color': `var(--color-${syndrome.toLowerCase()})` }}
    >
      <button
        className="species-card-trigger"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${scientificName}`}
      >
        <div className="species-thumb-wrap">
          {image?.url ? (
            <img
              src={image.url}
              alt={`Microscopy image of ${scientificName}`}
              className="species-thumb"
              loading="lazy"
              onError={e => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling.removeAttribute('hidden')
              }}
            />
          ) : null}
          <div
            className="species-thumb-placeholder"
            hidden={!!image?.url}
            aria-hidden="true"
          >
            <span>No image</span>
          </div>
        </div>

        <div className="species-name-block">
          <em className="species-name">{scientificName}</em>
          {authority && <span className="species-authority">{authority}</span>}
        </div>
      </button>

      {expanded && (
        <div className="species-detail">
          {classification && (
            <dl className="species-taxonomy">
              {['phylum', 'class', 'order', 'family', 'genus'].map(rank =>
                classification[rank] ? (
                  <div key={rank} className="taxonomy-row">
                    <dt>{rank.charAt(0).toUpperCase() + rank.slice(1)}</dt>
                    <dd>{classification[rank]}</dd>
                  </div>
                ) : null
              )}
            </dl>
          )}

          {toxins?.length > 0 && (
            <div className="species-toxins">
              <span className="detail-label">Toxins</span>
              <div className="toxin-tags">
                {toxins.map(t => <span key={t} className="toxin-tag">{t}</span>)}
              </div>
            </div>
          )}

          {notes && <p className="species-notes">{notes}</p>}

          {image?.credit && <ImageAttribution image={image} />}
        </div>
      )}
    </div>
  )
}
