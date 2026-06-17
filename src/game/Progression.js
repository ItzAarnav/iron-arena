// Progression owns the player's meta-state: XP, level, unspent upgrade points,
// and how many points have been put into each stat. It is pure data + math —
// no rendering. The Game reads derive() to push concrete numbers onto the
// player/bullets, and the UpgradeMenu reads/calls upgrade() to spend points.

import { GAME } from "../config.js";

export class Progression {
  constructor() {
    this.level = 1;
    this.xp = 0; // XP banked toward the next level
    this.xpToNext = this.#req(1);
    this.points = 0; // unspent upgrade points
    // Points invested per stat (0..max).
    this.stats = { damage: 0, fireRate: 0, speed: 0, bulletSpeed: 0, maxHp: 0 };
  }

  // XP required to go from `level` to `level + 1`, growing geometrically.
  #req(level) {
    return Math.round(GAME.xp.base * Math.pow(GAME.xp.growth, level - 1));
  }

  // Bank XP; may cross several level thresholds at once. Returns levels gained.
  addXp(amount) {
    this.xp += amount;
    let gained = 0;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.points += 1;
      this.xpToNext = this.#req(this.level);
      gained += 1;
    }
    return gained;
  }

  canUpgrade(stat) {
    return this.points > 0 && this.stats[stat] < GAME.upgrades[stat].max;
  }

  upgrade(stat) {
    if (!this.canUpgrade(stat)) return false;
    this.stats[stat] += 1;
    this.points -= 1;
    return true;
  }

  // Turn invested points into concrete player/bullet numbers. Fire rate is an
  // interval, so upgrades *subtract* from it (clamped to a floor).
  derive() {
    const u = GAME.upgrades;
    const s = this.stats;
    const base = GAME.player;
    return {
      damage: GAME.bullet.damage + s.damage * u.damage.step,
      fireRate: Math.max(u.fireRate.min, base.fireRate - s.fireRate * u.fireRate.step),
      speed: base.speed + s.speed * u.speed.step,
      bulletSpeed: GAME.bullet.speed + s.bulletSpeed * u.bulletSpeed.step,
      maxHp: base.maxHp + s.maxHp * u.maxHp.step,
    };
  }
}
