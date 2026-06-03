# CLAUDE.md — HAB Species Interactive Visual Map

Architectural decisions and context for AI-assisted development.

## Project purpose

Educational, non-commercial interactive web tool mapping marine biotoxin poisoning syndromes to the harmful microalgal (HAB) species that cause them. Hosted on GitHub Pages.

## Repo layout

```
/
├── app/                    # React + Vite frontend
│   ├── public/             # Static assets (favicon)
│   └── src/
│       ├── components/     # UI components (each has a paired .css file)
│       ├── data/           # Static JSON: committed snapshots + editable config
│       └── hooks/          # Custom React hooks
├── data-pipeline/
│   ├── R/                  # R script pulling IOC-UNESCO + WoRMS data
│   └── schema/             # JSON Schema for pipeline output validation
└── .github/workflows/      # GitHub Pages deploy on push to main
```

## Architectural decisions

### Data model

- **Static snapshot**: The R pipeline writes a versioned JSON (e.g. `hab-species.v20260603.json`) to `app/src/data/`. The app imports it at build time via `useHabData.js`. No runtime API calls.
- **Syndrome↔species via toxin join**: `toxin-syndrome-map.json` lists toxin codes per syndrome. `useHabData.js` intersects each species' `toxins[]` array with each syndrome's `toxins[]` array at import time.
- **Many-to-many toxin→syndrome**: One toxin code can appear in multiple syndromes (e.g. OA in DSP; PTX in DSP/AZP depending on classification authority).
- **Image handling**: WoRMS image URLs stored as strings in JSON (not downloaded). Images load at browse-time from WoRMS CDN. `licenseUsable` flag (boolean | null) per image: `true` = CC BY variants, `false` = NC/all-rights-reserved, `null` = unknown/needs review.

### Scope tiers

- **v0 / front door**: Six human poisoning syndromes: PSP, DSP, ASP, NSP, CFP, AZP. Defined entirely by `toxin-syndrome-map.json`.
- **Expert layer (future)**: Full IOC framing, fish-killing species, non-toxic harmful species. The config-driven architecture leaves room — add syndromes/species to JSON files without changing component logic.

### Styling

- Plain CSS with CSS custom properties on `:root` in `index.css` (no Tailwind, no CSS Modules).
- Dark ocean theme. Syndrome accent colors as `--color-psp`, `--color-dsp`, etc.
- Each component has a paired `.css` file imported directly from the `.jsx` file.

### Images & licensing

- `ImageAttribution` component is always visible beneath a species image (not hidden behind hover).
- Attribution fields required: `credit` (photographer), `source`, `license`, `licenseUrl`.
- Images with `licenseUsable: false` should eventually be excluded from display. TODO: add filter in `useHabData.js` or `SpeciesGrid`.

### Citability

- `CITATION.cff` at repo root; Zenodo DOI is placeholder until first archive release.
- `About` modal documents IOC-UNESCO + WoRMS provenance and CC-BY 4.0 dataset citation.
- Code is MIT licensed.

## Key files to know

| File | Purpose |
|------|---------|
| `app/src/data/toxin-syndrome-map.json` | **Editable config** — syndrome definitions and toxin code lists |
| `app/src/data/hab-species.v1.json` | Hand-crafted sample (PSP + DSP, 7 species) — replace with pipeline output |
| `app/src/hooks/useHabData.js` | Computes syndrome→species mapping; update import path after each pipeline run |
| `data-pipeline/R/pull_hab_data.R` | R pipeline scaffold — toxin parsing not yet wired |
| `data-pipeline/schema/hab-species.schema.json` | JSON Schema for pipeline output validation |

## Development

```bash
cd app && npm install && npm run dev
```

Build + preview:
```bash
npm run build && npm run preview
```

Deploy: push to `main` — GitHub Actions deploys to GitHub Pages automatically.

## Open TODOs

- Verify SHARK4R column names in `pull_hab_data.R` once run against live API.
- Wire toxin parsing from `get_toxin_list()` / IOC attributes in R pipeline.
- Decide on `licenseUsable: false` display policy: hide silently, show greyed-out, or show with notice.
- After first full pipeline run, update `useHabData.js` import to the versioned filename.
- Populate Zenodo DOI in `CITATION.cff` on first archive release.
- Add cross-link to HAB quiz (same stack, same GitHub org).
