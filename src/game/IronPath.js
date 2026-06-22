// Iron Path meta-progression helpers (pure functions over config + raw XP).
//
//   total XP  -> level (1..maxLevel)
//   level     -> which weapons are unlocked
//   match result -> XP earned
//
// The Profile stores only the accumulated `ironPathXp`; everything else is
// derived here so there's a single source of truth for the progression curve.

import { GAME } from "../config.js";

const IP = GAME.ironPath;

// Total accumulated XP -> current level (capped at maxLevel).
export function levelForXp(xp) {
  return Math.min(IP.maxLevel, Math.floor(Math.max(0, xp) / IP.xpPerLevel) + 1);
}

// Progress within the current level: { into, need } in XP.
export function levelProgress(xp) {
  if (levelForXp(xp) >= IP.maxLevel) return { into: IP.xpPerLevel, need: IP.xpPerLevel };
  return { into: Math.max(0, xp) % IP.xpPerLevel, need: IP.xpPerLevel };
}

// The level at which a given weapon index unlocks. Weapon 0 is free (level 1);
// the rest unlock one per `unlockEvery` levels in config order.
export function unlockLevel(weaponIndex) {
  return weaponIndex === 0 ? 1 : IP.unlockEvery * weaponIndex;
}

export function isWeaponUnlocked(level, weaponIndex) {
  return level >= unlockLevel(weaponIndex);
}

// XP awarded for a finished match.
export function earnedXp({ kills = 0, survival = 0, won = false }) {
  return Math.round(
    kills * IP.xpPerKill + survival * IP.xpPerSecond + (won ? IP.winBonus : 0),
  );
}
