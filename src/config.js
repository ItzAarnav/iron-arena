// Global engine + visual + gameplay constants. Keep tunable values here, not
// scattered in code, so balance/feel can be adjusted in one place.

export const COLORS = {
  background: 0x14141a, // outside the arena (darker void)
  arenaFloor: 0x1e1e26, // the playable area
  grid: 0x2c2c38,
  arenaBorder: 0x3a3a48,

  tankBody: 0x00b0e9, // player blue
  tankBarrel: 0x9aa0a6,

  hpBg: 0x2a2a2a,
  hpFill: 0x76d672, // health-bar green

  xpFill: 0xffd24a, // XP bar / orbs gold
  xpOrb: 0x8be0ff,
  xpBg: 0x2a2a2a,

  hitSpark: 0xffe08a, // bullet-impact particles
  hudText: 0xffffff,
  hudDim: 0x9aa0b0, // secondary HUD text

  damageText: 0xffe8a0,
  menuPanel: 0x191920,
  menuBorder: 0x3a3a48,
  pipOn: 0x76d672,
  pipOff: 0x33333d,
};

// Bold outlines: same hue as the fill but darker, drawn thick.
export const OUTLINE = {
  darken: 0.75, // multiply a fill color by this to get its outline color
  width: 4,
};

const arenaHalf = 1400; // half-extent of the square arena, in world units
export const WORLD = {
  gridSize: 64, // px between grid lines
  arenaHalf,
  bounds: {
    minX: -arenaHalf,
    minY: -arenaHalf,
    maxX: arenaHalf,
    maxY: arenaHalf,
  },
};

// Gameplay tuning. Times are in seconds, speeds in world units / second.
export const GAME = {
  camera: {
    followSpeed: 6, // higher = camera catches up faster
    shakeDecay: 30, // how fast a shake settles (units/sec)
    shakeMax: 24, // cap so big bursts don't nauseate
  },

  // Base player stats. Upgrades are applied on top of these (see `upgrades`).
  player: {
    maxHp: 100,
    speed: 280,
    turnRate: 16, // barrel aim responsiveness
    fireRate: 0.16, // seconds between shots
    contactInvuln: 0.7, // i-frames after taking contact damage
  },

  // Base bullet stats (damage/speed are raised by upgrades).
  bullet: { speed: 780, radius: 7, life: 1.2, damage: 25 },

  enemy: {
    startAlive: 6, // spawned at game start
    maxAlive: 14, // continuous spawning fills up to this
    spawnInterval: 1.0, // seconds between continuous spawns
    contactDamage: 12,
    // Size tiers — bigger enemies are slower but worth more score + XP.
    tiers: [
      { name: "small", radius: 18, hp: 30, speed: 145, color: 0xef9a3d, score: 50, xp: 7 },
      { name: "medium", radius: 28, hp: 60, speed: 110, color: 0xe2564b, score: 100, xp: 14 },
      { name: "large", radius: 44, hp: 150, speed: 74, color: 0xc2497f, score: 250, xp: 36 },
    ],
    weights: [0.5, 0.35, 0.15], // base spawn probability per tier (small..large)
  },

  // XP / leveling. Requirement grows geometrically each level.
  xp: {
    base: 30, // XP needed for level 1 -> 2
    growth: 1.32, // each level needs this much more
    magnetRange: 230, // orbs start homing within this distance
    collectRange: 30, // picked up within this distance of the player edge
  },

  // Upgrade stats. `step` is the per-point bonus; `max` the point cap per stat.
  // Tab opens the menu; spend points earned on level-up.
  upgrades: {
    order: ["damage", "fireRate", "speed", "bulletSpeed", "maxHp"],
    damage: { label: "Damage", step: 9, max: 8 },
    fireRate: { label: "Fire Rate", step: 0.013, max: 8, min: 0.05 }, // subtracts from interval
    speed: { label: "Move Speed", step: 24, max: 8 },
    bulletSpeed: { label: "Bullet Speed", step: 75, max: 8 },
    maxHp: { label: "Max Health", step: 25, max: 8 },
  },
};
