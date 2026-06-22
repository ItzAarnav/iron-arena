// Builds a flat SVG preview of a weapon mounted on a tank, used by the Arsenal
// cards. Reuses the SAME barrel geometry as the in-world tank (render/turret.js)
// so the card preview and the actual turret always match. Locked weapons render
// as a faded silhouette (the card adds the lock icon over the top).

import { turretBarrels } from "../render/turret.js";
import { darken } from "../render/shapes.js";
import { hexToCss } from "./dom.js";

const R = 22; // preview tank radius (in SVG units)

// weapon: a GAME.weapons entry. opts: { color, locked }.
export function weaponPreviewSvg(weapon, { color = 0x00b0e9, locked = false } = {}) {
  const body = locked ? "#39394a" : hexToCss(color);
  const bodyEdge = locked ? "#23232c" : hexToCss(darken(color));
  const barrel = locked ? "#2c2c36" : "#9aa0a6";
  const barrelEdge = locked ? "#1c1c24" : hexToCss(darken(0x9aa0a6));

  const barrels = turretBarrels(weapon.turret, R)
    .map((b) => {
      const pts = barrelPoints(b)
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      return `<polygon points="${pts}" fill="${barrel}" stroke="${barrelEdge}" stroke-width="3" stroke-linejoin="round"/>`;
    })
    .join("");

  return (
    `<svg viewBox="-70 -60 140 120" width="100%" height="100%" aria-hidden="true">` +
    barrels +
    `<circle cx="0" cy="0" r="${R}" fill="${body}" stroke="${bodyEdge}" stroke-width="4"/>` +
    `</svg>`
  );
}

// Four corners of one barrel rect, transformed exactly like the Pixi version:
// a rect from (0,-w/2)..(length,w/2), rotated by `angle`, then shifted
// perpendicular by `perp`.
function barrelPoints(b) {
  const local = [
    [0, -b.width / 2],
    [b.length, -b.width / 2],
    [b.length, b.width / 2],
    [0, b.width / 2],
  ];
  const ox = -Math.sin(b.angle) * b.perp;
  const oy = Math.cos(b.angle) * b.perp;
  const c = Math.cos(b.angle);
  const s = Math.sin(b.angle);
  return local.map(([x, y]) => [x * c - y * s + ox, x * s + y * c + oy]);
}
