// Customization panels reached from the main menu and the waiting room:
//   CosmeticsPanel — pick a tank body color
//   ArsenalPanel   — pick a weapon (card grid; locked until unlocked on the Iron Path)
//   IronPathPanel  — the 1..60 progression track (weapon unlocks every 6 levels)
//
// Each is a floating card above everything (the menu hides itself when one opens
// — see GameFlow). They read the current selection/level from the profile and
// report choices via onSelect; GameFlow applies them live + persists.

import { el, hexToCss } from "./dom.js";
import { GAME } from "../config.js";
import { weaponPreviewSvg } from "./weaponPreview.js";
import { isWeaponUnlocked, unlockLevel, levelProgress } from "../game/IronPath.js";

class Panel {
  constructor(title, onClose) {
    this.body = el("div", { class: "ia-row" });
    this.card = el("div", { class: "ia-panel" }, [
      el("h2", { text: title }),
      this.body,
      el("button", { class: "ia-btn", text: "Back", on: { click: () => onClose() } }),
    ]);
    this.root = el("div", { class: "ia-overlay ia-scrim ia-hidden" }, [this.card]);
    document.body.appendChild(this.root);
  }
  show() {
    this.root.classList.remove("ia-hidden");
  }
  hide() {
    this.root.classList.add("ia-hidden");
  }
}

export class CosmeticsPanel extends Panel {
  // onSelect(index) — called when a swatch is chosen.
  constructor(profile, onSelect, onClose) {
    super("COSMETICS", onClose);
    this.profile = profile;
    this.swatches = GAME.cosmetics.map((c, i) =>
      el("div", {
        class: "ia-swatch",
        style: { background: hexToCss(c.color) },
        on: {
          click: () => {
            onSelect(i);
            this.#highlight();
          },
        },
      }),
    );
    this.swatches.forEach((s) => this.body.appendChild(s));
    this.#highlight();
  }
  #highlight() {
    this.swatches.forEach((s, i) =>
      s.classList.toggle("ia-selected", i === this.profile.cosmetic),
    );
  }
  show() {
    this.#highlight();
    super.show();
  }
}

// Arsenal: a 2-column scrollable grid of weapon CARDS. Each card shows the
// weapon mounted on a tank (visual turret identity). Locked weapons show a lock
// icon + faded silhouette and aren't selectable; unlocked ones are equippable.
export class ArsenalPanel extends Panel {
  constructor(profile, onSelect, onClose) {
    super("ARSENAL", onClose);
    this.profile = profile;
    this.onSelect = onSelect;
    this.body.classList.remove("ia-row");
    this.grid = el("div", { class: "ia-arsenal-grid" });
    this.body.appendChild(this.grid);
  }

  show() {
    this.#render();
    super.show();
  }

  #render() {
    const level = this.profile.ironPathLevel;
    const color = (GAME.cosmetics[this.profile.cosmetic] || GAME.cosmetics[0]).color;
    this.grid.replaceChildren();

    GAME.weapons.forEach((w, i) => {
      const locked = !isWeaponUnlocked(level, i);
      const selected = i === this.profile.weapon && !locked;

      const art = el("div", { class: "ia-card-art" });
      art.innerHTML = weaponPreviewSvg(w, { color, locked });

      const children = [
        art,
        el("div", { class: "ia-card-name", text: w.name }),
        el("div", {
          class: "ia-card-sub",
          text: locked ? `Unlocks at Lv ${unlockLevel(i)}` : "Tap to equip",
        }),
      ];
      if (locked) children.push(el("div", { class: "ia-card-lock", text: "🔒" }));

      const card = el(
        "div",
        {
          class:
            "ia-card" + (selected ? " ia-selected" : "") + (locked ? " ia-locked" : ""),
          on: {
            click: () => {
              if (locked) return;
              this.onSelect(i);
              this.#render();
            },
          },
        },
        children,
      );
      this.grid.appendChild(card);
    });
  }
}

// Iron Path: a horizontal progression track, 1..maxLevel. Every `unlockEvery`
// levels is a weapon node (preview + name); the rest are placeholder nodes.
export class IronPathPanel extends Panel {
  constructor(profile, onClose) {
    super("IRON PATH", onClose);
    this.profile = profile;
    this.body.classList.remove("ia-row");
    this.body.style.flexDirection = "column";

    this.head = el("div", { class: "ia-ironpath-head" }, [
      el("div", { class: "ia-ironpath-level" }),
      el("div", { class: "ia-note" }),
    ]);
    this.track = el("div", { class: "ia-track" });
    this.body.append(this.head, this.track);
  }

  show() {
    this.#render();
    super.show();
  }

  #render() {
    const xp = this.profile.ironPathXp;
    const level = this.profile.ironPathLevel;
    const { into, need } = levelProgress(xp);
    const color = (GAME.cosmetics[this.profile.cosmetic] || GAME.cosmetics[0]).color;

    this.head.children[0].textContent = `Level ${level} / ${GAME.ironPath.maxLevel}`;
    this.head.children[1].textContent = `${xp} XP   ·   ${into}/${need} to next level`;

    this.track.replaceChildren();
    let current = null;
    for (let lvl = 1; lvl <= GAME.ironPath.maxLevel; lvl++) {
      const weaponIndex = lvl % GAME.ironPath.unlockEvery === 0 ? lvl / GAME.ironPath.unlockEvery : -1;
      const unlocked = level >= lvl;
      const isCurrent = lvl === level;

      const cls =
        "ia-node" +
        (weaponIndex >= 0 ? " ia-weapon" : "") +
        (unlocked ? " ia-unlocked" : "") +
        (isCurrent ? " ia-current" : "");

      const kids = [el("div", { class: "ia-node-lvl", text: `Lv ${lvl}` })];
      if (weaponIndex >= 0 && GAME.weapons[weaponIndex]) {
        const w = GAME.weapons[weaponIndex];
        const art = el("div", { class: "ia-node-art" });
        art.innerHTML = weaponPreviewSvg(w, { color, locked: !unlocked });
        kids.push(art, el("div", { class: "ia-node-name", text: w.name }));
      } else {
        kids.push(el("div", { class: "ia-node-dot" }));
      }

      const node = el("div", { class: cls }, kids);
      if (isCurrent) current = node;
      this.track.appendChild(node);
    }

    // Scroll the current level into view once laid out.
    if (current) requestAnimationFrame(() => current.scrollIntoView({ inline: "center", block: "nearest" }));
  }
}
