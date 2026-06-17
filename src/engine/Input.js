// Input tracks raw keyboard + mouse state. It is a passive state holder: it
// records what is currently pressed and where the cursor is, and exposes that
// for entities to read each frame. It contains no game logic.

export class Input {
  constructor(target = window) {
    this.keys = new Set(); // currently-held key codes (e.g. "KeyW")
    this.mouse = { x: 0, y: 0 }; // cursor position in screen (CSS) pixels
    this.mouseLeft = false; // left button held (used for shooting)

    target.addEventListener("keydown", (e) => this.keys.add(e.code));
    target.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouseLeft = true;
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouseLeft = false;
    });
    // Drop held inputs when the window loses focus so nothing gets stuck.
    window.addEventListener("blur", () => {
      this.keys.clear();
      this.mouseLeft = false;
    });
  }

  isDown(code) {
    return this.keys.has(code);
  }

  // True while the left mouse button is held (continuous fire).
  isFiring() {
    return this.mouseLeft;
  }

  // Normalized WASD movement vector. (0,0) when idle; length 1 otherwise so
  // diagonals aren't faster than cardinals.
  moveAxis() {
    let x = 0;
    let y = 0;
    if (this.isDown("KeyA")) x -= 1;
    if (this.isDown("KeyD")) x += 1;
    if (this.isDown("KeyW")) y -= 1;
    if (this.isDown("KeyS")) y += 1;
    const len = Math.hypot(x, y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }
}
