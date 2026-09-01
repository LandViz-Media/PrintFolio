# PrintFolio v0.1.4

Local browser-based inspection tool for 3D-printer G-code, Prusa BGCODE, and 3MF files.

## v0.1.4 changes
- Fixed the stale "No print file loaded" overlay: the placeholder now correctly disappears when a file is loaded.
- Improved Cura/ASCII G-code thumbnail rendering with a brighter background, subtle bed grid, isometric 45° view, and feature-aware colors for outer walls, inner walls, infill, and skin.
- Improved Cura source-model detection, including `MESH:` and common model/object/source comments.
- Added Brand and filament diameter to the material library.
- Prepopulated the material library with the three supplied spools.
- Added JSON import/export for materials and printer-specific material profiles.
- Kept material notes separate from the spool record so the same material can have different settings on different printers.
- Added placeholders for a future material library manager and future reprint/update planning.

## Supported file types
- ASCII G-code / common `.gcode`, `.gco`, and `.g` extensions
- Prusa BGCODE: metadata + embedded thumbnail in the current version; full binary toolpath decoding remains future work
- 3MF: project/model metadata, mesh dimensions, and common embedded thumbnails where present

PrintFolio does not modify or generate printer G-code in v0.1.x.

## Material JSON
`materials.json` and `material-profiles.json` provide a starter data set and schema. The browser app uses localStorage and can import/export a combined JSON file.

Material records describe the spool itself. Printer-specific notes/settings are separate profiles keyed by `materialId` and printer.

## Future direction
- Interactive 3D preview using the same geometry pipeline
- Combined Layers & Toolpath inspection
- More complete slicer-specific metadata normalization
- Robust 3MF support across slicer variants
- Full BGCODE geometry decoding using an appropriate browser/WASM implementation
- Material library manager
- Reprint planning and controlled setting changes while preserving the original print record


## v0.1.4 changes
- Fixed the loaded-file preview placeholder being visible over the rendered image.
- Added cache-busting version tags to local CSS/JS assets.
- Brightened the generated G-code renderer with a light underlay and stronger color-coded feature lines.
- Redesigned Material & Cost into a responsive spool form plus library table.
- Material records include Brand; printer-specific notes/settings remain separate in material profiles.
- Seeded the three supplied material profiles with their Ender-3 Pro temperature, bed, and speed notes.
