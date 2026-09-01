# PrintFolio

PrintFolio is a local, browser-based tool for previewing and inspecting 3D-printer files **without modifying or generating printer G-code**. The project is intended to become a personal print catalog: a place to remember what a print is, how it was configured, what material was used, what it cost, and eventually how an older print could be prepared for a new printer or material.

## Project overview

PrintFolio is intentionally different from a slicer. It reads files produced by slicers and presents the information already contained in those files. The long-term goal is to combine file inspection, visual preview, material/spool records, print history, and future reprint planning.

### Supported file types

- **ASCII G-code** (`.gcode`, `.gco`, `.g`) — metadata, settings, movement analysis, embedded thumbnails, and generated 45° preview geometry.
- **Prusa BGCODE** (`.bgcode`) — embedded metadata and slicer thumbnail in the current release; full binary toolpath decoding is future work.
- **3MF** (`.3mf`) — initial project/model reading, mesh dimensions, metadata, and embedded thumbnails where available.

The parser normalizes information from different slicers into common PrintFolio fields rather than assuming that every slicer calls a setting the same thing.

## Current interface

The main window provides two top-level workspaces:

- **Print Inspection** — opened with **Open Print File** and containing the print thumbnail, basic information, and inspection tabs.
- **Material Library** — toggled by the **Material Library** button in the header. It replaces the inspection workspace in the same window; it is no longer opened as a separate window.

Print Inspection currently provides:

- Thumbnail Preview
- Basic Print Information
- Dimensions
- Temperatures
- Print Speeds
- Filament Extrusion
- Fan Cooling
- Bed & Printer Setup
- Print Settings
- Material & Cost
- Future Features

The Future Features tab keeps planned functionality out of the active inspection panels.

## Preview strategy

PrintFolio uses this priority order:

1. Use an embedded slicer thumbnail when one exists.
2. Otherwise render available G-code extrusion geometry as a bright, color-aware 45°/isometric thumbnail.
3. For 3MF model geometry, use the stored mesh as the basis for a model preview.

Generated G-code thumbnails currently omit startup/priming geometry when it can be distinguished from the actual print. Auxiliary geometry such as skirts, brims, rafts, and supports may remain visible because it is useful context in the current preview. The future interactive preview will provide visibility toggles for these features.

## Material and cost model

A material record describes the physical spool:

- Brand
- Material type
- Color
- Filament diameter
- Material density
- Date purchased
- Date opened
- Total spool weight
- Total spool cost

Printer-specific material settings are stored separately as profiles. This allows the same material to have different temperatures, speeds, fan settings, and other recommendations on different printers.

For material-cost estimation, PrintFolio prefers file-reported filament weight. If only filament length is available, it estimates weight from filament length, diameter, and material density, then estimates cost from the spool's cost-per-gram.

The Material Library currently supports local JSON import/export and deletion. Future management features will include adding/editing materials, spool tracking, remaining material, duplication, and full printer-profile management.

## Data and privacy

PrintFolio runs locally in the browser. Material library data is currently stored in browser local storage, with JSON import/export support. No cloud service is required by the application.

## Development direction

The planned architecture is:

```text
G-code / BGCODE / 3MF
          |
          v
   File-type detector
          |
          v
 Parser / metadata reader
          |
          v
    Normalized record
       /        \
      /          \
 Preview        Inspection
   |               |
Thumbnail      Settings / metadata
   |
Future interactive renderer
   |
Layers & Toolpath
   |
Future Reprint Planning
```

Longer-term functionality includes interactive 3D/layer preview, combined Layers & Toolpath inspection, more complete 3MF and BGCODE support, richer Material Library management, spool consumption tracking, printer-specific profiles, and reprint planning that preserves the original print record.

## Project files

- `index.html` — main PrintFolio interface
- `material-editor.html` — reusable Material Library page/module foundation
- `js/gcode-parser.js` — file parsing and metadata normalization
- `js/renderer.js` — thumbnail/model rendering
- `js/app.js` — application state and interface behavior
- `js/material-editor.js` — Material Library rendering and JSON management
- `materials.json` — starter material/spool data
- `material-profiles.json` — starter printer-specific material profiles
- `examples/` — development/test files
- `CHANGELOG.md` — version history and implementation changes

## Version

Current development version: **0.1.7**.

See `CHANGELOG.md` for version-by-version implementation changes.
