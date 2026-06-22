// Shared barrel geometry for weapons, so a weapon's turret looks identical
// whether it's drawn in-world (Pixi, on the Tank) or as a flat SVG preview in
// the Arsenal cards. Returns a list of barrels relative to a tank of radius R,
// each pointing along its own `angle` (0 = facing right):
//
//   { length, width, perp, angle }
//     length — how far the barrel sticks out from the tank center
//     width  — barrel thickness
//     perp   — sideways offset from the center axis (for side-by-side barrels)
//     angle  — direction in radians (0 = forward)
//
// Geometry only — no colors. Callers pick fills/outlines to match their medium.

export function turretBarrels(turret, R) {
  switch (turret) {
    case "dual":
      return [
        { length: 2.2 * R, width: 0.42 * R, perp: -0.5 * R, angle: 0 },
        { length: 2.2 * R, width: 0.42 * R, perp: 0.5 * R, angle: 0 },
      ];
    case "wide": // machine gun — one short fat barrel
      return [{ length: 1.9 * R, width: 0.9 * R, perp: 0, angle: 0 }];
    case "flank": // a barrel front and back
      return [
        { length: 2.1 * R, width: 0.55 * R, perp: 0, angle: 0 },
        { length: 1.7 * R, width: 0.5 * R, perp: 0, angle: Math.PI },
      ];
    case "long": // sniper
      return [{ length: 3.1 * R, width: 0.5 * R, perp: 0, angle: 0 }];
    case "triple":
      return [
        { length: 2.2 * R, width: 0.42 * R, perp: 0, angle: 0 },
        { length: 2.0 * R, width: 0.4 * R, perp: 0, angle: -0.2 },
        { length: 2.0 * R, width: 0.4 * R, perp: 0, angle: 0.2 },
      ];
    case "rocket": // rocketeer — fat barrel with a wider muzzle box (the mouth)
      return [
        { length: 2.3 * R, width: 0.8 * R, perp: 0, angle: 0 },
        { length: 0.7 * R, width: 1.0 * R, perp: 1.9 * R, angle: 0.5 * Math.PI },
      ];
    case "penta": // five-way fan
      return [-0.4, -0.2, 0, 0.2, 0.4].map((a) => ({
        length: 2.0 * R,
        width: 0.36 * R,
        perp: 0,
        angle: a,
      }));
    case "pounder": // single very thick barrel
      return [{ length: 2.2 * R, width: 1.05 * R, perp: 0, angle: 0 }];
    case "cannon": // two thick stacked barrels
      return [
        { length: 2.2 * R, width: 0.6 * R, perp: -0.55 * R, angle: 0 },
        { length: 2.2 * R, width: 0.6 * R, perp: 0.55 * R, angle: 0 },
      ];
    case "laser": // thin, very long
      return [{ length: 3.5 * R, width: 0.28 * R, perp: 0, angle: 0 }];
    case "single":
    default:
      return [{ length: 2.2 * R, width: 0.6 * R, perp: 0, angle: 0 }];
  }
}
