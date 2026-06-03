import './ImageAttribution.css'

export default function ImageAttribution({ image }) {
  if (!image) return null
  const { credit, source, license, licenseUrl } = image

  return (
    <div className="image-attribution" role="note" aria-label="Image attribution">
      <span className="attribution-label">Image</span>
      {credit && <span className="attribution-credit">{credit}</span>}
      {source && <span className="attribution-source">{source}</span>}
      {license && (
        licenseUrl
          ? <a className="attribution-license" href={licenseUrl} target="_blank" rel="noopener noreferrer">{license}</a>
          : <span className="attribution-license">{license}</span>
      )}
    </div>
  )
}
