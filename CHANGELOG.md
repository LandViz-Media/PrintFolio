# PrintFolio Changelog

All notable PrintFolio development changes are recorded here. The README is reserved for the current project overview; this file is the running implementation history.

## 0.1.6 — Development

### Changed
- Removed the embedded Material Library management form/table from the **Material & Cost** tab. Material management is accessed through the separate **Material Library** button in the main header.
- Kept the Material & Cost tab focused on the current print, material selection, cost estimation, and printer-specific material profiles.
- Added filament length → weight → cost estimation when the print file reports length but not weight. The calculation uses filament diameter and material density.
- Added density-aware migration for older local material records that predate the density field. PLA defaults to 1.24 g/cm³ and PETG to 1.27 g/cm³ when migration can safely identify the material.
- Added a clearer cost estimate including the estimated weight, estimated material cost, and spool cost per gram.
- Added automatic material selection when the print file identifies a material type and an exact material-type match exists in the library.
- Retained the separate material editor window and JSON import/export architecture.
- Updated project documentation so `README.md` is the project overview and `CHANGELOG.md` contains implementation history.

### Preview / G-code
- G-code startup/priming extrusion segments are now classified separately from print geometry when a `;LAYER:` boundary is present.
- Generated thumbnails exclude startup/priming segments while retaining them in the full parsed geometry for future inspection.
- If a G-code file has no recognizable layer markers, all parsed extrusion geometry remains available to the thumbnail renderer rather than being silently discarded.
- This classification prepares the future interactive preview for toggles such as startup/prime lines, skirts, brims, rafts, supports, and other auxiliary features.

### Documentation
- Documented the distinction between physical spool records and printer-specific material profiles.
- Documented the preview priority order: embedded thumbnail, generated G-code geometry, then 3MF model geometry.

## 0.1.5

- Added initial separate Material Library window.
- Added material density and length-to-weight cost calculation infrastructure.
- Added starter spool records for the supplied Overture and Hatchbox materials.
- Added printer-specific material profiles for the Ender-3 Pro.
- Added initial 3MF parsing and embedded thumbnail detection.
- Added a top-level Material Library button.

## 0.1.4

- Fixed the loaded-file preview placeholder being visible over the rendered image.
- Added cache-busting version tags to local CSS/JS assets.
- Brightened the generated G-code renderer with a light underlay and stronger feature colors.
- Redesigned the Material & Cost area into a responsive material/spool form and library table.
- Improved Cura source-model detection.

## 0.1.3

- Improved Cura G-code preview readability with a brighter isometric presentation and feature-aware colors.
- Added Brand and filament diameter to material records.
- Added initial material-library and printer-profile concepts.

## 0.1.2

- Added BGCODE metadata and embedded-thumbnail reading.
- Added initial 3MF support.
- Added Bed & Printer Setup and Print Settings inspection areas.
- Added support and infill information.

## 0.1.1

- Renamed the project to PrintFolio.
- Added BGCODE file recognition and embedded Prusa thumbnail extraction.
- Added a diagonal/isometric fallback thumbnail renderer.
- Added Bed & Printer Setup and Print Settings tabs.

## 0.1.0

- Initial browser-based G-code preview/inspection prototype.
- Added basic metadata, dimensions, temperature, speed, extrusion, and cooling views.
