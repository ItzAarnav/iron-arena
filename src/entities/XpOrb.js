// An XP orb dropped by a dead enemy. It scatters outward briefly, then homes in
// on the player once they're within magnet range, and is auto-collected on
// contact. The Game watches `collected` to award the XP; the Engine reaps it
// once `dead` is set.

import { COLORS, GAME } from "../config.js";
import { graphics, drawCircle } from "../render/shapes.js";

export class XpOrb {
  constructor({ x, y, value, player }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.player = player;
    this.radius = 6;
    this.collected = false;
    this.dead = false;

    // Initial outward scatter so a burst of orbs fans out before homing.
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 120;
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;

    this.view = drawCircle(graphics(), 0, 0, this.radius, COLORS.xpOrb);
    this.syncView();
  }

  update(dt) {
    const p = this.player;
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    const d = Math.hypot(dx, dy) || 1;

    // Accelerate toward the player when within magnet range (stronger up close).
    if (d < GAME.xp.magnetRange) {
      const pull = 320 + 1100 * (1 - d / GAME.xp.magnetRange);
      this.vx += (dx / d) * pull * dt;
      this.vy += (dy / d) * pull * dt;
    }

    this.vx *= 0.9; // drag
    this.vy *= 0.9;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (d < GAME.xp.collectRange + p.radius) {
      this.collected = true;
      this.dead = true;
    }
  }

  syncView() {
    this.view.position.set(this.x, this.y);
  }
}
