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

The main inspection window provides:

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

The **Material Library** is opened separately from the main window. This keeps spool/library management from crowding the print-inspection interface.

## Preview strategy

PrintFolio uses this priority order:

1. Use an embedded slicer thumbnail when one exists.
2. Otherwise render available G-code extrusion geometry as a bright, color-aware 45°/isometric thumbnail.
3. For 3MF model geometry, use the stored mesh as the basis for a model preview.

Startup/priming moves are retained in the parsed G-code for future inspection, but are excluded from the small generated print thumbnail when a layer boundary can identify the actual print. This will support future preview controls for startup lines, skirts, brims, rafts, and similar auxiliary features.

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

Printer-specific material settings are stored separately as profiles. This allows the same PLA spool to have different temperatures, speeds, fan settings, and other recommendations on different printers.

When possible, PrintFolio uses file-reported filament weight. If only filament length is available, it estimates weight from filament length, diameter, and material density, then estimates cost from the spool's cost-per-gram.

The initial local library contains three example spools supplied for development/testing.

## Data and privacy

PrintFolio runs locally in the browser. Material library data is currently stored in browser local storage, with JSON import/export support in the separate Material Library window. No cloud service is required by the application.

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

Longer-term functionality includes interactive 3D/layer preview, combined Layers & Toolpath inspection, more complete 3MF and BGCODE support, a full Material Library Manager, spool consumption tracking, printer-specific profiles, and reprint planning that preserves the original print record.

## Project files

- `index.html` — main PrintFolio interface
- `material-editor.html` — separate Material Library window
- `js/gcode-parser.js` — file parsing and metadata normalization
- `js/renderer.js` — thumbnail/model rendering
- `js/app.js` — application state and interface behavior
- `js/material-editor.js` — Material Library window behavior
- `materials.json` — starter material/spool data
- `material-profiles.json` — starter printer-specific material profiles
- `examples/` — development/test files
- `CHANGELOG.md` — version history and code changes

## Version

Current development version: **0.1.6**.

See `CHANGELOG.md` for version-by-version changes.
