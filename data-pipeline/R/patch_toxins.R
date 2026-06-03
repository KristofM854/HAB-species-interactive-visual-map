# patch_toxins.R
#
# Patches an existing hab-species JSON with curated toxin codes.
# Run this after pull_hab_data.R to add toxin codes for known species.
# Review the UNMATCHED output and the resulting JSON before committing.
#
# Usage (from repo root):
#   Rscript data-pipeline/R/patch_toxins.R
#
# Edit INPUT_JSON below to match your versioned filename.

library(jsonlite)

# ── Configuration ─────────────────────────────────────────────────────────────

INPUT_JSON  <- file.path("app", "src", "data", "hab-species.v20260604.json")
OUTPUT_JSON <- INPUT_JSON   # overwrite in place

# ── Toxin lookup table ────────────────────────────────────────────────────────
# Keys  : scientificName as stored in the JSON (matching is case-insensitive)
# Values: character vector of toxin codes that appear in toxin-syndrome-map.json
#
# Sources: Hallegraeff et al. (2021) Harmful Algal Blooms — A Compendium Desk
#   Reference; IOC-UNESCO HAB Programme; strain-level survey literature.
# Note: assignment is conservative. Strain-level variation exists; only
#   well-documented producing strains are listed. Review and adjust as needed.

TOXIN_MAP <- list(

  # ── PSP — saxitoxin group ──────────────────────────────────────────────────
  "Alexandrium minutum"                  = c("GTX1", "GTX4", "dcGTX1", "dcGTX4"),
  "Alexandrium catenella"                = c("STX", "NEO", "GTX1", "GTX2", "GTX3", "GTX4", "dcSTX"),
  "Alexandrium tamarense"                = c("STX", "NEO", "GTX1", "GTX2", "GTX3", "GTX4", "dcSTX"),
  "Alexandrium fundyense"                = c("STX", "NEO", "GTX1", "GTX2", "GTX3", "GTX4"),
  "Alexandrium pacificum"                = c("STX", "NEO", "GTX1", "GTX2", "GTX3", "GTX4"),
  "Alexandrium ostenfeldii"              = c("STX", "NEO", "dcSTX"),
  "Alexandrium peruvianum"               = c("STX", "NEO", "dcSTX"),
  "Alexandrium fraterculus"              = c("STX", "dcSTX"),
  "Alexandrium cohorticula"              = c("STX", "dcSTX", "B1", "B2"),
  "Alexandrium lusitanicum"              = c("GTX1", "GTX4"),
  "Alexandrium andersonii"               = c("NEO", "dcNEO"),
  "Gymnodinium catenatum"                = c("STX", "dcSTX", "B1", "B2", "C1", "C2", "C3", "C4"),
  "Pyrodinium bahamense"                 = c("STX", "NEO", "dcSTX"),

  # ── DSP — okadaic acid / pectenotoxin / yessotoxin group ──────────────────
  "Dinophysis acuminata"                 = c("OA", "DTX1", "PTX2"),
  "Dinophysis acuta"                     = c("OA", "DTX2", "PTX2", "PTX11"),
  "Dinophysis caudata"                   = c("OA", "PTX2"),
  "Dinophysis fortii"                    = c("OA", "DTX1", "PTX2"),
  "Dinophysis infundibulus"              = c("OA"),
  "Dinophysis miles"                     = c("DTX1"),
  "Dinophysis norvegica"                 = c("OA", "DTX1", "PTX2"),
  "Dinophysis ovum"                      = c("OA"),
  "Dinophysis sacculus"                  = c("OA", "DTX1"),
  "Dinophysis tripos"                    = c("PTX2"),
  "Prorocentrum lima"                    = c("OA", "DTX1", "DTX2"),
  "Prorocentrum maculosum"               = c("OA"),
  "Prorocentrum hoffmannianum"           = c("OA"),
  "Prorocentrum concavum"                = c("OA"),
  "Prorocentrum belizeanum"              = c("OA"),
  "Prorocentrum mexicanum"               = c("OA"),
  "Protoceratium reticulatum"            = c("YTX", "homoYTX"),
  "Lingulodinium polyedra"               = c("YTX"),
  "Gonyaulax spinifera"                  = c("YTX"),

  # ── ASP — domoic acid group ────────────────────────────────────────────────
  "Pseudo-nitzschia australis"           = c("DA"),
  "Pseudo-nitzschia multiseries"         = c("DA"),
  "Pseudo-nitzschia pungens"             = c("DA"),
  "Pseudo-nitzschia seriata"             = c("DA"),
  "Pseudo-nitzschia delicatissima"       = c("DA"),
  "Pseudo-nitzschia fraudulenta"         = c("DA"),
  "Pseudo-nitzschia calliantha"          = c("DA"),
  "Pseudo-nitzschia cuspidata"           = c("DA"),
  "Pseudo-nitzschia heimii"              = c("DA"),
  "Pseudo-nitzschia galaxiae"            = c("DA"),
  "Pseudo-nitzschia pseudodelicatissima" = c("DA"),
  "Nitzschia navis-varingica"            = c("DA"),

  # ── NSP — brevetoxin group ─────────────────────────────────────────────────
  "Karenia brevis"                       = c("PbTx1", "PbTx2", "PbTx3", "PbTx9"),
  "Karenia brevisulcata"                 = c("PbTx2", "BTX-B1", "BTX-B2", "BTX-B4"),
  "Karenia selliformis"                  = c("PbTx2", "BTX-B1"),
  "Karenia papilionacea"                 = c("PbTx2"),

  # ── CFP — ciguatoxin / maitotoxin group ───────────────────────────────────
  "Gambierdiscus toxicus"                = c("CTX1B", "CTX2B", "CTX3C", "CTX4A", "CTX4B", "MTX1", "MTX2"),
  "Gambierdiscus polynesiensis"          = c("CTX1B", "CTX2B", "CTX3C"),
  "Gambierdiscus excentricus"            = c("CTX1B", "CTX4A", "CTX4B"),
  "Gambierdiscus belizeanus"             = c("CTX4A", "CTX4B"),
  "Gambierdiscus caribaeus"              = c("CTX4A", "CTX4B"),
  "Gambierdiscus australes"              = c("CTX1B", "CTX2B"),
  "Gambierdiscus pacificus"              = c("CTX1B", "CTX2B"),
  "Fukuyoa paulensis"                    = c("CTX1B", "CTX4A"),
  "Fukuyoa ruetzleri"                    = c("CTX1B"),

  # ── AZP — azaspiracid group ────────────────────────────────────────────────
  "Azadinium spinosum"                   = c("AZA1", "AZA2"),
  "Azadinium poporum"                    = c("AZA2"),
  "Azadinium dexteroporum"               = c("AZA2"),
  "Amphidoma languida"                   = c("AZA3", "AZA4", "AZA5", "AZA6")
)

# ── Apply patch ───────────────────────────────────────────────────────────────

snap      <- read_json(INPUT_JSON, simplifyVector = FALSE)
map_lower <- setNames(TOXIN_MAP, tolower(trimws(names(TOXIN_MAP))))

matched   <- character(0)
unmatched <- character(0)

snap$species <- lapply(snap$species, function(sp) {
  key <- tolower(trimws(sp$scientificName))
  if (!is.null(map_lower[[key]])) {
    sp$toxins <- as.list(map_lower[[key]])
    matched   <<- c(matched, sp$scientificName)
  } else {
    unmatched <<- c(unmatched, sp$scientificName)
  }
  sp
})

# ── Report ────────────────────────────────────────────────────────────────────

message(sprintf("\nMatched  : %d species assigned toxin codes", length(matched)))
message(sprintf("Unmatched: %d species left with empty toxins\n", length(unmatched)))

message("── Matched ──────────────────────────────────────────")
for (nm in sort(matched)) message("  + ", nm)

message("\n── Unmatched (no toxin assignment) ──────────────────")
for (nm in sort(unmatched)) message("  - ", nm)

# ── Write ─────────────────────────────────────────────────────────────────────

write_json(snap, OUTPUT_JSON, pretty = TRUE, auto_unbox = TRUE)
message(sprintf("\nPatched JSON written to: %s", OUTPUT_JSON))
message("Review the unmatched list above, then commit the JSON.")
