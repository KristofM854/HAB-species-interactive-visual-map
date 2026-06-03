# HAB Data Pipeline

Fetches the IOC-UNESCO Taxonomic Reference List of Harmful Micro Algae via SHARK4R, then enriches each species with taxonomy and images from the WoRMS REST API. Writes a versioned static JSON file consumed by the React app.

## Prerequisites

R ≥ 4.2, plus:

```r
install.packages(c("httr2", "jsonlite", "dplyr", "purrr"))
devtools::install_github("sharksmhi/SHARK4R")
```

## Running

From the repository root:

```bash
Rscript data-pipeline/R/pull_hab_data.R
```

Or open `pull_hab_data.R` in RStudio and source it.

Output: `app/src/data/hab-species.vYYYYMMDD.json`

After the run:
1. Update the import path in `app/src/hooks/useHabData.js` to the new filename.
2. Commit both the JSON file and the updated hook.

## Image licensing

Each species image record carries a `licenseUsable` flag:

| Value  | Meaning |
|--------|---------|
| `true`  | CC0, CC BY, CC BY-SA — safe to display publicly |
| `false` | CC BY-NC, all-rights-reserved, etc. — exclude |
| `null`  | License string unparseable — manual review required |

The pipeline does **not** automatically exclude `licenseUsable: false` images from the JSON; filtering is applied at the app layer.

## Output schema

See `data-pipeline/schema/hab-species.schema.json`.

## Known TODOs

- Verify SHARK4R column names (`AphiaID`, `ScientificName`, `Authority`) against actual `get_hab_list()` output — column names may differ by package version.
- Wire toxin codes: parse from `get_toxin_list()` join or IOC per-species attributes. Currently written as `[]`.
- Rate limit: 300 ms between WoRMS requests. Full IOC list (~200+ species) takes ~5–10 minutes.
