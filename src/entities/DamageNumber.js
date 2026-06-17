// A floating damage number that pops above a hit enemy, drifts upward, and
// fades out. Purely cosmetic, world-space (so it tracks the hit location as the
// camera moves). Self-flags `dead` when its life runs out.

import { Text } from "pixi.js";
import { COLORS } from "../config.js";

export class DamageNumber {
  constructor({ x, y, amount }) {
    this.x = x;
    this.y = y;
    this.vy = -70; // rises, then eases
    this.life = 0.7;
    this.maxLife = 0.7;
    this.dead = false;

    this.view = new Text({
      text: String(amount),
      style: {
        fill: COLORS.damageText,
        fontFamily: "Arial",
        fontSize: 18,
        fontWeight: "bold",
        stroke: { color: 0x000000, width: 3 }, // outline for readability over any color
      },
    });
    this.view.anchor.set(0.5);
    this.syncView();
  }

  update(dt) {
    this.y += this.vy * dt;
    this.vy *= 0.92; // decelerate as it rises
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  syncView() {
    const t = Math.max(0, this.life / this.maxLife);
    this.view.position.set(this.x, this.y);
    this.view.alpha = t;
    this.view.scale.set(0.8 + 0.4 * t); // slight shrink as it fades
  }
}
