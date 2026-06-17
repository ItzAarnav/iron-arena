// Entry point. Assembles the scene: the gameplay-agnostic engine, the world
// scenery (arena floor, grid, border — layered in that z-order), and the Game
// coordinator that owns the player, enemies, bullets, collisions, and HUD.

import { Engine } from "./engine/Engine.js";
import { Input } from "./engine/Input.js";
import { createGrid } from "./render/Grid.js";
import { createArenaFloor, createArenaBorder } from "./render/Arena.js";
import { Game } from "./game/Game.js";
import { WORLD } from "./config.js";

async function start() {
  const engine = new Engine();
  await engine.init();

  const input = new Input();

  // World scenery, back-to-front: floor, grid lines, then the bold border.
  engine.addToWorld(createArenaFloor(WORLD.bounds));
  engine.addToWorld(createGrid(WORLD.bounds));
  engine.addToWorld(createArenaBorder(WORLD.bounds));

  // Gameplay: player (WASD + mouse-aim), enemies, shooting (left click),
  // collisions, score, and HUD all live in here.
  const game = new Game(engine, input);

  // Dev-only debug handle (stripped from production builds).
  if (import.meta.env.DEV) window.__game = { engine, input, game };
}

start();
