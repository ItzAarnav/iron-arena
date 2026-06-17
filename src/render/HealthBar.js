// A small health bar that floats above an entity. It is added as a child of the
// entity's (non-rotating) view container, so it always stays upright. Call
// set(ratio) when HP changes and update(dt) every frame; the green fill eases
// toward the target instead of snapping, for a smoother feel.

import { Container, Graphics } from "pixi.js";
import { COLORS } from "../config.js";

export class HealthBar {
  constructor(width = 48, height = 7) {
    this.view = new Container();

    const bg = new Graphics().roundRect(0, 0, width, height, 3).fill(COLORS.hpBg);
    this.fill = new Graphics().roundRect(0, 0, width, height, 3).fill(COLORS.hpFill);
    this.view.addChild(bg, this.fill);

    // Pivot on the horizontal center so positioning the view centers the bar.
    this.view.pivot.set(width / 2, 0);

    this._target = 1; // desired ratio
    this._shown = 1; // animated ratio actually drawn
  }

  set(ratio) {
    this._target = Math.max(0, Math.min(1, ratio));
  }

  update(dt) {
    // Frame-rate-independent easing toward the target.
    this._shown += (this._target - this._shown) * (1 - Math.exp(-14 * dt));
    this.fill.scale.x = Math.max(0, this._shown);
  }
}
