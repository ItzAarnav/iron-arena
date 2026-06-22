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

const arenaHalf = 6000; // half-extent of the square arena, in world units (much larger than the view)
const waitingHalf = 1000; // small calm area used by the waiting room
export const WORLD = {
  gridSize: 64, // px between grid lines
  arenaHalf,
  bounds: {
    minX: -arenaHalf,
    minY: -arenaHalf,
    maxX: arenaHalf,
    maxY: arenaHalf,
  },
  // The waiting room is a smaller, calmer space; entities teleport into the
  // full `bounds` when the match starts.
  waitingBounds: {
    minX: -waitingHalf,
    minY: -waitingHalf,
    maxX: waitingHalf,
    maxY: waitingHalf,
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

  // Bots: AI tanks identical to the player (same size/look/bullets). In the
  // battle-royale loop the population is FIXED at match start (no respawns).
  bot: {
    hp: 60,
    speed: 150,
    turnRate: 9, // turret turn smoothness (a touch slower than the player)
    contactDamage: 12,
    score: 100, // awarded per bot killed
    fireRate: 1.3, // seconds between a bot's shots
    bulletDamage: 8, // bot bullets are weak (placeholder shooting)
    bulletSpeed: 640,
    bulletLife: 1.2,
    separation: 90, // anti-clump spacing in world units
    directionInterval: [2, 4.5], // seconds between wander heading changes
    levelMin: 1,
    levelMax: 3, // bot.level is set in this range, no effect yet
    label: "BOT", // username placeholder shown above each bot
  },

  // Battle royale loop: population is fixed at match start (1 player + bots up
  // to matchSize), no new spawns after, deaths permanent, last tank standing wins.
  match: {
    countdown: 30, // seconds in the waiting room before the match starts
    waitingBots: 6, // bots shown idling in the waiting room
    matchSize: 30, // total roster (player + bots) when the match begins
  },

  // Arena Guardians: three heavy tanks at the center to stop early rushing.
  guardian: {
    count: 3,
    hp: 600,
    radius: 40, // larger than a normal tank
    speed: 38, // slow
    turnRate: 3,
    color: 0x9a3b3b, // menacing dark red (still a tank shape, "looks like a player")
    fireRate: 2.2, // slow reload
    bulletDamage: 36, // high damage
    bulletSpeed: 360, // slow bullets
    bulletLife: 3.0,
    contactDamage: 30,
    range: 1200, // engages targets within this distance
    homeRadius: 700, // patrols within this distance of center
  },

  // Toxic fog: a shrinking safe circle. Outside it = damage over time. Prevents
  // camping and forces the fight inward.
  fog: {
    startRadius: arenaHalf * 1.45, // covers ~the whole map at the start
    minRadius: 500, // smallest the safe zone gets
    shrinkRate: 70, // world units per second the safe radius contracts
    dps: 9, // damage per second while outside the safe zone
    color: 0xa64bff, // toxic purple edge
  },

  // Cosmetics: pick the player's tank body color. Purely visual.
  cosmetics: [
    { name: "Aqua", color: 0x00b0e9 },
    { name: "Lime", color: 0x76d672 },
    { name: "Magenta", color: 0xc2497f },
    { name: "Gold", color: 0xffd24a },
    { name: "Violet", color: 0x9b6cff },
  ],

  // Weapons. Index 0 (Standard) is always unlocked; the rest unlock through the
  // Iron Path (one per `ironPath.unlockEvery` levels, in this order). `turret`
  // names the visual barrel layout (rendered by render/turret.js for both the
  // in-world tank and the Arsenal card previews). `barrels` is how many bullets
  // fire per shot (small spread); the *Mul fields scale fire interval / damage /
  // bullet speed. fireRateMul < 1 = shoots faster (smaller interval).
  weapons: [
    { name: "Standard", turret: "single", barrels: 1 },
    { name: "Dual Barrel", turret: "dual", barrels: 2, fireRateMul: 1.1 },
    { name: "Machine Gun", turret: "wide", barrels: 1, fireRateMul: 0.5, damageMul: 0.7 },
    { name: "Flank", turret: "flank", barrels: 2, fireRateMul: 1.0 },
    { name: "Sniper", turret: "long", barrels: 1, fireRateMul: 1.8, damageMul: 1.6, bulletSpeedMul: 1.4 },
    { name: "Triple Shot", turret: "triple", barrels: 3, fireRateMul: 1.2 },
    { name: "Rocketeer", turret: "rocket", barrels: 1, fireRateMul: 1.6, damageMul: 1.8, bulletSpeedMul: 0.8 },
    { name: "Penta-Shot", turret: "penta", barrels: 5, fireRateMul: 1.3, damageMul: 0.8 },
    { name: "Pounder", turret: "pounder", barrels: 1, fireRateMul: 1.5, damageMul: 1.9 },
    { name: "Cannoneer", turret: "cannon", barrels: 2, fireRateMul: 1.25, damageMul: 1.2 },
    { name: "Laser Rifle", turret: "laser", barrels: 1, fireRateMul: 1.4, damageMul: 1.5, bulletSpeedMul: 1.8 },
  ],

  // Iron Path: a 1..maxLevel meta-progression. A weapon unlocks every
  // `unlockEvery` levels (level 6 -> weapon 1, level 12 -> weapon 2, ...).
  // XP is earned per match (kills + survival + a win bonus) and persisted on the
  // Profile; `level = floor(totalXp / xpPerLevel) + 1`, capped at maxLevel.
  ironPath: {
    maxLevel: 60,
    unlockEvery: 6,
    xpPerLevel: 600, // total XP needed for each level step
    xpPerKill: 60,
    xpPerSecond: 1, // survival reward
    winBonus: 500,
  },

  // Loot crates: world containers holding 3 upgrade items (mostly normals, with
  // a small chance of a special). The player opens one by touching it; it grants
  // all 3 at once. Counts are per rarity zone (outer -> center). Crates outside
  // the toxic fog are consumed by it (so loot thins as the safe zone shrinks).
  crate: {
    radius: 30,
    items: 3,
    specialChance: 0.25, // chance any one item in a crate is a special
    perZone: [2, 4, 4, 6], // [center, middle, inner, outside] — matches ZONES order
  },

  // Endgame pressure: as the roster thins the fog accelerates and forces a
  // final confrontation. Counts are total entities still alive (player + bots).
  endgame: {
    compressAt: 10, // <= this many alive: fog shrinks faster
    compressMul: 1.7,
    finalAt: 5, // <= this many alive: final phase (fog dominates, loot rare)
    finalMul: 2.6,
  },
};
