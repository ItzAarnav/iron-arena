// Screen-space HUD. Added directly to app.stage (on top of the world container)
// so it does NOT pan/zoom with the camera.
//
// Layout:
//   top-left   — score, level, enemies alive, optional FPS, upgrade-point hint
//   bottom-mid — HP bar (above) and XP bar (below), both centered & animated
//
// Bars are fixed-width Graphics; the fill is scaled (0..1) and eased toward its
// target so health/XP changes glide instead of snapping.

import { Container, Graphics, Text } from "pixi.js";
import { COLORS } from "../config.js";

const BAR_W = 460;
const HP_H = 18;
const XP_H = 14;

export class Hud {
  constructor(app) {
    this.app = app;
    this.view = new Container();
    app.stage.addChild(this.view);

    // --- top-left stack ---
    this.score = this.#text(24, "bold", COLORS.hudText);
    this.level = this.#text(17, "bold", COLORS.xpFill);
    this.enemies = this.#text(15, "normal", COLORS.hudDim);
    this.fps = this.#text(15, "normal", COLORS.hudDim);
    this.pointsHint = this.#text(15, "bold", COLORS.xpFill);

    // --- bottom-center bars ---
    this.hpBg = new Graphics().roundRect(0, 0, BAR_W, HP_H, 6).fill(COLORS.hpBg);
    this.hpFill = new Graphics().roundRect(0, 0, BAR_W, HP_H, 6).fill(COLORS.hpFill);
    this.hpText = this.#text(12, "bold", COLORS.hudText);
    this.hpText.anchor.set(0.5);

    this.xpBg = new Graphics().roundRect(0, 0, BAR_W, XP_H, 6).fill(COLORS.xpBg);
    this.xpFill = new Graphics().roundRect(0, 0, BAR_W, XP_H, 6).fill(COLORS.xpFill);
    // White with a dark outline so it reads over both the gold fill and the
    // empty (dark) part of the bar.
    this.xpText = new Text({
      text: "",
      style: {
        fill: COLORS.hudText,
        fontFamily: "Arial",
        fontSize: 11,
        fontWeight: "bold",
        stroke: { color: 0x000000, width: 2 },
      },
    });
    this.xpText.anchor.set(0.5);

    this.view.addChild(
      this.score, this.level, this.enemies, this.fps, this.pointsHint,
      this.hpBg, this.hpFill, this.hpText,
      this.xpBg, this.xpFill, this.xpText,
    );

    this._hpShown = 1; // animated bar fills
    this._xpShown = 0;

    this.layout();
  }

  #text(size, weight, fill) {
    return new Text({
      text: "",
      style: { fill, fontFamily: "Arial", fontSize: size, fontWeight: weight },
    });
  }

  // Position everything relative to the current screen size (call on resize).
  layout() {
    const W = this.app.screen.width;
    const H = this.app.screen.height;

    this.score.position.set(16, 12);
    this.level.position.set(16, 46);
    this.enemies.position.set(16, 70);
    this.fps.position.set(16, 92);
    this.pointsHint.position.set(16, 116);

    const cx = Math.round((W - BAR_W) / 2);
    const hpY = H - 56;
    const xpY = H - 30;
    this.hpBg.position.set(cx, hpY);
    this.hpFill.position.set(cx, hpY);
    this.hpText.position.set(W / 2, hpY + HP_H / 2);
    this.xpBg.position.set(cx, xpY);
    this.xpFill.position.set(cx, xpY);
    this.xpText.position.set(W / 2, xpY + XP_H / 2);
  }

  // s: { hp, maxHp, score, level, xp, xpToNext, enemies, points, fps, showFps }
  update(s, dt) {
    // Ease the bar fills toward their targets.
    const hpTarget = Math.max(0, s.hp / s.maxHp);
    const xpTarget = Math.max(0, Math.min(1, s.xp / s.xpToNext));
    const k = 1 - Math.exp(-12 * dt);
    this._hpShown += (hpTarget - this._hpShown) * k;
    this._xpShown += (xpTarget - this._xpShown) * k;
    this.hpFill.scale.x = Math.max(0, this._hpShown);
    this.xpFill.scale.x = Math.max(0, this._xpShown);

    this.score.text = `Score: ${s.score}`;
    this.level.text = `Level ${s.level}`;
    this.enemies.text = `Enemies: ${s.enemies}`;
    this.fps.text = s.showFps ? `FPS: ${s.fps}` : "";
    this.pointsHint.text = s.points > 0 ? `▲ ${s.points} upgrade${s.points > 1 ? "s" : ""} — press Tab` : "";

    this.hpText.text = `${Math.ceil(Math.max(0, s.hp))} / ${s.maxHp}`;
    this.xpText.text = `Lv ${s.level}   ${Math.floor(s.xp)} / ${s.xpToNext} XP`;
  }
}
