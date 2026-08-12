# Obvious play UX (Sandbox)

**Status:** Implemented on feature branch for PR  
**Research:** [obvious-strategy-ux.md](../research/obvious-strategy-ux.md)  
**Skin:** [sandbox-skin.md](./sandbox-skin.md)

## Goal

Make the logistics loop obvious from **layout** (Civ-class), not a tutorial video or one scrollable manual panel.

## Shell

| Zone | Role |
|------|------|
| **Map** | Stage — click to select; drag to pan |
| **Top bar** | Brand · **goods pulse** · Next attention · End turn |
| **Right inspector** | Only the **current selection** (or quiet overview) |

## Selection

- **Sites** (hub, extractors)
- **Armies**
- **Route edges** (click line)

## Attention

Brass pips on the map + **Next attention** cycles:

1. Unlinked extractors (coal → ore → timber → food)
2. Player army with Orders remaining
3. Hub if critical Doctor alert

End turn is always available.

## Where systems live

| System | Surface |
|--------|---------|
| Connect/disconnect road | Extractor inspector (or route inspector) |
| Stock / Factory / Invent | **Hub** inspector |
| Combat orders / field Mark | **Player army** inspector |
| Doctor + last tick | Overview (no selection); Doctor also on Hub when active |

## Out of scope

Zoom, scripted tutorial mode, new sim rules, bottom command deck.
