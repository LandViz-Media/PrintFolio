# PrintFolio — v0.1.1

PrintFolio is a local browser-based preview and inspection utility for 3D-printer G-code.

The goal is simple: **remember what a print is and how it was configured without opening the slicer again.**

PrintFolio is **not a slicer** and does not modify G-code.

## v0.1.1

### File types

- ASCII `.gcode`, `.gco`, and `.g`
- Initial `.bgcode` support for Prusa's binary G-code format
- BGCODE metadata is read from its metadata blocks
- Embedded PNG thumbnails are detected and displayed when present

The supplied `extreme-test.bgcode` demonstrated that PrusaSlicer 2.9.6 embeds useful information including printer model, filament type, nozzle diameter, bed/nozzle temperatures, infill density, support state, layer height, maximum Z, filament usage, cost, estimated time, and an isometric thumbnail.

### Tabs

- Preview
- Dimensions
- Temperatures
- Print Speeds
- Filament Extrusion
- Fan Cooling
- Bed & Printer Setup
- Print Settings

Print Settings currently includes support, infill, wall/perimeter, top/bottom layers, brim, raft, skirt, ironing, and adhesion information when the slicer exposes those values.

### Thumbnail strategy

PrintFolio now prefers a slicer's embedded thumbnail when available. Otherwise it renders the parsed extrusion geometry using a diagonal/isometric projection rather than a strictly top-down view.

This is intentional: the thumbnail renderer is the beginning of the renderer that will eventually support a full interactive preview.

## Future direction

The following are deliberately deferred:

- Full interactive 3D/toolpath preview
- Layer slider and layer-by-layer analysis
- Detailed toolpath categories
- Print simulation
- G-code line inspection
- Catalog/library indexing

Items previously identified as individual-layer information and detailed toolpath information will eventually be combined into a **Layers & Toolpath** area rather than becoming separate tabs.

## Browser architecture

```text
                  G-code / BGCODE
                         |
                         v
                  File-type detector
                    /          \\
                   /            \\
             G-code parser   BGCODE metadata reader
                   |              |
                   +------+- -----+
                          |
                    Print metadata
                          |
                    Print renderer
                          |
                     Thumbnail
```

The renderer is deliberately independent from the metadata parser. The eventual full preview can therefore reuse the same geometry/rendering architecture.

## Running locally

Open `index.html` in a modern browser and select **Open G-code**.

No server or build process is required for the current prototype.

## Inspiration

The project was partly inspired by the existing open-source browser-based gCodeViewer, which demonstrates that local G-code visualization and analysis can work well in a browser. PrintFolio has a different emphasis: it is intended first as a **personal print reference/catalog tool**, with the thumbnail and metadata front and center.

See: https://gcode.ws/

## BGCODE implementation note

Prusa's BGCODE format is a binary/block format with separate metadata and G-code blocks, compression/encoding options, checksums, and thumbnail blocks. The official `libbgcode` project provides the reference implementation and a WebAssembly build option. PrintFolio's current browser-only support intentionally starts with metadata and embedded thumbnails; full BGCODE geometry decoding will be added when the interactive renderer is developed.
