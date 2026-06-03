# HAB Species Interactive Visual Map

Interactive educational tool mapping marine biotoxin poisoning syndromes to the harmful microalgal (HAB) species that cause them.

**[Live demo →](https://kristofm854.github.io/hab-species-interactive-visual-map/)**

## What it does

- Six poisoning syndromes (PSP, DSP, ASP, NSP, CFP, AZP) as entry points
- Click a syndrome → panel of associated HAB species with microscopy thumbnails
- Click a species card for taxonomy, causative toxins, notes, and image attribution
- Every displayed image shows photographer credit, source, and license

## Tech stack

React + Vite, deployed to GitHub Pages. No backend; the app reads a committed static JSON snapshot — no runtime API calls.

## Data

Species data: [IOC-UNESCO Taxonomic Reference List of Harmful Micro Algae](https://www.ioc-unesco.org/) / [WoRMS](https://www.marinespecies.org/), pulled via the [SHARK4R](https://github.com/sharksmhi/SHARK4R) R package. See `data-pipeline/` for the pipeline.

The toxin→syndrome mapping is curated manually in `app/src/data/toxin-syndrome-map.json`.

## Development

```bash
cd app
npm install
npm run dev
```

See [CLAUDE.md](CLAUDE.md) for architecture decisions.

## Citation

See [CITATION.cff](CITATION.cff). Zenodo DOI pending first archive release.

## License

Code: [MIT](LICENSE).
Species data: [CC BY 4.0 (IOC-UNESCO / WoRMS)](https://creativecommons.org/licenses/by/4.0/).
Images: individually credited; see each species card.
