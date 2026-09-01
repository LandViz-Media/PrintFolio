# Changelog

## 0.1.8

### Material Library
- Changed the Material Library from a read/delete-only pane to an editable manager with **Add Material**, **Edit**, **Save Changes**, **Cancel Edit**, and **Delete** actions.
- Kept JSON import/export as the portable persistence mechanism for a local/GitHub-hosted static application.
- Preserved the current `materials.json` starter data from v0.1.7 when rebuilding this release.
- Kept printer-specific profiles separate from physical spool records.

### Main Interface
- Moved the development version badge to the upper-right of the header, above the main action buttons.
- Kept the Print Inspection / Material Library workspace toggle.
- Material Library no longer displays the print thumbnail or Basic Print Information.

### 3MF / Development
- Retained initial cross-slicer 3MF support and documented PrusaSlicer project-file support.
- Added v0.2.0 planning notes for a larger interactive preview followed by systematic refinement of the inspection tabs.

### Documentation
- `README.md` remains the current project overview and roadmap.
- `CHANGELOG.md` records implementation changes by version.

# PrintFolio Changelog

All notable PrintFolio development changes are recorded here. The README is reserved for the current project overview; this file is the running implementation history.

## 0.1.7 — Development

### Interface
- Added a compact **v0.1.7** version badge to the upper-right of the main application header.
- Changed **Material Library** from a separate popup window to an in-page workspace toggle. Clicking it replaces the print-inspection workspace; clicking it again returns to Print Inspection.
- Opening a print file automatically returns to the Print Inspection workspace.
- Removed the Material Library explanatory callout from the **Material & Cost** tab because the library is now directly accessible from the header.
- Added a **Future Features** tab and moved planned functionality there, including Reprint/Update, interactive preview/layers, material-library expansion, and broader file support.
- Added intentional line breaks and centered alignment for longer tab labels such as Print Speeds, Filament Extrusion, Fan Cooling, Bed & Printer Setup, Print Settings, Material & Cost, and Future Features.

### Material Library
- Reused the existing Material Library module inside the main page instead of opening `material-editor.html` in a new browser window.
- Kept JSON import/export and deletion functionality available from the in-page library.
- Kept `material-editor.html` as a reusable/standalone foundation for the module rather than removing it.

### Preview
- Confirmed the current thumbnail behavior intentionally keeps useful auxiliary print geometry such as skirts/supports visible while excluding recognizable startup/prime lines from the generated thumbnail.
- Documented the future visibility controls for startup/prime lines, skirts, brims, rafts, supports, infill, walls, skin, and travel moves.

### Documentation
- Updated `README.md` to describe the current project state and architecture only.
- Reserved `CHANGELOG.md` for version-by-version implementation changes.

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
