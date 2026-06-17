// Global engine + visual + gameplay constants. Keep tunable values here, not
// scattered in code, so balance/feel can be adjusted in one place.

export const COLORS = {
  background: 0x14141a, // outside the arena (darker void)
  arenaFloor: 0x1e1e26, // the playable area
  grid: 0x2c2c38,
  arenaBorder: 0x3a3a48,

  tankBody: 0x00b0e9, // player blue
  tankBarrel: 0x9aa0a6,

  enemyBody: 0xe2564b, // enemy red
  enemyBarrel: 0xb0b0b0,

  hpBg: 0x2a2a2a,
  hpFill: 0x76d672, // health-bar green

  hitSpark: 0xffe08a, // bullet-impact particles
  hudText: 0xffffff,
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
  camera: { followSpeed: 6 }, // higher = camera catches up faster

  player: {
    maxHp: 100,
    speed: 280,
    turnRate: 16, // barrel aim responsiveness
    fireRate: 0.16, // seconds between shots
    contactInvuln: 0.7, // i-frames after taking contact damage
  },

  bullet: {
    speed: 780,
    radius: 7,
    life: 1.2, // despawns after this long
    damage: 25,
  },

  enemy: {
    count: 6, // arena is kept topped up to this many
    maxHp: 60,
    speed: 115,
    radius: 26,
    contactDamage: 12,
    scoreValue: 100,
  },
};
