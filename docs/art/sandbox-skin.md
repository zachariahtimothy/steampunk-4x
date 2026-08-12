# Sandbox steampunk skin

**Status:** Sandbox presentation pass (not production art)  
**Scope:** View-layer only — CSS chrome + procedural Pixi map. No asset pipeline.

## Flavor split

| Surface | Voice |
|---------|--------|
| **Strategy map** | Foundry grit — soot ground, ash sky, industrial markers, dual-use roads/rails |
| **HUD / panels** | Brass command — lamp-lit plates, engraved headers, instrument typography |

Tone stays **grimy industrial power** (coal cost, labor, pressure). Not costume Victorian cosplay; not dieselpunk neon.

## Type

| Role | Face |
|------|------|
| Titles / panel headers | **Fraunces** (display serif) |
| UI body / map labels | **Source Sans 3** |
| Tick logs | System mono stack |

Avoid blackletter and “circus steampunk” fonts.

## Tokens (CSS)

Defined on `:root` in `src/styles.css`:

- **Soot:** `--soot-void`, `--soot-base`, `--soot-raised`, `--soot-panel`
- **Iron:** `--iron-edge`, `--iron-border`, `--iron-deep`
- **Brass / lamp:** `--brass`, `--brass-bright`, `--brass-dim`, `--lamp`, `--lamp-soft`
- **Ash text:** `--ash-text`, `--ash-muted`, `--ash-faint`
- **Signals:** `--danger`, `--ok`, `--rail-steel`

Prefer these variables over new one-off hex colors in UI CSS.

## Map language (procedural)

- Hex fills: mottled ash/iron band, slightly darker toward map edge; soft height cue on NW edges
- **Coal** angular lump · **Ore** diamond · **Timber** pine stack · **Food** sheaf lozenge
- **Hub:** plinth + works block + boiler stack + brass rivet ticks
- **Road:** dust track with soft dashed edge · **Rail:** dual steel rails, sleepers, brass centerline
- **Armies:** pennant on pole (not stars)
- Canvas vignette via CSS on `.map-panel` (soot falloff)

All pure `pixi.js` `Graphics` / `Text` — no spritesheets.

## UI language

- Top bar: brass rail ticks + lamp gradient
- Side sections: inset “plates” with hairline brass rule
- `h2`: brass header stamp (dark text on metal)
- Primary buttons: metal plate gradient, brass border
- Shortage Doctor: stamped severity plates (critical = heat/danger, warning = brass)

## Do

- Keep hierarchy readable at laptop and narrow Discord-dev widths
- Match grit map ↔ brass chrome (split is intentional)
- Stay reversible: presentation must not invent sim rules

## Don’t

- Production sprites, textured tile atlases, or full art bible this pass
- Animated smoke / route-flow particles (later PR if wanted)
- Rivet spam, gear watermarks, or ornate SVG corner kits that fight Compact density
- *Mortal Engines* jaws/Gut packaging or *Wild Wild West* tarantula-tank silhouette (see motif research)
- Light theme or neon accents

## Related

- Tone / fantasy: [`docs/spec/SPEC.md`](../spec/SPEC.md) §1–2  
- Motif hygiene: [`.scratch/wayfind-spec/assets/03-machinery-motifs.md`](../../.scratch/wayfind-spec/assets/03-machinery-motifs.md)  
- Stack: [`docs/adr/0001-tech-stack.md`](../adr/0001-tech-stack.md)
