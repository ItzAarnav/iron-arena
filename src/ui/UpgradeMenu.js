// The upgrade menu (Tab). Screen-space Pixi overlay on app.stage. Each stat row
// shows a label, pips for points invested, and a [+] button enabled only when a
// point is available. Buttons are clickable; the Game also maps number keys
// 1..5 to the same rows. The menu reads/spends points via Progression through
// the onUpgrade callback supplied by the Game.

import { Container, Graphics, Text } from "pixi.js";
import { COLORS, GAME } from "../config.js";

const PANEL_W = 380;
const ROW_H = 46;
const HEADER = 92;
const PAD = 24;

export class UpgradeMenu {
  constructor(app, progression, onUpgrade) {
    this.app = app;
    this.prog = progression;
    this.onUpgrade = onUpgrade; // (stat) => boolean (did it apply)
    this.order = GAME.upgrades.order;

    this.view = new Container();
    this.view.visible = false;
    app.stage.addChild(this.view);

    this.panel = new Graphics();
    this.title = new Text({
      text: "UPGRADES",
      style: { fill: COLORS.hudText, fontFamily: "Arial", fontSize: 22, fontWeight: "bold" },
    });
    this.pointsText = new Text({
      text: "",
      style: { fill: COLORS.xpFill, fontFamily: "Arial", fontSize: 15, fontWeight: "bold" },
    });
    this.hint = new Text({
      text: "Click + or press 1–5  ·  Tab to close",
      style: { fill: COLORS.hudDim, fontFamily: "Arial", fontSize: 12 },
    });
    this.view.addChild(this.panel, this.title, this.pointsText, this.hint);

    this.rows = this.order.map((stat, i) => this.#buildRow(stat, i));
    this.layout();
  }

  #buildRow(stat, i) {
    const cfg = GAME.upgrades[stat];
    const row = new Container();

    const key = new Text({
      text: String(i + 1),
      style: { fill: COLORS.hudDim, fontFamily: "Arial", fontSize: 13, fontWeight: "bold" },
    });
    const label = new Text({
      text: cfg.label,
      style: { fill: COLORS.hudText, fontFamily: "Arial", fontSize: 16, fontWeight: "bold" },
    });
    const pips = new Graphics();

    // Plus button (its own little interactive container).
    const btn = new Container();
    btn.eventMode = "static";
    btn.cursor = "pointer";
    const btnBg = new Graphics();
    const btnText = new Text({
      text: "+",
      style: { fill: COLORS.hudText, fontFamily: "Arial", fontSize: 20, fontWeight: "bold" },
    });
    btnText.anchor.set(0.5);
    btn.addChild(btnBg, btnText);
    btn.on("pointertap", () => this.upgrade(stat));

    row.addChild(key, label, pips, btn);
    this.view.addChild(row);
    return { stat, cfg, row, key, label, pips, btn, btnBg, btnText };
  }

  toggle() {
    this.view.visible = !this.view.visible;
    if (this.view.visible) {
      this.layout();
      this.refresh();
    }
  }

  isOpen() {
    return this.view.visible;
  }

  upgrade(stat) {
    if (this.onUpgrade(stat)) this.refresh();
  }

  // Position the panel centered on screen and lay out the rows.
  layout() {
    const W = this.app.screen.width;
    const H = this.app.screen.height;
    const panelH = HEADER + this.order.length * ROW_H + PAD;
    const x = Math.round((W - PANEL_W) / 2);
    const y = Math.round((H - panelH) / 2);

    this.view.position.set(x, y);
    this.panel
      .clear()
      .roundRect(0, 0, PANEL_W, panelH, 12)
      .fill({ color: COLORS.menuPanel, alpha: 0.97 })
      .stroke({ color: COLORS.menuBorder, width: 3 });

    this.title.position.set(PAD, 22);
    this.pointsText.position.set(PAD, 54);
    this.hint.position.set(PAD, panelH - 22);

    this.rows.forEach((r, i) => {
      const ry = HEADER + i * ROW_H;
      r.row.position.set(0, ry);
      r.key.position.set(PAD, 14);
      r.label.position.set(PAD + 22, 11);
      // pips laid out from a fixed column
      r.btn.position.set(PANEL_W - PAD - 32, 4);
      r.btnBg.clear().roundRect(0, 0, 32, 32, 8).fill(COLORS.pipOff);
      r.btnText.position.set(16, 16);
    });

    this.refresh();
  }

  // Redraw pips and enable/disable buttons from current progression state.
  refresh() {
    const pts = this.prog.points;
    this.pointsText.text = `Points available: ${pts}`;

    this.rows.forEach((r) => {
      const level = this.prog.stats[r.stat];
      const max = r.cfg.max;

      // pips: small squares, filled up to the invested level
      const pipW = 14;
      const gap = 4;
      const startX = PANEL_W - PAD - 32 - 16 - max * (pipW + gap);
      r.pips.clear();
      for (let k = 0; k < max; k++) {
        r.pips
          .roundRect(startX + k * (pipW + gap), 16, pipW, 8, 2)
          .fill(k < level ? COLORS.pipOn : COLORS.pipOff);
      }

      const canUpgrade = this.prog.canUpgrade(r.stat);
      r.btn.eventMode = canUpgrade ? "static" : "none";
      r.btn.alpha = canUpgrade ? 1 : 0.4;
      r.btnBg.clear().roundRect(0, 0, 32, 32, 8).fill(canUpgrade ? COLORS.pipOn : COLORS.pipOff);
    });
  }
}
