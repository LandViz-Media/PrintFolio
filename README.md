# PrintFolio — v0.1.0

A local browser-based preview and inspection utility for 3D-printer G-code.

## v0.1.0 scope

- Open `.gcode`, `.gco`, or `.g` files
- Generate a static top-down thumbnail from extrusion moves
- Extract basic print information
- Extract dimensions
- Extract nozzle/bed temperatures
- Extract print/travel speeds when available
- Extract filament usage and extrusion mode
- Detect fan/cooling commands
- Detect layer count and movement counts
- No slicing
- No G-code editing
- No full interactive toolpath viewer yet
- No catalog/library yet

## Run

Open `index.html` in a modern browser and choose **Open G-code**.

For GitHub Pages, put `index.html` at the repository root and enable Pages for the main branch.

## Architecture

```text
G-code → Parser → metadata + extrusion geometry → Renderer → thumbnail
```

The parser and renderer are deliberately separate so the thumbnail renderer can evolve into the full interactive renderer in a later release.

## Test file

The initial development test was `Remote Roku Case.gcode`. The application does not require that file to be bundled; open it from its existing location.

## Important

G-code metadata varies by slicer. The viewer reports values it can identify and does not invent missing values.
