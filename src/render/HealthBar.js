// A small health bar that floats above an entity. It is added as a child of the
// entity's (non-rotating) view container, so it always stays upright. Call
// set(ratio) each frame; the green fill scales from the left edge.

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
  }

  // ratio in [0,1]; scaling the fill avoids re-tessellating geometry each frame.
  set(ratio) {
    this.fill.scale.x = Math.max(0, Math.min(1, ratio));
  }
}
