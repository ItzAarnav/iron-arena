// Static world-space grid for spatial reference (diep-style). Lives in the
// world container so it pans/zooms with the camera. Drawn to fill the given
// arena bounds so the grid lines up with the playable area.

import { Graphics } from "pixi.js";
import { COLORS, WORLD } from "../config.js";

export function createGrid(bounds) {
  const g = new Graphics();
  const step = WORLD.gridSize;
  const { minX, minY, maxX, maxY } = bounds;

  for (let x = Math.ceil(minX / step) * step; x <= maxX; x += step) {
    g.moveTo(x, minY).lineTo(x, maxY);
  }
  for (let y = Math.ceil(minY / step) * step; y <= maxY; y += step) {
    g.moveTo(minX, y).lineTo(maxX, y);
  }
  g.stroke({ color: COLORS.grid, width: 1 });

  return g;
}
