# Player Render Contract

This file freezes the player layout and anchor contract.

## Canonical render path

- All player images must render through `renderPlayer()` in `js/playerRenderer.js`.
- `assets/player/base-player.png` remains the base player image.
- `getPlayerRenderBox(surface)` in `js/playerRenderer.js` is the only source of truth for player dimensions.
- Connectors, anchor editor handles, and anchor drag math must use `getPlayerRenderBox(surface)`.

## Canonical anchor path

- `bodyAnchorMap()` in `js/anchorEditor.js` is the only body coordinate map.
- Anchor values are normalized `[x, y]` coordinates inside the box returned by `getPlayerRenderBox(surface)`.
- No screen-specific anchor maps are allowed.
- No tab-specific anchor maps are allowed.
- No state-specific anchor maps are allowed.

## Player box dimensions

The player box is measured from `.player-sprite` via `getPlayerRenderBox(surface)`.

## Trait/build dimensions

Trait/build player layout is controlled by:

- `.player-wrap`
- `.player-render-surface[data-render-state="build"]`
- `.player-wrap.player-render-surface .player-sprite`
- `--player-scale: .82`
- `--player-max-width: 640px`
- `--player-fit: contain`
- `--player-position: center center`

## Completed build dimensions

Completed build player layout is controlled by:

- `.player-wrap`
- `.player-wrap.player-render-surface[data-render-state="complete"]`
- `.player-wrap.player-render-surface .player-sprite`
- `--player-scale: .68`
- `--player-max-width: 560px`
- `--player-fit: contain`
- `--player-position: center center`

## Appearance-only files

These may change brightness, opacity, filters, or future non-layout appearance:

- `js/playerRenderer.js`
- `css/styles.css`

Appearance changes must not change player box size, player position, sprite dimensions, `object-fit`, `transform-origin`, or anchor math.

## Files that must not be edited for uniforms

Uniform work must not edit:

- `js/anchorEditor.js`
- `js/ui.js` connector math
- `bodyAnchorMap()` values
- `.player-wrap` layout
- `.player-render-surface` layout variables
- `.player-sprite` dimensions

## Runtime assertions

`js/playerRenderer.js` warns in the console when:

- a player render box changes after its initial render
- a sprite dimension changes
- build and completed anchor boxes differ

Warnings are guardrails only. They do not mutate layout.
