// Reverse-engineered source mirror extracted from the runtime bundle.
// Shared one-shot gameplay effects used by the completion flow and celebration bursts.
function spawnPulseRing(t, e, i, s, r, n, a = !1, o = !1, h = 16777215) {
  const l = t.add.graphics().setScrollFactor(0).setDepth(55).setBlendMode(M),
    u = { r: s, t: 0 };
  t.tweens.add({
    targets: u,
    r: r,
    t: 1,
    duration: n,
    ease: a && !o ? "Quad.Out" : "Linear",
    onUpdate: () => {
      const t = u.t,
        s = o ? (t < 0.5 ? 2 * t : 2 * (1 - t)) : 1 - t;
      l.clear(),
        a
          ? (l.fillStyle(h, Math.max(0, s)), l.fillCircle(e, i, u.r))
          : (l.lineStyle(4, h, Math.max(0, s)), l.strokeCircle(e, i, u.r));
    },
    onComplete: () => l.destroy(),
  });
}
function spawnConfettiBurst(t, e = 16777215, i = 16777215) {
  const s = 200 + (n - 400) * Math.random(),
    r = 200 + 240 * Math.random();
  spawnPulseRing(t, s, r, 40, 140 + 60 * Math.random(), 500, !0, !0, i),
    t.add
      .particles(s, r, "GJ_WebSheet", {
        frame: "square.png",
        speed: { min: 520, max: 920 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.4, end: 0.13 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 0, max: 500 },
        stopAfter: 25,
        blendMode: M,
        tint: e,
        x: { min: -20, max: 20 },
        y: { min: -20, max: 20 },
      })
      .setScrollFactor(0)
      .setDepth(57);
}
window.levelName = "Custom Level";

// Main gameplay scene for the web port. The Phaser runtime above is bundled
// third-party code, so this is the safest place to make the game logic readable.
