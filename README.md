# BellRecon — Archaeological Bell Reconstruction & Research

A static research publication at https://theormets.github.io/ARCH-RECON/ .

## Current publication

- Ambal suspension-loop study, reported provenance and measurement limitations.
- 15 unretouched original artefact photographs.
- Approved CadQuery model and original engineering drawings; direct STL viewer.
- 73-record source workbook with 73 embedded images, plus individual records, evidence PDFs and ruler reports.
- Eight individual categorical scatter plots: period, material, region/site and source, in full and filtered views.
- Nearest-15 dimensional comparison with photographs and all original spreadsheet fields.
- PNG/JPG/SVG/self-contained HTML plot exports and source-file/ZIP downloads.
- Browser/share title and description updated to BellRecon; the ARCH-RECON URL is retained.

## Evidence boundaries

Read [RESEARCH_METHODS.md](RESEARCH_METHODS.md). Published dimensions, image-scaled estimates and nominal CAD parameters are not interchangeable. The reference star is (6.45, 8.16), where 8.16 includes the surviving base, not ring-only height. The filter displays 55 points without deleting any of the 73 master records.

## Hosting and source files

GitHub Pages serves the repository root. No server, build process or external JavaScript CDN is required for the new website. Original graph HTMLs retain their existing sandbox/CSP and original dependencies.

Source assets are stored in 19 deduplicated byte packs under assets/packs. data/assets.json maps original filenames to byte ranges and SHA-256 hashes. assets.js reconstructs the original byte-identical files. Individual downloads are handled by asset.html; ZIP downloads are assembled in the browser.

Original source files and publication rights are preserved. No general reuse licence is asserted for third-party photographs/publications.

## Reproduction and validation

build_sources.py expects the supplied archives extracted into ../sources/dataset, ../sources/photos and ../sources/cad, plus the four HTMLs in ../upload. It reads workbook XML without rewriting the workbook.

Run python3 validate_sources.py and node --check on the JavaScript files. test_functional.mjs is an optional Node DOM/unit harness using linkedom 0.18.13 installed in /tmp/bellrecon-qa. It tests controls, counts, export syntax, a 50 MB evidence asset and ZIP packaging. It is not a browser or visual regression test.

Earlier models/data paths remain in version history and the repository for compatibility; the current article links only the newly supplied approved CAD and user-corrected dataset.
