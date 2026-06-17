// A short-lived visual particle used for hit sparks and death bursts. It drifts
// outward with drag, fades, and grows slightly, then flags itself dead for the
// Engine to clean up. Purely cosmetic — no gameplay state.

import { Graphics } from "pixi.js";

export class Particle {
  constructor({ x, y, vx = 0, vy = 0, radius = 4, color, life = 0.4 }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.dead = false;

    this.view = new Graphics().circle(0, 0, radius).fill(color);
    this.syncView();
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.9; // drag so the burst eases to a stop
    this.vy *= 0.9;

    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  syncView() {
    const t = Math.max(0, this.life / this.maxLife);
    this.view.position.set(this.x, this.y);
    this.view.alpha = t; // fade out
    this.view.scale.set(1 + (1 - t) * 1.4); // expand as it dies
  }
}
