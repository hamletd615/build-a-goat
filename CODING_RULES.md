# BUILD-A-GOAT DEVELOPMENT RULES

These rules apply to EVERY coding session.

Do not violate these rules unless explicitly instructed.

---

# GENERAL

Always inspect the current code before making changes.

Never assume.

Never duplicate functionality.

Always reuse existing systems before creating new ones.

If a system already exists, extend it instead of replacing it.

---

# PLAYER RENDERER

There must only be ONE player rendering system.

Every screen must use the same renderer.

Render states include:

- Build
- Complete
- Season
- Results

Do not create multiple independent player renderers.

---

# ANCHOR SYSTEM

There must only be ONE bodyAnchorMap().

Never create duplicate anchor maps.

Never hardcode connector coordinates.

Every connector line must use bodyAnchorMap().

The Anchor Editor must edit the exact map used by gameplay.

---

# COORDINATES

One coordinate system.

No duplicate transforms.

No duplicate conversions.

No multiple scaling calculations.

Always calculate anchors relative to the rendered player image.

---

# PLAYER ASSETS

Dark player

Used during build only.

Completed player

Used after build completion only.

Future jerseys should extend the player renderer.

Do not build separate player systems.

---

# CSS

Avoid !important unless absolutely necessary.

Prefer reusable utility classes.

Keep responsive rules organized.

Never duplicate styles.

---

# JAVASCRIPT

Prefer reusable functions.

Avoid copy/paste code.

Avoid duplicated event listeners.

Avoid global variables unless required.

---

# PERFORMANCE

Minimize DOM updates.

Cache repeated queries.

Avoid unnecessary re-renders.

Optimize images.

Lazy load when appropriate.

---

# PROJECT STRUCTURE

Keep code modular.

Keep assets organized.

Delete dead code.

Delete unused assets.

Delete unused CSS.

Delete unused JS.

---

# BEFORE FINISHING A SESSION

Always verify:

✓ No console errors

✓ Desktop works

✓ Mobile works

✓ Build flow works

✓ Simulation works

✓ No broken assets

✓ No duplicate systems

---

# IF A FEATURE CANNOT BE COMPLETED

Do not partially replace an existing system.

Leave the working implementation intact.

Explain what blocked completion.

Never knowingly leave the game in a broken state.

---

# GIT

Never assume work is saved.

Every completed feature should end with:

Commit

Push to GitHub

Never leave multiple successful sessions uncommitted.

---

# WHEN UNSURE

Refactor.

Do not patch.

Simpler architecture is preferred over temporary fixes.

Always choose maintainability.# SINGLE SOURCE OF TRUTH

Every major system must have one authoritative implementation.

Examples:

Player Renderer
→ One renderer

Anchor System
→ One bodyAnchorMap()

Player State
→ One player state object

Season Simulation
→ One simulation engine

Do not create parallel implementations.

Do not create "temporary" versions that become permanent.

If a system already exists, improve it instead of duplicating it.