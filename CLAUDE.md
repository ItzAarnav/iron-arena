# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Iron Arena is a 2D top-down multiplayer tank IO game (Diep.io-inspired). Single-player prototype is playable: move (WASD), aim (mouse), shoot (left click) wandering enemy bots inside a bounded arena, with HP, score, and particle hit feedback. Multiplayer is not built yet.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build

## Tech Stack

- **Rendering:** PixiJS v8 (async `Application.init()`, WebGL/WebGPU)
- **Build/dev:** Vite 6, ES modules
- **Server (future):** Node.js + WebSocket

## Code Structure

- `src/main.js` — entry point; assembles scenery (arena floor → grid → border) and creates the `Game`. Game-specific assembly lives here, not in the engine.
- `src/engine/` — gameplay-agnostic core. `Engine` owns the Pixi `Application`, the world `Container`, the camera, and the frame loop. Each tick it (1) updates+syncs all entities, (2) runs registered **systems** (`addSystem`), (3) reaps entities flagged `dead` and destroys their views, (4) applies the camera. `Camera` smoothly lerps toward its `target` (`followSpeed`) and clamps the view to `bounds`; `screenToWorld()` supports cursor aim. `Input` is a passive keyboard/mouse state holder (`isDown`, `moveAxis`, `mouse`, `isFiring`) with no game logic.
- `src/entities/` — world objects: `Tank` (player; HP, fire cooldown, `tryFire()`), `Enemy` (wandering bot, bounces off walls), `Bullet` (straight-line, lifetime + bounds despawn), `Particle` (cosmetic burst). Each owns its world transform + a Pixi view and exposes `syncView()` and optionally `update(dt)`. Entities self-flag `this.dead = true` to be removed.
- `src/game/Game.js` — the gameplay coordinator (NOT in the engine). Owns the player, spawns/maintains enemies, fires bullets, resolves collisions (bullet↔enemy, enemy↔player), tracks score, and drives the HUD. Plugs in via `engine.addSystem` so it runs after entities move.
- `src/render/` — pure rendering helpers: `shapes.js` (diep-style fill + auto-darkened bold outline), `Grid.js`, `Arena.js` (floor + border), `HealthBar.js` (floats above an entity, added to its non-rotating view).
- `src/ui/Hud.js` — screen-space HUD (HP bar + score), attached to `app.stage`, not the world.
- `src/config.js` — all tunable visual/world/gameplay constants (`COLORS`, `WORLD`, `GAME`). Add new values here, not inline.

## Conventions

- All world-space objects are added to `engine.world` (via `addToWorld`/`addEntity`) so they pan and zoom with the camera. Screen-space UI (HUD) attaches directly to `app.stage`.
- Outlines are never hand-picked: use the helpers in `shapes.js`, which derive a darker shade of the fill via `darken()`.
- The frame loop calls `entity.update(dt)` then `entity.syncView()`; entities mutate state in `update` and only touch their Pixi view in `syncView`.
- An entity's `view` is positioned (not rotated) at its world spot; anything that rotates (e.g. a tank's barrel) goes in a child sub-container so upright children (health bars) aren't rotated.
- Removal is deferred: set `entity.dead = true` (or call `engine.removeEntity`); the Engine destroys the view during cleanup. Game-wide logic that spawns/removes entities belongs in a **system**, not an entity.

## Visual Style

- Simple geometric shapes (circles, rectangles, polygons)
- Bold outlines: same color as fill but darker shade, thick stroke
- Heavy use of particles and effects

## Architecture Principles

- Keep rendering, input, and camera systems modular and decoupled
- Performance target: 30+ players and bots simultaneously
- No overengineering — build what's needed now
- Do NOT implement full gameplay systems until engine foundation is solid

## Development Phases

1. **Phase 1 (done):** Engine setup — PixiJS renderer, camera system, tank rendering
2. **Phase 2 (done):** Input handling, basic movement
3. **Phase 3 (done):** Single-player gameplay prototype — shooting, collisions, enemy bots, HP, arena, HUD
4. **Phase 4:** Server + WebSocket multiplayer
