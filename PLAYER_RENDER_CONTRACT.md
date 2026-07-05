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

## Future team player assets

Team-specific completed-build player art is prepared for this folder structure:

```text
assets/
  teamPlayers/
    ATL.png
    BOS.png
    BKN.png
    CHA.png
    CHI.png
    CLE.png
    DAL.png
    DEN.png
    DET.png
    GSW.png
    HOU.png
    IND.png
    LAC.png
    LAL.png
    MEM.png
    MIA.png
    MIL.png
    MIN.png
    NOP.png
    NYK.png
    OKC.png
    ORL.png
    PHI.png
    PHX.png
    POR.png
    SAC.png
    SAS.png
    TOR.png
    UTA.png
    WAS.png
```

Naming convention:

- Each file is a transparent full-player PNG.
- Each filename is the three-letter NBA team abbreviation.
- The image canvas must match `assets/player/base-player.png`.

Renderer entry point:

- `renderPlayer()` in `js/playerRenderer.js` is still the only player renderer.
- `getTeamPlayerAsset(teamId)` is the canonical lookup for future team-player PNGs.
- `playerImageSource(config)` is the only renderer path that decides whether to request a team-player asset.

Fallback behavior:

- The active test registry currently supports only `CHI`.
- If a team-player asset is not registered as shipped or has not loaded successfully, `getTeamPlayerAsset(teamId)` returns `assets/player/base-player.png`.
- Missing team-player assets must never produce broken image icons or console errors.

Post-build only behavior:

- Only completed/post-build render states may request team-player assets: `complete`, `season`, `awards`, and `results`.
- Trait selection, spin wheels, team selection, player selection, and unfinished builds must always use `assets/player/base-player.png`.

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
