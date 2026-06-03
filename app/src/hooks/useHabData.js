import { useMemo } from 'react'
import speciesData from '../data/hab-species.v20260603.json'
import syndromeMap from '../data/toxin-syndrome-map.json'

export function useHabData() {
  const { species, meta } = speciesData

  const speciesBySyndrome = useMemo(() => {
    const result = {}
    for (const syndromeId of Object.keys(syndromeMap)) {
      const syndromeTokens = new Set(syndromeMap[syndromeId].toxins)
      result[syndromeId] = species.filter(sp =>
        sp.toxins?.some(t => syndromeTokens.has(t))
      )
    }
    return result
  }, [])

  return {
    syndromes: syndromeMap,
    species,
    speciesBySyndrome,
    meta,
    error: null,
  }
}
