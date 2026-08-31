# BellRecon: archaeological bell reconstruction and comparative research

## Scope and provenance

The Ambal sample is described as a bell suspension loop with surviving base. The research team reports that V. Selvakumar, Associate Professor, Department of Archaeology, Tamil University, Thanjavur, Tamil Nadu, India supplied it for archaeometallurgical research. Ambal, Nagapattinam, Tamil Nadu is the reported findspot. Medieval attribution is information communicated by the professor, not an independently demonstrated date from this geometric study. Copper is the supplied material description; this website does not supply a compositional assay or establish alloy purity.

The term **suspension loop** is used descriptively, following museum terminology, for example https://www.metmuseum.org/art/collection/search/311266 . The example supports the terminology, not identification or cultural affiliation of the Ambal object. The historical local name is not established here.

## Physical measurements and reconstruction

Corrosion, surface loss and an uneven surviving outline limit dimensional interpretation. The team reports taking measurements at two or three locations and averaging selected values. The provided photographs do not constitute a complete feature-to-reading measurement register or an uncertainty budget. No retrospective assignment of every caliper reading to a feature, mean calculation, instrument accuracy or uncertainty interval has been fabricated.

The approved CAD is a smooth, dimension-constrained idealisation, not a surface scan or an exact recovery of missing original geometry. Nominal geometry, direct readings and image-scaled estimates are separate evidence classes. A valid solid is not proof of historical accuracy.

The original supplied `Bell_Hook_Inner_Edge_Join.py` uses CadQuery, a Python parametric CAD library based on Open CASCADE (https://cadquery.readthedocs.io/en/latest/intro.html). The model combines elliptical profiles, extrusion, fillets, a circular base with spherical-cap construction, Boolean union and a through-cut. The approved STEP, STL, BREP, script, engineering PDF/JPGs and dimensions JSON are distributed without modification. The website renders the supplied binary STL directly using WebGL; it does not regenerate or rescale the model file.

Nominal dimensions, all in mm:

| Parameter | Value |
|---|---:|
| Overall component height | 8.160 |
| Circular base diameter | 8.01 |
| Outer loop width × height | 6.45 × 6.75 |
| Opening width × height | 4.00 × 4.30 |
| Loop depth | 2.90 |
| Edge fillet radius | 0.45 |
| Dome height before bore relief | 2.885 |
| Actual maximum height of relieved base | 2.809509156503981 |

The ring is slightly oval. The dome rise is a design revision, not a newly measured artefact value. The supplied validation file records a valid single solid and successful STEP reimport. Website checks preserve and identify these files; no independent new Open CASCADE validation is claimed for this publishing run.

## Comparative collection

The team reports screening over 200 records before retaining 73 based on available photographs and major dimensions. A full screening log for the larger population is not supplied, so the count is a reported research history rather than an independently audited selection result. The 73-item collection is not a representative sample of all ancient bells; exact source period descriptions, including later objects or reproductions where present, are retained.

The provided master workbook supplies 18 fields: serial number, embedded photo, photo filename, original object name, museum/paper, period, material, H, W, D, loop h, loop outer W/D, loop measure type, body B, h/B, h/(D else W), notes and URL. Workbook bytes, formulas, cached results and 73 embedded images are preserved. Raw values are extracted from XLSX XML, not rewritten. Each record retains a photo, individual Excel, evidence PDF, ruler PNG and ruler report PDF. Some records reuse the same publication: 73 record-linked evidence PDFs are not 73 unique publications.

Region/site comes from the supplied graph data. Missing entries remain `Not stated in dataset`. Museum location is not used as artefact origin. Display colours provide coarse period/material groupings; exact source strings are shown in the full record and comparison table. Missing or ambiguous chronology is not converted to a precise date.

## Image calibration and ratios

The supplied research workflow uses source-published total height H and width W or diameter D to calibrate visible image extents:

- Vertical scale = H / full object height in pixels.
- Horizontal scale = W (or D) / corresponding full object width in pixels.
- Loop height h = visible loop-height pixels × vertical scale.
- Body height B = visible body-height pixels × vertical scale.
- Ratio 1 = h/B.
- Ratio 2 = h/D when source D is available; otherwise h/W.

Diameter and width remain distinct. The fallback denominator is a bell-level width, not the loop outer width. A width is not silently recoded as a diameter. The intended boundaries exclude shadow/background and follow user-corrected landmarks. This website preserves those existing measurements; it does not independently remeasure or validate every landmark.

Near-frontal views are more suitable for projected measurement. Rotation can orient a sideways image but does not remove perspective or foreshortening. Two separately calibrated axes do not reconstruct 3D perspective. Pixel resolution, camera angle, occlusion, object geometry and landmark choice constrain the results. Hidden thickness, depth and lost geometry cannot be inferred exactly from these images. No numerical accuracy percentage or invented tolerance is attached to the estimates.

## Graph reproduction

The original four uploaded HTML files remain downloadable. Their sandboxed iframe and CSP are preserved. An exact-byte ZIP of those originals is also supplied; Git may normalise line endings of text files served separately. The new website supplies eight individual SVG plot panels: four categorical views for the filtered population and four for the full population. Groupings are period, material, region/site and source. Native controls filter a category, show/hide the reference, reset the view, select a record and export PNG/JPG/SVG/self-contained HTML. New HTML exports contain their data and plotting code without external JavaScript dependencies.

All 73 source graph coordinate records reconcile with workbook h and loop width within half of the last displayed decimal (0.005 mm, allowing floating-point rounding). Original graph two-decimal coordinates are retained for plotting and ranking. This is a formatting reconciliation, not a measurement error tolerance.

Full view: all 73 records. Filtered view reproduces the provided **1.0×IQR**, not the more common 1.5×IQR rule. For each axis, quartiles use linear interpolation at index `(n−1)p`, with bounds Q1−IQR and Q3+IQR. A record is excluded if either axis is outside its bounds.

| Axis | Q1 | Q3 | Lower bound | Upper bound |
|---|---:|---:|---:|---:|
| Loop width | 17.14 | 36.10 | −1.82 | 55.06 |
| Loop height | 15.88 | 35.42 | −3.66 | 54.96 |

IQR-excluded serials: 002, 003, 025, 026, 027, 028, 031, 033, 034, 045, 053, 054, 055, 057, 058, 060, 061. Of the remaining 56, #056 (h = 52.76) is outside the 50 × 50 display window. Thus the filtered plots show **55**, not 56. The 73-row master is unchanged. The reference star is not included in the dataset count, quartiles or filtering.

## Ambal reference and nearest neighbours

The reference point remains `(6.45, 8.16)`. Crucially, 8.16 is **whole surviving component height, including its base**, not ring-only outer height (6.75 in the approved CAD). Component boundaries may differ between the reference and comparative loop landmarks. Ranking is explicitly exploratory and should not be treated as a strictly homologous morphological classification.

Distance is `sqrt((x−6.45)^2+(y−8.16)^2)` in millimetres, unweighted, calculated over all 73 records from original graph coordinates. Ties are broken by serial number. No period, material or region weighting is used. This is neither UMAP nor a knowledge graph. Nearest serials: 048, 040, 030, 046, 059, 032, 049, 047, 069, 072, 006, 005, 037, 038, 067. All 15 are also retained in the close-up view.

Nearest record #048 MET-56441 has x = 6.90, y = 8.10; distance approximately 0.454 mm. Proximity does not establish identity, date, cultural association, fabrication process or a unique missing bell body. The dataset can support candidate generation, not exact inverse reconstruction.

## Delivery and integrity

Original photographs are unretouched. Source assets are stored in deduplicated 8 MB byte packs for practical hosting. `data/assets.json` maps every original logical filename to byte segments, byte count and SHA-256. The browser reconstructs the original file without altering its bytes and verifies SHA-256 for downloads. Image display uses original bytes. Complete ZIP generation preserves individual source files; the ZIP container itself is newly assembled.

The complete collection includes all 73 photo/evidence/individual-Excel/ruler records, master Excel, 15 artefact photographs, approved CAD and engineering files, original graph HTMLs, machine-readable web data and this methodology. User source photographs and publications retain their original rights. No blanket open licence is asserted for third-party material.

No general causal or historical conclusion follows from these exploratory plots alone. Additional views, direct measurements, material analyses and archaeological evidence are necessary for stronger reconstruction claims.
