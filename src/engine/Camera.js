// Camera maps world space -> screen space by transforming a single "world"
// Container. Everything in the world is added to camera.world; the camera
// moves that container so the followed point stays centered on screen.

export class Camera {
  constructor(world, screen) {
    this.world = world; // the Container holding all world-space objects
    this.screen = screen; // { width, height }, updated on resize
    this.x = 0; // world coordinate the camera is centered on
    this.y = 0;
    this.zoom = 1;
    this.target = null; // object with { x, y } to track each frame
    this.followSpeed = 0; // 0 = snap instantly; >0 = smooth lerp (units: 1/sec)
    this.bounds = null; // { minX, minY, maxX, maxY } the view is kept inside
    this.shakeAmount = 0; // current shake magnitude in world units
    this.shakeDecay = 30; // how fast it settles per second
    this.shakeMax = 24; // cap so stacked shakes don't go wild
  }

  // Add a transient screen shake (e.g. on hits/explosions). Stacks up to a cap.
  shake(amount) {
    this.shakeAmount = Math.min(this.shakeAmount + amount, this.shakeMax);
  }

  // Center the camera on a world position.
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  // Follow any object exposing { x, y } (e.g. a Tank). The camera re-reads the
  // target's position every frame in apply().
  follow(target) {
    this.target = target;
  }

  // Convert a screen (CSS pixel) position into world coordinates. Inverse of
  // the transform applied in apply(). Used e.g. to aim at the cursor.
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.screen.width / 2) / this.zoom + this.x,
      y: (sy - this.screen.height / 2) / this.zoom + this.y,
    };
  }

  // Apply the current camera state to the world container. Call once per frame
  // after positions update, passing the frame delta for smooth following.
  apply(dt = 0) {
    if (this.target) {
      // Frame-rate-independent exponential smoothing toward the target. With
      // followSpeed 0 (or dt 0) this collapses to an instant snap.
      const t = this.followSpeed > 0 && dt > 0 ? 1 - Math.exp(-this.followSpeed * dt) : 1;
      this.x += (this.target.x - this.x) * t;
      this.y += (this.target.y - this.y) * t;
    }

    // Keep the visible rectangle inside the arena so the void never shows.
    if (this.bounds) {
      const halfW = this.screen.width / (2 * this.zoom);
      const halfH = this.screen.height / (2 * this.zoom);
      this.x = clamp(this.x, this.bounds.minX, this.bounds.maxX, halfW);
      this.y = clamp(this.y, this.bounds.minY, this.bounds.maxY, halfH);
    }

    // A small random offset while shaking; decays back to zero.
    let ox = 0;
    let oy = 0;
    if (this.shakeAmount > 0) {
      ox = (Math.random() * 2 - 1) * this.shakeAmount;
      oy = (Math.random() * 2 - 1) * this.shakeAmount;
      this.shakeAmount = Math.max(0, this.shakeAmount - this.shakeDecay * dt);
    }

    this.world.scale.set(this.zoom);
    this.world.position.set(
      this.screen.width / 2 - (this.x + ox) * this.zoom,
      this.screen.height / 2 - (this.y + oy) * this.zoom,
    );
  }
}

// Clamp `v` to [min, max] inset by `half`. If the span is narrower than the
// viewport, center on it instead (avoids jitter when the arena is small).
function clamp(v, min, max, half) {
  if (max - min <= half * 2) return (min + max) / 2;
  return Math.min(Math.max(v, min + half), max - half);
}
