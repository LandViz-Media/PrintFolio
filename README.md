# PrintFolio — v0.1.2

PrintFolio is a local browser-based preview and inspection utility for 3D-printer files.

The goal is simple: **remember what a print is, how it was configured, what material was used, and eventually how to update an older print for a new run.**

PrintFolio is **not a slicer** and does not modify the original print file.

## v0.1.2

### Supported file families

- ASCII `.gcode`, `.gco`, and `.g`
- Prusa `.bgcode` binary G-code
- `.3mf` project files

G-code source-model detection now recognizes common `;MESH:...stl` comments, including the supplied Roku example.

BGCODE currently reads embedded metadata and embedded thumbnails. The supplied PrusaSlicer BGCODE demonstrates that this can provide printer, slicer, material, temperatures, infill, support state, layer height, maximum Z, filament use, estimated time, and an isometric thumbnail.

3MF support reads the model mesh from the archive for dimensions/source-model information and looks for embedded preview thumbnails and common slicer configuration files. It is intentionally a lightweight project reader rather than a full slicer/project editor.

### Normalized information model

Different slicers call equivalent values different things. PrintFolio therefore maps them into common fields:

| PrintFolio field | Examples of source names |
|---|---|
| Print time | `TIME`, estimated printing time |
| Filament length | filament used `[mm]`, Filament used |
| Filament weight | filament used `[g]` |
| Layer height | `LAYER_HEIGHT`, `layer_height` |
| Maximum Z | `MAXZ`, `max_layer_z` |
| Nozzle temperature | `M104/M109`, `temperature` |
| Bed temperature | `M140/M190`, `bed_temperature` |
| Infill | `fill_density`, infill density |
| Supports | `support_material`, support enable |

This distinction matters for dimensions: BGCODE's `max_layer_z` is useful for the Z extent/top height, but it is **not the same thing as having X/Y object bounds**. PrintFolio now reports that limitation instead of pretending the missing dimensions are known.

### Tabs

- Preview
- Dimensions
- Temperatures
- Print Speeds
- Filament Extrusion
- Fan Cooling
- Bed & Printer Setup
- Print Settings
- **Material & Cost**

### Material library

The Material & Cost tab introduces the beginning of a print-material inventory. Each material record can store:

- Material name
- Color
- Date purchased
- Date opened
- Total weight
- Total cost

The library is stored in browser `localStorage`; no material information is uploaded.

When a print file reports filament **weight**, PrintFolio can estimate the material cost from:

`print material cost = print filament grams / spool grams × spool cost`

If a file only reports filament length, the current version does not guess the cost. A future version can use filament diameter/material density or other reliable data to improve this calculation.

### Future: reprint/update planning

A major long-term goal is to make old print files useful years later. For example, a print originally prepared for PLA at 210 °C could be selected years later with a new material and a new printer profile, and PrintFolio could help identify which settings should change:

- material
- nozzle temperature
- bed temperature
- print/travel speeds
- fan cooling
- supports
- infill
- adhesion
- other slicer settings

The current version only provides a placeholder for this capability. It does **not** edit or regenerate G-code.

### Thumbnail strategy

PrintFolio prefers a slicer's embedded thumbnail when available. Otherwise it renders available geometry using a diagonal/isometric view rather than a strictly top-down view. This is the foundation for the eventual interactive renderer.

## Future architecture

```text
G-code / BGCODE / 3MF / other slicer formats
                    |
                    v
              File detector
          /        |         \
       G-code   BGCODE       3MF
       parser   reader       reader
          \        |         /
           \       |        /
             Normalized metadata
                     |
             +-------+-------+
             |               |
          Thumbnail      Print record
             |               |
             +-------+-------+
                     |
              Interactive renderer
                     |
             Layers & Toolpath
```

Items previously identified as detailed toolpath information and individual-layer information will eventually be combined into a **Layers & Toolpath** area. That area can expose layer count/current layer/Z, layer timing and filament, wall/infill/skin/support/travel categories, retractions, speeds, and eventually print simulation.

## Long-term file strategy

PrintFolio should be format-aware rather than tied to one slicer. In the long term, common formats from major slicers can be normalized into the same internal record. Conversion between formats may also be useful, but that is a separate workflow: PrintFolio's core purpose remains inspection, cataloging, and print-history management.

## Running locally

Open `index.html` in a modern browser and select **Open Print File**.

No server or build process is required for the current prototype. 3MF reading uses browser-native ZIP decompression where supported.

## Inspiration

The project is partly inspired by the browser-based gCodeViewer project, but PrintFolio has a different emphasis: **personal print reference, material history, and eventually reprint planning**, with the thumbnail and metadata front and center.

See: https://gcode.ws/

## BGCODE implementation note

Prusa's BGCODE format is a binary/block format with separate metadata and G-code blocks, compression/encoding options, checksums, and thumbnail blocks. The official `libbgcode` project provides the reference implementation and a WebAssembly build option. PrintFolio's current browser-only support intentionally starts with metadata and embedded thumbnails; full BGCODE geometry decoding is still reserved for the interactive renderer phase.
