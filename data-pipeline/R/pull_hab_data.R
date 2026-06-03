# pull_hab_data.R
#
# Pulls the IOC-UNESCO Harmful Microalgae reference list via SHARK4R and
# enriches each species with WoRMS taxonomy and images via the WoRMS REST API.
# Writes a versioned JSON snapshot to app/src/data/.
#
# Prerequisites:
#   install.packages(c("httr2", "jsonlite", "dplyr", "purrr"))
#   devtools::install_github("sharksmhi/SHARK4R")
#
# Usage:
#   Rscript data-pipeline/R/pull_hab_data.R   (from repo root)
#   or source("pull_hab_data.R") in RStudio from this directory
#
# Output:
#   app/src/data/hab-species.vYYYYMMDD.json
#   Update the import in app/src/hooks/useHabData.js to the new filename.

library(SHARK4R)
library(httr2)
library(jsonlite)
library(dplyr)
library(purrr)

WORMS_API       <- "https://www.marinespecies.org/rest"
RATE_LIMIT_SECS <- 0.3   # polite crawl between WoRMS requests

# ── 1. Fetch IOC-UNESCO HAB list ──────────────────────────────────────────────

message("Fetching IOC HAB species list via SHARK4R...")
hab_raw <- get_hab_list()
message(sprintf("  %d records retrieved.", nrow(hab_raw)))
message("  Columns: ", paste(names(hab_raw), collapse = ", "))
# Inspect column names above and adjust selectors below to match SHARK4R output.

# ── 2. WoRMS helpers ──────────────────────────────────────────────────────────

fetch_worms_record <- function(aphia_id) {
  url <- sprintf("%s/AphiaRecordByAphiaID/%d", WORMS_API, aphia_id)
  tryCatch({
    resp <- request(url) |> req_timeout(10) |> req_perform()
    resp_body_json(resp, simplifyVector = FALSE)
  }, error = function(e) {
    warning(sprintf("WoRMS record failed for AphiaID %d: %s", aphia_id, e$message))
    NULL
  })
}

fetch_worms_images <- function(aphia_id) {
  url <- sprintf("%s/AphiaImagesByAphiaID/%d", WORMS_API, aphia_id)
  tryCatch({
    resp <- request(url) |> req_timeout(10) |> req_perform()
    if (resp_status(resp) == 204) return(list())
    resp_body_json(resp, simplifyVector = FALSE)
  }, error = function(e) list())
}

# Returns TRUE (free reuse), FALSE (restricted), or NA (unknown).
classify_license <- function(license_str) {
  if (is.null(license_str) || !nzchar(trimws(license_str))) return(NA)
  lc <- tolower(license_str)
  if (grepl("cc0|public domain", lc)) return(TRUE)
  if (grepl("^cc by$|cc by [0-9]|cc-by$|cc-by [0-9]", lc)) return(TRUE)
  if (grepl("cc by-sa|cc-by-sa", lc)) return(TRUE)
  if (grepl("cc by-nc|cc-by-nc|all rights|copyright|©", lc)) return(FALSE)
  NA
}

# ── 3. Build per-species records ──────────────────────────────────────────────

build_species_record <- function(row) {
  # TODO: Confirm correct column names from SHARK4R output (step 1 above).
  aphia_id <- as.integer(row[["AphiaID"]])
  sci_name <- row[["ScientificName"]]
  message(sprintf("  AphiaID %d: %s", aphia_id, sci_name))

  worms <- fetch_worms_record(aphia_id)
  Sys.sleep(RATE_LIMIT_SECS)

  imgs <- fetch_worms_images(aphia_id)
  Sys.sleep(RATE_LIMIT_SECS)

  classification <- list()
  if (!is.null(worms)) {
    for (rank in c("phylum", "class", "order", "family", "genus")) {
      val <- worms[[rank]]
      if (!is.null(val) && nzchar(val)) classification[[rank]] <- val
    }
  }

  image_record <- NULL
  if (length(imgs) > 0) {
    img <- imgs[[1]]
    lic <- img[["license"]] %||% ""
    image_record <- list(
      url           = img[["url"]] %||% "",
      credit        = img[["photographer"]] %||% img[["creator"]] %||% "",
      source        = "WoRMS",
      license       = lic,
      licenseUrl    = img[["licenseUrl"]] %||% "",
      licenseUsable = classify_license(lic)
    )
  }

  # TODO: Parse toxin codes from SHARK4R get_toxin_list() or IOC attributes.
  # Expected format: vector of short codes matching toxin-syndrome-map.json keys.
  toxins <- character(0)

  list(
    aphiaId        = aphia_id,
    scientificName = sci_name,
    authority      = row[["Authority"]] %||% "",
    classification = classification,
    toxins         = toxins,
    notes          = "",
    image          = image_record
  )
}

# ── 4. Process all species ────────────────────────────────────────────────────

message("\nFetching WoRMS details (may take several minutes for full list)...")
species_records <- hab_raw |>
  split(seq_len(nrow(hab_raw))) |>
  map(build_species_record)

# ── 5. Write versioned JSON ───────────────────────────────────────────────────

today       <- format(Sys.Date(), "%Y%m%d")
output_path <- file.path("..", "app", "src", "data",
                         sprintf("hab-species.v%s.json", today))

write_json(
  list(
    meta    = list(source = "IOC-UNESCO / WoRMS",
                   accessed = format(Sys.Date(), "%Y-%m-%d"),
                   version  = today),
    species = species_records
  ),
  output_path,
  pretty     = TRUE,
  auto_unbox = TRUE
)

message(sprintf("\nDone. %d species written to:\n  %s", length(species_records), output_path))
message("Update the import in app/src/hooks/useHabData.js to the new filename.")
