# PrintFolio File Format Guide

PrintFolio is designed to inspect print files without modifying them. File support is intentionally described by capability because different slicers may store different amounts of information in the same nominal file format.

## Current formats

### G-code (`.gcode`, `.gco`, `.g`)
**Status: Supported**

PrintFolio can read common slicer metadata, dimensions, temperatures, speeds, filament information, settings, and extrusion geometry. Embedded slicer thumbnails are used when available; otherwise PrintFolio can generate a 45-degree preview from parsed geometry.

### BGCODE (`.bgcode`)
**Status: Supported / developing**

PrintFolio can currently read useful embedded metadata and slicer thumbnails. Full decoding of compressed/binary toolpath geometry remains under development.

### 3MF (`.3mf`)
**Status: Supported / developing**

PrintFolio can inspect model geometry, dimensions, thumbnails, and project metadata/settings when those elements are present. A 3MF may be model-only or may contain a complete slicer project, so PrintFolio should report what it actually finds rather than assume settings exist.

## Formats under testing

### Cura UCP 3MF
**Status: Under testing**

Cura Universal Project files can contain extensive printer, material, and print configuration alongside the model and thumbnail. These files are being used to expand PrintFolio's normalized settings model.

### PrusaSlicer 3MF
**Status: Under testing**

PrusaSlicer can save complete project files as 3MF. PrintFolio will evaluate model, thumbnail, material, printer, and slicing settings as representative files become available.

## Future investigation

Other slicer-specific project and binary formats may be added later. The goal is to preserve the original file information while presenting it through a common PrintFolio inspection interface.
