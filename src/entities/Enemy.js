// A simple AI enemy: a colored circle that wanders the arena. Its "brain" is a
// heading it nudges randomly every so often; it bounces off the arena walls so
// it always stays inside. Size/HP/speed/color/score/xp come from a tier object
// (see GAME.enemy.tiers) so the same class covers small, medium, and large foes.

import { Container } from "pixi.js";
import { graphics, drawCircle } from "../render/shapes.js";
import { HealthBar } from "../render/HealthBar.js";

const FLASH_DURATION = 0.12;

export class Enemy {
  constructor({ x, y, tier, bounds }) {
    this.x = x;
    this.y = y;
    this.tier = tier; // { radius, hp, speed, color, score, xp }
    this.radius = tier.radius;
    this.maxHp = tier.hp;
    this.hp = tier.hp;
    this.speed = tier.speed;
    this.bounds = bounds;
    this.dead = false;

    this.heading = Math.random() * Math.PI * 2; // current travel direction
    this._wander = this.#nextWander(); // time until the next heading nudge
    this._flash = 0;

    this.view = new Container();
    this.body = new Container();
    // Scale the bar to the body so big enemies get a proportionate bar.
    this.healthBar = new HealthBar(Math.max(40, tier.radius * 1.6));
    this.#build(tier.color);
    this.syncView();
  }

  update(dt) {
    if (this._flash > 0) this._flash -= dt;

    this.healthBar.set(this.hp / this.maxHp);
    this.healthBar.update(dt);

    // Occasionally steer in a new random-ish direction (the "wander" behavior).
    this._wander -= dt;
    if (this._wander <= 0) {
      this.heading += (Math.random() * 2 - 1) * 1.4;
      this._wander = this.#nextWander();
    }

    this.x += Math.cos(this.heading) * this.speed * dt;
    this.y += Math.sin(this.heading) * this.speed * dt;

    // Bounce off the arena walls (reflect heading) so the enemy stays inside.
    const b = this.bounds;
    const r = this.radius;
    if (this.x < b.minX + r) {
      this.x = b.minX + r;
      this.heading = Math.PI - this.heading;
    } else if (this.x > b.maxX - r) {
      this.x = b.maxX - r;
      this.heading = Math.PI - this.heading;
    }
    if (this.y < b.minY + r) {
      this.y = b.minY + r;
      this.heading = -this.heading;
    } else if (this.y > b.maxY - r) {
      this.y = b.maxY - r;
      this.heading = -this.heading;
    }
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._flash = FLASH_DURATION;
  }

  #nextWander() {
    return 0.8 + Math.random() * 1.4; // 0.8–2.2s between heading changes
  }

  #build(color) {
    const circle = graphics();
    drawCircle(circle, 0, 0, this.radius, color);
    this.body.addChild(circle);
    this.healthBar.view.position.set(0, -(this.radius + 16));
    this.view.addChild(this.body, this.healthBar.view);
  }

  syncView() {
    this.view.position.set(this.x, this.y);
    const punch = this._flash > 0 ? 1 + 0.18 * (this._flash / FLASH_DURATION) : 1;
    this.body.scale.set(punch);
  }
}
