// A world-space loot crate: a container holding 3 upgrade items. The player
// opens it by touching it (the Game grants all the items at once). Rendered as a
// rarity-tinted box with a darker outline and three "item" pips on the lid so it
// reads as a container. The Game reads `items` (array of {kind,typeKey,rarity})
// and the crate's `rarity` (for color); set `dead = true` once opened.

import { Container, Graphics } from "pixi.js";
import { darken } from "../render/shapes.js";
import { RARITY_COLOR } from "../game/upgrades.js";
import { GAME } from "../config.js";

export class Crate {
  constructor({ x, y, rarity = 0, items = [] }) {
    this.x = x;
    this.y = y;
    this.rarity = rarity;
    this.items = items;
    this.radius = GAME.crate.radius; // collection/contact radius
    this.dead = false;
    this._t = Math.random() * Math.PI * 2; // bob phase

    const r = this.radius;
    const color = RARITY_COLOR[rarity];
    this.view = new Container();
    const g = new Graphics();
    // box body
    g.roundRect(-r, -r, r * 2, r * 2, 6).fill(color).stroke({ color: darken(color), width: 4 });
    // lid seam
    g.moveTo(-r, -r * 0.25).lineTo(r, -r * 0.25).stroke({ color: darken(color), width: 3 });
    // three item pips on the lid (it holds 3)
    const pipY = -r * 0.6;
    for (let i = -1; i <= 1; i++) {
      g.circle(i * r * 0.5, pipY, r * 0.12).fill({ color: 0xffffff, alpha: 0.85 });
    }
    this.view.addChild(g);
    this.syncView();
  }

  update(dt) {
    this._t += dt * 2.4;
  }

  syncView() {
    this.view.position.set(this.x, this.y);
    this.view.scale.set(1 + Math.sin(this._t) * 0.05);
  }
}
