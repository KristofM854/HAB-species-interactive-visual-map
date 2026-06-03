import './SyndromeSelector.css'

const SYNDROME_ORDER = ['PSP', 'DSP', 'ASP', 'NSP', 'CFP', 'AZP']

export default function SyndromeSelector({ syndromes, selected, onSelect }) {
  return (
    <div className="syndrome-selector">
      {SYNDROME_ORDER.filter(id => syndromes[id]).map(id => {
        const s = syndromes[id]
        const isSelected = selected === id
        return (
          <button
            key={id}
            className={`syndrome-card${isSelected ? ' syndrome-card--active' : ''}`}
            style={{ '--syndrome-color': `var(--color-${id.toLowerCase()})` }}
            onClick={() => onSelect(isSelected ? null : id)}
            aria-pressed={isSelected}
          >
            <span className="syndrome-acronym">{id}</span>
            <span className="syndrome-name">{s.fullName}</span>
          </button>
        )
      })}
    </div>
  )
}
