// Game is the gameplay coordinator. The Engine stays gameplay-agnostic; all the
// rules live here: it owns the player, spawns/maintains enemies, fires bullets,
// resolves collisions, tracks score, and drives the HUD.
//
// It plugs into the engine as a single "system" (engine.addSystem), so its
// update() runs every frame AFTER all entities have moved — meaning collision
// checks always see current positions.

import { Tank } from "../entities/Tank.js";
import { Enemy } from "../entities/Enemy.js";
import { Bullet } from "../entities/Bullet.js";
import { Particle } from "../entities/Particle.js";
import { Hud } from "../ui/Hud.js";
import { COLORS, WORLD, GAME } from "../config.js";

export class Game {
  constructor(engine, input) {
    this.engine = engine;
    this.input = input;
    this.bounds = WORLD.bounds;
    this.score = 0;
    this.bullets = [];
    this.enemies = [];
    this._playerHitCd = 0; // i-frame timer for player contact damage

    // Configure the shared camera for smooth, arena-clamped following.
    engine.camera.followSpeed = GAME.camera.followSpeed;
    engine.camera.bounds = this.bounds;

    // Player at center; the camera follows it.
    this.player = new Tank({ x: 0, y: 0, input, camera: engine.camera, bounds: this.bounds });
    engine.addEntity(this.player);
    engine.camera.follow(this.player);

    // Fill the arena with enemies.
    for (let i = 0; i < GAME.enemy.count; i++) this.#spawnEnemy();

    this.hud = new Hud(engine.app);

    // Run our per-frame logic as an engine system.
    engine.addSystem((dt) => this.update(dt));
  }

  update(dt) {
    // 1. Shooting — fire while the mouse is held (Tank enforces its own cooldown).
    if (this.input.isFiring()) {
      const shot = this.player.tryFire();
      if (shot) this.#spawnBullet(shot);
    }

    // 2. Resolve combat against current positions.
    this.#bulletHits();
    this.#playerContact(dt);

    // 3. Drop dead bullets/enemies from our lists (Engine frees their views),
    //    then top the arena back up to the target enemy count.
    this.bullets = this.bullets.filter((b) => !b.dead);
    this.enemies = this.enemies.filter((e) => !e.dead);
    while (this.enemies.length < GAME.enemy.count) this.#spawnEnemy();

    // 4. Reflect state in the HUD.
    this.hud.set(this.player.hp, this.player.maxHp, this.score);
  }

  // --- combat ---------------------------------------------------------------

  // Bullet vs enemy: circle overlap. On hit, the bullet dies, the enemy takes
  // damage and flashes, and we emit sparks. A killed enemy awards score.
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
          this.#burst(b.x, b.y, COLORS.hitSpark, 6); // hit feedback
          if (e.hp <= 0) {
            e.dead = true;
            this.score += GAME.enemy.scoreValue;
            this.#burst(e.x, e.y, COLORS.enemyBody, 16); // death burst
          }
          break; // this bullet is spent
        }
      }
    }
  }

  // Enemy touching the player drains HP (with brief i-frames so it ticks, not
  // drains). If the player dies, respawn at center so play continues.
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
        if (p.hp <= 0) this.#respawnPlayer();
        break;
      }
    }
  }

  #respawnPlayer() {
    this.player.hp = this.player.maxHp;
    this.player.x = 0;
    this.player.y = 0;
    this.#burst(0, 0, COLORS.tankBody, 20);
  }

  // --- spawning -------------------------------------------------------------

  #spawnBullet({ x, y, angle }) {
    const b = new Bullet({
      x,
      y,
      angle,
      speed: GAME.bullet.speed,
      radius: GAME.bullet.radius,
      life: GAME.bullet.life,
      damage: GAME.bullet.damage,
      color: COLORS.tankBody,
      bounds: this.bounds,
    });
    this.bullets.push(b);
    this.engine.addEntity(b);
  }

  // Spawn an enemy at a random arena position, kept away from the player so it
  // never appears right on top of them.
  #spawnEnemy() {
    const margin = 80;
    const b = this.bounds;
    let x, y;
    do {
      x = b.minX + margin + Math.random() * (b.maxX - b.minX - margin * 2);
      y = b.minY + margin + Math.random() * (b.maxY - b.minY - margin * 2);
    } while (this.player && Math.hypot(x - this.player.x, y - this.player.y) < 360);

    const e = new Enemy({ x, y, bounds: this.bounds });
    this.enemies.push(e);
    this.engine.addEntity(e);
  }

  // Emit a radial burst of particles (cosmetic only).
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
