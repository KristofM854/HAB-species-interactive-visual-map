import { useState, useMemo, useCallback, useEffect } from 'react'
import { ResponsiveSankey } from '@nivo/sankey'
import './SankeyView.css'

const SYNDROME_ORDER = ['PSP', 'DSP', 'ASP', 'NSP', 'CFP', 'AZP']

const SYNDROME_COLORS = {
  PSP: '#e63946',
  DSP: '#f4a261',
  ASP: '#2a9d8f',
  NSP: '#9b5de5',
  CFP: '#f72585',
  AZP: '#4361ee',
}

const NEUTRAL_COLOR = '#4a7399'
const DIM_COLOR     = '#122540'

const MIN_HEIGHT        = 300
const HEIGHT_PER_NODE   = 36

function truncate(str, max = 26) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

function buildSankeyData(activeSyndromes, syndromeMap, allSpecies, showAll) {
  const nodeMap = new Map()   // id → node object
  const linkMap = new Map()   // "src→tgt" → link object

  // Pre-compute which syndromes each toxin belongs to (across all syndromes, for neutral-color logic)
  const toxinToAllSyndromes = {}
  for (const [sid, sdata] of Object.entries(syndromeMap)) {
    for (const t of (sdata.toxins || [])) {
      ;(toxinToAllSyndromes[t] ??= new Set()).add(sid)
    }
  }

  const addNode = (id, label, color, type, aphiaId = null) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, label, nodeColor: color, type, aphiaId })
    }
  }

  const addLink = (source, target) => {
    const key = `${source}→${target}`
    if (!linkMap.has(key)) {
      linkMap.set(key, { source, target, value: 1 })
    }
  }

  for (const syndromeId of activeSyndromes) {
    const sdata = syndromeMap[syndromeId]
    if (!sdata) continue

    const synColor  = SYNDROME_COLORS[syndromeId]
    const synNodeId = `syndrome:${syndromeId}`
    addNode(synNodeId, syndromeId, synColor, 'syndrome')

    const synToxinSet = new Set(sdata.toxins)

    // Species that produce at least one toxin from this syndrome
    const relevantSpecies = allSpecies.filter(sp =>
      sp.toxins?.some(t => synToxinSet.has(t))
    )

    // Toxins that are both in the syndrome map AND actually produced by at least one species
    const usedToxins = new Set()
    for (const sp of relevantSpecies) {
      for (const t of (sp.toxins || [])) {
        if (synToxinSet.has(t)) usedToxins.add(t)
      }
    }

    for (const toxin of usedToxins) {
      const toxNodeId  = `toxin:${toxin}`
      const isShared   = showAll && (toxinToAllSyndromes[toxin]?.size ?? 0) > 1
      addNode(toxNodeId, toxin, isShared ? NEUTRAL_COLOR : synColor, 'toxin')
      addLink(synNodeId, toxNodeId)
    }

    for (const sp of relevantSpecies) {
      const spNodeId = `species:${sp.aphiaId}`

      const spSyndromeCount = activeSyndromes.filter(sid => {
        const stoxins = new Set(syndromeMap[sid]?.toxins || [])
        return sp.toxins?.some(t => stoxins.has(t))
      }).length

      const isShared = showAll && spSyndromeCount > 1
      addNode(spNodeId, sp.scientificName, isShared ? NEUTRAL_COLOR : synColor, 'species', sp.aphiaId)

      for (const toxin of (sp.toxins || [])) {
        if (usedToxins.has(toxin)) {
          addLink(`toxin:${toxin}`, spNodeId)
        }
      }
    }
  }

  return { nodes: [...nodeMap.values()], links: [...linkMap.values()] }
}

function getConnectedIds(nodeId, links) {
  const connected = new Set([nodeId])
  for (const link of links) {
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    if (src === nodeId) connected.add(tgt)
    if (tgt === nodeId) connected.add(src)
  }
  return connected
}

export default function SankeyView({ syndromes, species, selectedSyndrome, onSpeciesFocus }) {
  const [showAll,        setShowAll]        = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  const activeSyndromes = useMemo(() => {
    if (showAll) return SYNDROME_ORDER.filter(id => syndromes[id])
    return [selectedSyndrome || 'PSP']
  }, [showAll, selectedSyndrome, syndromes])

  const { nodes, links } = useMemo(
    () => buildSankeyData(activeSyndromes, syndromes, species, showAll),
    [activeSyndromes, syndromes, species, showAll]
  )

  const height = useMemo(() => {
    const toxinCount   = nodes.filter(n => n.type === 'toxin').length
    const speciesCount = nodes.filter(n => n.type === 'species').length
    return Math.max(MIN_HEIGHT, Math.max(toxinCount, speciesCount) * HEIGHT_PER_NODE + 80)
  }, [nodes])

  const connectedIds = useMemo(
    () => selectedNodeId ? getConnectedIds(selectedNodeId, links) : null,
    [selectedNodeId, links]
  )

  // Reset selection when scope changes
  useEffect(() => { setSelectedNodeId(null) }, [selectedSyndrome, showAll])

  const getNodeColor = useCallback((node) => {
    if (!connectedIds) return node.nodeColor ?? NEUTRAL_COLOR
    return connectedIds.has(node.id) ? (node.nodeColor ?? NEUTRAL_COLOR) : DIM_COLOR
  }, [connectedIds])

  const handleNodeClick = useCallback((node) => {
    if (node.type === 'species' && node.aphiaId != null) {
      onSpeciesFocus?.(node.aphiaId)
    }
    setSelectedNodeId(prev => prev === node.id ? null : node.id)
  }, [onSpeciesFocus])

  if (nodes.length === 0) {
    return (
      <div className="sankey-empty">
        No species with toxin data for this selection.
      </div>
    )
  }

  return (
    <div className="sankey-view">
      <div className="sankey-header">
        <div className="sankey-col-labels" aria-hidden="true">
          <span>SYNDROME</span>
          <span>TOXIN</span>
          <span>SPECIES</span>
        </div>
        <button
          className={`sankey-toggle${showAll ? ' sankey-toggle--active' : ''}`}
          onClick={() => setShowAll(v => !v)}
          aria-pressed={showAll}
        >
          {showAll ? 'Focus on selected' : 'Show all syndromes'}
        </button>
      </div>

      <div className="sankey-scroll">
        <div className="sankey-inner" style={{ height }}>
          <ResponsiveSankey
            data={{ nodes, links }}
            margin={{ top: 8, right: 200, bottom: 8, left: 8 }}
            align="justify"
            colors={getNodeColor}
            nodeOpacity={1}
            nodeThickness={16}
            nodeInnerPadding={3}
            nodeSpacing={22}
            nodeBorderWidth={0}
            linkOpacity={connectedIds ? 0.12 : 0.4}
            linkHoverOpacity={0.75}
            linkHoverOthersOpacity={0.08}
            linkContract={2}
            enableLinkGradient={true}
            label={node =>
              node.type === 'species'
                ? truncate(node.label, 26)
                : node.label
            }
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={14}
            labelTextColor="#7da5c8"
            onClick={handleNodeClick}
            animate={true}
            motionConfig="gentle"
            theme={{
              background: 'transparent',
              tooltip: {
                container: {
                  background: '#0c1e35',
                  color: '#ddeeff',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #1e3a5f',
                  padding: '6px 10px',
                },
              },
            }}
            nodeTooltip={({ node }) => (
              <div className="sankey-tooltip">
                <em className="sankey-tooltip-name">{node.label}</em>
                <span className="sankey-tooltip-type">{node.type}</span>
              </div>
            )}
          />
        </div>
      </div>

      {selectedNodeId && (
        <p className="sankey-hint">Tap the node again to deselect</p>
      )}
    </div>
  )
}
