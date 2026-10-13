# Bundled fonts — source, licence, and why they are substitutes

The source site sets: **Bricolage Grotesque** (display), **Space Grotesk** (text),
**IBM Plex Mono** (measure labels), **Caveat** (handwritten ink). None of those files
are copied, and none of them are installed on this machine (only DejaVu / Ubuntu /
WenQuanYi are). The fragment therefore bundles three OFL faces and uses a system mono:

| Role | Source face | Substitute bundled here | Character comparison | Licence |
| --- | --- | --- | --- | --- |
| Display | Bricolage Grotesque (proprietary) | **Archivo** variable (wght 400–700) | Both are low-contrast grotesques that hold a wide-ish, closed aperture at display sizes; Archivo is a touch more even in width and lacks Bricolage's optical-size quirk, so large lines read slightly calmer | SIL OFL 1.1 — `OFL-Archivo.txt` |
| Text | Space Grotesk (OFL, but not bundled here to avoid shipping the source face) | **Inter** variable (wght 400–600) | Inter has a larger x-height and a more neutral skeleton than Space Grotesk; Space Grotesk's slightly condensed, quirkier letterforms are the one thing the substitute does not carry | SIL OFL 1.1 — `OFL-Inter.txt` |
| Ink / hand | Caveat (OFL, not bundled here) | **Kalam** (400 / 700) | Both are upright, informal marker scripts with an open loop; Kalam is slightly heavier and less slanted, so the notes read more like pencil than pen | SIL OFL 1.1 — `OFL-Kalam.txt` |
| Measure labels | IBM Plex Mono | system mono stack (`ui-monospace`, `DejaVu Sans Mono`, …) | The labels are 10–11 px uppercase micro-type; the substitution loss is in the slab-ish terminals of Plex Mono, not in fit or line breaking | n/a (system) |

Weight and width were compared against the measured source values rather than assumed
equivalent: the source h1 renders at 103.68 px / weight 500 / letter-spacing −0.035em /
line-height 0.96; the fragment keeps the ratio (weight 500, −0.035em, 0.96) and lets the
size clamp, so line breaking stays governed by the same measure rather than by a
different face's metrics.

Sources (retrieved 2026-10-11):
- Archivo — https://fonts.google.com/specimen/Archivo (github.com/google/fonts/ofl/archivo)
- Inter — https://fonts.google.com/specimen/Inter (github.com/google/fonts/ofl/inter)
- Kalam — https://fonts.google.com/specimen/Kalam (github.com/google/fonts/ofl/kalam)

Only the `latin` subset of each face is bundled (the woff2 files contain no other script).
