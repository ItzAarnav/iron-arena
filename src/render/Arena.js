// Arena visuals: a filled floor that marks the playable region against the
// darker void, and a bold border drawn on top of the grid. Split into two
// pieces so the caller can layer them correctly: floor (under the grid) and
// border (over it). Both live in world space.

import { Graphics } from "pixi.js";
import { COLORS } from "../config.js";

export function createArenaFloor(bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  return new Graphics()
    .rect(minX, minY, maxX - minX, maxY - minY)
    .fill(COLORS.arenaFloor);
}

export function createArenaBorder(bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  return new Graphics()
    .rect(minX, minY, maxX - minX, maxY - minY)
    .stroke({ color: COLORS.arenaBorder, width: 10, alignment: 0 }); // inside edge
}
