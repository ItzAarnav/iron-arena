// Game is the gameplay coordinator. The Engine stays gameplay-agnostic; all the
// rules live here: it owns the player + progression, spawns/maintains tiered
// enemies, fires bullets, resolves collisions, awards XP/score, drives the HUD,
// and runs the upgrade menu.
//
// It plugs into the engine as a single "system" (engine.addSystem), so its
// update() runs every frame AFTER all entities have moved — meaning collision
// checks and XP pickups always see current positions.

import { Text } from "pixi.js";
import { Tank } from "../entities/Tank.js";
import { Enemy } from "../entities/Enemy.js";
import { Bullet } from "../entities/Bullet.js";
import { Particle } from "../entities/Particle.js";
import { XpOrb } from "../entities/XpOrb.js";
import { DamageNumber } from "../entities/DamageNumber.js";
import { Progression } from "./Progression.js";
import { Hud } from "../ui/Hud.js";
import { UpgradeMenu } from "../ui/UpgradeMenu.js";
import { COLORS, WORLD, GAME } from "../config.js";

export class Game {
  constructor(engine, input) {
    this.engine = engine;
    this.input = input;
    this.bounds = WORLD.bounds;

    this.score = 0;
    this.bullets = [];
    this.enemies = [];
    this.orbs = [];
    this._playerHitCd = 0; // i-frame timer for player contact damage
    this._spawnTimer = 0; // counts down to the next continuous spawn
    this.showFps = false;

    this.progression = new Progression();

    // Configure the shared camera: smooth follow, arena clamp, shake tuning.
    const cam = engine.camera;
    cam.followSpeed = GAME.camera.followSpeed;
    cam.bounds = this.bounds;
    cam.shakeDecay = GAME.camera.shakeDecay;
    cam.shakeMax = GAME.camera.shakeMax;

    // Player at center; the camera follows it.
    this.player = new Tank({ x: 0, y: 0, input, camera: cam, bounds: this.bounds });
    engine.addEntity(this.player);
    cam.follow(this.player);
    this.#applyStats();

    // "Lv N" label under the player (child of its non-rotating view).
    this.levelLabel = new Text({
      text: "Lv 1",
      style: { fill: COLORS.hudText, fontFamily: "Arial", fontSize: 13, fontWeight: "bold" },
    });
    this.levelLabel.anchor.set(0.5);
    this.levelLabel.position.set(0, this.player.radius + 18);
    this.player.view.addChild(this.levelLabel);

    // Seed the arena.
    for (let i = 0; i < GAME.enemy.startAlive; i++) this.#spawnEnemy();

    // UI.
    this.hud = new Hud(engine.app);
    this.menu = new UpgradeMenu(engine.app, this.progression, (stat) => this.#tryUpgrade(stat));

    // Keep UI laid out on window resize.
    engine.app.renderer.on("resize", () => {
      this.hud.layout();
      this.menu.layout();
    });

    engine.addSystem((dt) => this.update(dt));
  }

  update(dt) {
    this.#handleInput();

    // Shooting — fire while held (Tank enforces its own cooldown).
    if (this.input.isFiring()) {
      const shot = this.player.tryFire();
      if (shot) this.#spawnBullet(shot);
    }

    // Combat against current positions.
    this.#bulletHits();
    this.#playerContact(dt);

    // XP pickups (orbs flag themselves collected on contact with the player).
    this.#collectXp();

    // Continuous, balanced spawning up to the cap.
    this._spawnTimer -= dt;
    if (this._spawnTimer <= 0 && this.enemies.length < GAME.enemy.maxAlive) {
      this.#spawnEnemy();
      this._spawnTimer = GAME.enemy.spawnInterval;
    }

    // Reap dead entries from our lists (Engine frees the views).
    this.bullets = this.bullets.filter((b) => !b.dead);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.orbs = this.orbs.filter((o) => !o.dead);

    // Reflect state.
    this.levelLabel.text = `Lv ${this.progression.level}`;
    this.hud.update(
      {
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        score: this.score,
        level: this.progression.level,
        xp: this.progression.xp,
        xpToNext: this.progression.xpToNext,
        enemies: this.enemies.length,
        points: this.progression.points,
        fps: Math.round(this.engine.app.ticker.FPS),
        showFps: this.showFps,
      },
      dt,
    );
  }

  // --- input ----------------------------------------------------------------

  #handleInput() {
    if (this.input.wasPressed("Tab")) this.menu.toggle();
    if (this.input.wasPressed("KeyF")) this.showFps = !this.showFps;
    // Number keys 1..N map to the upgrade rows in order.
    this.progressionOrder ??= GAME.upgrades.order;
    for (let i = 0; i < this.progressionOrder.length; i++) {
      if (this.input.wasPressed(`Digit${i + 1}`)) this.#tryUpgrade(this.progressionOrder[i]);
    }
  }

  #tryUpgrade(stat) {
    const ok = this.progression.upgrade(stat);
    if (ok) {
      this.#applyStats();
      this.menu.refresh();
    }
    return ok;
  }

  // Push derived numbers onto the player + bullet spawns. Increasing max HP also
  // grants the difference so leveling feels rewarding immediately.
  #applyStats() {
    const s = this.progression.derive();
    const p = this.player;
    const hpDelta = s.maxHp - p.maxHp;
    p.maxHp = s.maxHp;
    if (hpDelta > 0) p.hp = Math.min(p.maxHp, p.hp + hpDelta);
    p.speed = s.speed;
    p.fireRate = s.fireRate;
    this._bulletDamage = s.damage;
    this._bulletSpeed = s.bulletSpeed;
  }

  // --- combat ---------------------------------------------------------------

  #bulletHits() {
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const e of this.enemies) {
        if (e.dead) continue;
        const dx = e.x - b.x;
        const dy = e.y - b.y;
        const reach = e.radius + b.radius;
        if (dx * dx + dy * dy <= reach * reach) {
          e.takeDamage(b.damage);
          b.dead = true;
          this.#burst(b.x, b.y, COLORS.hitSpark, 5); // impact particles
          this.#damageNumber(e.x, e.y - e.radius, b.damage);
          if (e.hp <= 0) this.#killEnemy(e);
          break; // this bullet is spent
        }
      }
    }
  }

  #killEnemy(e) {
    e.dead = true;
    const tier = e.tier;
    this.score += tier.score;
    this.#burst(e.x, e.y, tier.color, 10 + Math.round(e.radius / 2)); // death burst scales with size
    this.engine.camera.shake(4 + GAME.enemy.tiers.indexOf(tier) * 4); // bigger = bigger shake
    this.#dropXp(e.x, e.y, tier.xp);
  }

  #playerContact(dt) {
    if (this._playerHitCd > 0) this._playerHitCd -= dt;
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const reach = e.radius + p.radius;
      if (dx * dx + dy * dy <= reach * reach && this._playerHitCd <= 0) {
        p.takeDamage(GAME.enemy.contactDamage);
        this._playerHitCd = GAME.player.contactInvuln;
        this.engine.camera.shake(7);
        if (p.hp <= 0) this.#respawnPlayer();
        break;
      }
    }
  }

  #respawnPlayer() {
    this.player.hp = this.player.maxHp;
    this.player.x = 0;
    this.player.y = 0;
    this.#burst(0, 0, COLORS.tankBody, 22);
    this.engine.camera.shake(14);
  }

  // --- xp -------------------------------------------------------------------

  #collectXp() {
    for (const o of this.orbs) {
      if (o.collected && !o._awarded) {
        o._awarded = true;
        const levels = this.progression.addXp(o.value);
        if (levels > 0) this.#onLevelUp();
      }
    }
  }

  #onLevelUp() {
    // Visible reward: a flash burst + small shake, and refresh the menu so the
    // new point shows immediately if it's open.
    this.#burst(this.player.x, this.player.y, COLORS.xpFill, 18);
    this.engine.camera.shake(6);
    this.menu.refresh();
  }

  // --- spawning -------------------------------------------------------------

  #spawnBullet({ x, y, angle }) {
    const b = new Bullet({
      x,
      y,
      angle,
      speed: this._bulletSpeed,
      radius: GAME.bullet.radius,
      life: GAME.bullet.life,
      damage: this._bulletDamage,
      color: COLORS.tankBody,
      bounds: this.bounds,
    });
    this.bullets.push(b);
    this.engine.addEntity(b);
  }

  #spawnEnemy() {
    const tier = this.#pickTier();
    const margin = 80;
    const b = this.bounds;
    let x, y;
    do {
      x = b.minX + margin + Math.random() * (b.maxX - b.minX - margin * 2);
      y = b.minY + margin + Math.random() * (b.maxY - b.minY - margin * 2);
    } while (this.player && Math.hypot(x - this.player.x, y - this.player.y) < 360);

    const e = new Enemy({ x, y, tier, bounds: this.bounds });
    this.enemies.push(e);
    this.engine.addEntity(e);
  }

  // Weighted tier pick. Larger enemies get slightly more common as the player
  // levels up, so difficulty scales with progress (spawn balancing).
  #pickTier() {
    const tiers = GAME.enemy.tiers;
    const w = [...GAME.enemy.weights];
    const bias = Math.min(0.25, (this.progression.level - 1) * 0.015);
    w[0] = Math.max(0.1, w[0] - bias);
    w[w.length - 1] += bias;

    const sum = w.reduce((a, v) => a + v, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < w.length; i++) {
      if (r < w[i]) return tiers[i];
      r -= w[i];
    }
    return tiers[tiers.length - 1];
  }

  // Split an XP reward across a few orbs so it bursts out then homes in.
  #dropXp(x, y, total) {
    const n = Math.min(5, Math.max(1, Math.round(total / 8)));
    const each = total / n;
    for (let i = 0; i < n; i++) {
      const o = new XpOrb({ x, y, value: each, player: this.player });
      this.orbs.push(o);
      this.engine.addEntity(o);
    }
  }

  // --- fx -------------------------------------------------------------------

  #damageNumber(x, y, amount) {
    this.engine.addEntity(new DamageNumber({ x, y, amount: Math.round(amount) }));
  }

  #burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 80 + Math.random() * 170;
      this.engine.addEntity(
        new Particle({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          radius: 3 + Math.random() * 3,
          color,
          life: 0.3 + Math.random() * 0.25,
        }),
      );
    }
  }
}
