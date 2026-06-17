// Screen-space HUD: player health bar + score. Unlike world objects, this is
// added directly to app.stage (on top of the world container) so it does NOT
// pan or zoom with the camera — it stays pinned to the top-left of the screen.

import { Container, Graphics, Text } from "pixi.js";
import { COLORS } from "../config.js";

const BAR_WIDTH = 220;
const BAR_HEIGHT = 22;

export class Hud {
  constructor(app) {
    this.view = new Container();
    app.stage.addChild(this.view); // added after world => drawn on top

    this.score = new Text({
      text: "Score: 0",
      style: { fill: COLORS.hudText, fontFamily: "Arial", fontSize: 22, fontWeight: "bold" },
    });
    this.score.position.set(16, 14);

    this.hpBg = new Graphics().roundRect(0, 0, BAR_WIDTH, BAR_HEIGHT, 6).fill(COLORS.hpBg);
    this.hpFill = new Graphics().roundRect(0, 0, BAR_WIDTH, BAR_HEIGHT, 6).fill(COLORS.hpFill);
    this.hpBg.position.set(16, 50);
    this.hpFill.position.set(16, 50);

    this.hpText = new Text({
      text: "",
      style: { fill: COLORS.hudText, fontFamily: "Arial", fontSize: 13, fontWeight: "bold" },
    });
    this.hpText.position.set(22, 53);

    this.view.addChild(this.hpBg, this.hpFill, this.hpText, this.score);
  }

  set(hp, maxHp, score) {
    this.hpFill.scale.x = Math.max(0, hp / maxHp); // shrink the green from the right
    this.hpText.text = `${Math.ceil(Math.max(0, hp))} / ${maxHp}`;
    this.score.text = `Score: ${score}`;
  }
}
