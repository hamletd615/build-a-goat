# BUILD-A-GOAT
Project Status & Development Roadmap

Last Updated:
July 4, 2026

---

# Current Vision

Build-A-GOAT is an NBA build creator and simulation game inspired by NBA 2K.

The player:
- Spins for an NBA team.
- Spins for a player.
- Chooses one trait from that player.
- Builds an NBA archetype.
- Simulates a career.
- Eventually progresses through seasons, badges, awards, championships, contracts, and Hall of Fame.

The game should feel polished, premium, and replayable.

---

# Current Milestones

## ✅ Milestone 1
Core Build Creator

Status:
Complete

Includes:
- Team wheel
- Player wheel
- Respins
- Trait selection
- Overall calculation
- Build overview
- Share build
- Archetype generation

---

## 🔄 Milestone 2
Player Renderer

Status:
In Progress

Goals:
- Dark player during build
- Bright player after build completion
- Team uniforms
- Dynamic logos
- Proper scaling
- Responsive positioning
- Shared renderer
- No duplicate render systems

Known Issues:
- Uniform rendering
- Completed renderer consistency
- Season renderer consistency

---

## 🔄 Milestone 3
Anchor System

Status:
In Progress

Goals:
- Connector nodes perfectly locked to body
- Single coordinate system
- Anchor editor
- Shared bodyAnchorMap()

Known Issues:
- Minor node alignment drift
- Renderer inconsistencies between screens

---

## ⏳ Milestone 4
Season Simulation

Status:
Not Started

Future Features:
- Team selection
- Season simulation
- Awards
- Playoffs
- Finals
- Championships
- Career stats

---

## ⏳ Milestone 5
Player Progression

Not Started

Features:
- Attribute growth
- Badge progression
- Potential
- Peak
- Decline
- Retirement

---

## ⏳ Milestone 6
Badges

Not Started

Examples:
- Limitless Range
- Anchor
- Clamps
- Posterizer
- Dimer

---

## ⏳ Milestone 7
Animations

Not Started

Examples:
- Dunk packages
- Layup packages
- Jump shots
- Dribble styles

---

## ⏳ Milestone 8
Presentation

Not Started

Examples:
- Sound effects
- Animations
- Better transitions
- Trophy room
- Draft stage
- Hall of Fame

---

# Architecture Goals

There should only be ONE system for each of the following.

Player Renderer

- build
- complete
- season
- results

should all call the SAME renderer.

---

Anchor System

One:

bodyAnchorMap()

used by

- build
- editor
- connector renderer

No duplicate coordinate conversions.

---

Player Assets

Dark Player
Used only during build.

Completed Player
Used everywhere after build completion.

---

# Development Rules

Never duplicate systems.

Refactor before patching.

One renderer.

One anchor map.

One coordinate system.

Commit after every completed feature.

Push to GitHub after every commit.

---

# Git Workflow

After every successful feature:

Commit

Example:

Player renderer stable

Anchor editor complete

Season renderer complete

Mobile layout complete

Then:

Push origin

Never leave completed work unpushed.

---

# Current Priority

1. Restore lost work from GitHub version.

2. Stabilize Player Renderer.

3. Stabilize Anchor System.

4. Finish Season Renderer.

5. Mobile UI.

6. Player Progression.

7. Badges.

8. Animations.

9. Polish.

10. Release.