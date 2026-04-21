// Reverse-engineered source mirror extracted from the runtime bundle.
// PlayerRuntime owns cube and ship rendering, jump physics, collision handling, death animation,
// portal transitions, and sprite synchronization.
class PlayerRuntime {
  constructor(t, e, i) {
    (this._scene = t),
      (this.p = e),
      (this._gameLayer = i),
      (this._rotation = 0),
      (this.rotateActionActive = !1),
      (this.rotateActionTime = 0),
      (this.rotateActionDuration = 0),
      (this.rotateActionStart = 0),
      (this.rotateActionTotal = 0),
      (this._showHitboxes = !0),
      (this._lastLandObject = null),
      (this._lastXOffset = 0),
      (this._lastCameraX = 0),
      (this._lastCameraY = 0),
      (this.p.isPadJumping = !1),
      (this.p.isBuffering = !1),
      (this.p.touchingOrb = !1),
      this._createSprites(),
      this._initParticles(t),
      t.events.on("shutdown", () => this._cleanupExplosion());
  }
  _createSprites() {
    const t = this._scene,
      e = gameYToScreenY(this.p.y),
      i = l;
    if (
      ((this._playerGlowLayer = ws(t, i, e, "player_01_glow_001.png", 9, !1)),
      (this._playerSpriteLayer = ws(t, i, e, "player_01_001.png", 10, !0)),
      (this._playerOverlayLayer = ws(t, i, e, "player_01_2_001.png", 8, !0)),
      (this._playerExtraLayer = ws(t, i, e, "player_01_extra_001.png", 12, !0)),
      this._playerGlowLayer &&
        (this._playerGlowLayer.sprite.setTint(v),
        (this._playerGlowLayer.sprite._glowEnabled = !1)),
      this._playerSpriteLayer)
    )
      this._playerSpriteLayer.sprite.setTint(g);
    else {
      let s = t.add.rectangle(i, e, 60, 60, g);
      s.setDepth(10), (this._playerSpriteLayer = { sprite: s });
    }
    if (
      (this._playerOverlayLayer && this._playerOverlayLayer.sprite.setTint(v),
      (this._shipGlowLayer = ws(t, i, e, "ship_01_glow_001.png", 9, !1)),
      (this._shipSpriteLayer = ws(t, i, e, "ship_01_001.png", 10, !1)),
      (this._shipOverlayLayer = ws(t, i, e, "ship_01_2_001.png", 8, !1)),
      (this._shipExtraLayer = ws(t, i, e, "ship_01_extra_001.png", 12, !1)),
      this._shipGlowLayer &&
        (this._shipGlowLayer.sprite.setTint(v),
        (this._shipGlowLayer.sprite._glowEnabled = !1)),
      this._shipSpriteLayer)
    )
      this._shipSpriteLayer.sprite.setTint(g);
    else {
      let s = t.add.polygon(
        i,
        e,
        [
          { OBJECT_TYPE_HAZARD: -72, OBJECT_TYPE_SOLID: 40 },
          { OBJECT_TYPE_HAZARD: 72, OBJECT_TYPE_SOLID: 0 },
          { OBJECT_TYPE_HAZARD: -72, OBJECT_TYPE_SOLID: -40 },
          { OBJECT_TYPE_HAZARD: -40, OBJECT_TYPE_SOLID: 0 },
        ],
        g,
      );
      s.setDepth(10).setVisible(!1), (this._shipSpriteLayer = { sprite: s });
    }
    const ballFrameName = findTextureFrame(t, "player_ball_00_001.png")
      ? "player_ball_00_001.png"
      : "d_ball_01_001.png";
    if (
      ((this._ballGlowLayer = ws(t, i, e, "player_ball_00_glow_001.png", 9, !1)),
      (this._ballSpriteLayer = ws(t, i, e, ballFrameName, 10, !1)),
      (this._ballOverlayLayer = ws(t, i, e, "player_ball_00_2_001.png", 8, !1)),
      this._ballGlowLayer &&
        (this._ballGlowLayer.sprite.setTint(v),
        (this._ballGlowLayer.sprite._glowEnabled = !1)),
      this._ballSpriteLayer)
    )
      this._ballSpriteLayer.sprite.setTint(g);
    else {
      let s = t.add.circle(i, e, 26, g);
      s.setDepth(10).setVisible(!1), (this._ballSpriteLayer = { sprite: s });
    }
    this._ballOverlayLayer && this._ballOverlayLayer.sprite.setTint(v),
      this._shipOverlayLayer && this._shipOverlayLayer.sprite.setTint(v),
      (this.playerSprite = this._playerSpriteLayer.sprite),
      (this.shipSprite = this._shipSpriteLayer.sprite),
      (this.ballSprite = this._ballSpriteLayer.sprite),
      (this._playerLayers = [
        this._playerSpriteLayer,
        this._playerGlowLayer,
        this._playerOverlayLayer,
        this._playerExtraLayer,
      ]),
      (this._shipLayers = [
        this._shipSpriteLayer,
        this._shipGlowLayer,
        this._shipOverlayLayer,
        this._shipExtraLayer,
      ]),
      (this._ballLayers = [
        this._ballSpriteLayer,
        this._ballGlowLayer,
        this._ballOverlayLayer,
      ]),
      (this._allLayers = [
        ...this._playerLayers,
        ...this._shipLayers,
        ...this._ballLayers,
      ]);
  }
  _initParticles(t) {
    const e = this.flipMod();
    (this._particleEmitter = t.add.particles(0, 0, "GJ_WebSheet", {
      frame: "square.png",
      speed: { min: 110, max: 190 },
      angle: { min: 1 === e ? 225 : 45, max: 1 === e ? 315 : 135 },
      lifespan: { min: 150, max: 450 },
      scale: { start: 0.5, end: 0 },
      gravityY: 600 * e,
      frequency: 1e3 / 30,
      blendMode: "ADD",
      alpha: { start: 1, end: 0 },
      tint: g,
    })),
      this._particleEmitter.stop(),
      this._particleEmitter.setDepth(9),
      this._gameLayer.container.add(this._particleEmitter),
      (this._flyParticleEmitter = t.add.particles(0, 0, "GJ_WebSheet", {
        frame: "square.png",
        speed: { min: 22, max: 38 },
        angle: { min: 1 === e ? 225 : 45, max: 1 === e ? 315 : 135 },
        lifespan: { min: 150, max: 450 },
        scale: { start: 0.5, end: 0 },
        gravityY: 600 * e,
        frequency: 1e3 / 30,
        blendMode: "ADD",
        tint: { start: 16737280, end: 16711680 },
        alpha: { start: 1, end: 0 },
      })),
      this._flyParticleEmitter.stop(),
      this._flyParticleEmitter.setDepth(9),
      this._gameLayer.container.add(this._flyParticleEmitter),
      (this._flyParticle2Emitter = t.add.particles(0, 0, "GJ_WebSheet", {
        frame: "square.png",
        speed: { min: 220, max: 380 },
        angle: { min: 1 === e ? 180 : 0, max: 1 === e ? 360 : 180 },
        lifespan: { min: 150, max: 450 },
        scale: { start: 0.75, end: 0 },
        gravityY: 600 * e,
        frequency: 1e3 / 30,
        blendMode: "ADD",
        tint: { start: 16760320, end: 16711680 },
        alpha: { start: 1, end: 0 },
      })),
      this._flyParticle2Emitter.stop(),
      this._flyParticle2Emitter.setDepth(9),
      this._gameLayer.container.add(this._flyParticle2Emitter),
      (this._shipDragEmitter = t.add.particles(0, 0, "GJ_WebSheet", {
        frame: "square.png",
        speed: { min: 149.2 * 1.5, max: 229.2 * 1.5 },
        angle: { min: 1 === e ? 205 : 65, max: 1 === e ? 295 : 155 },
        lifespan: { min: 80, max: 220 },
        scale: { start: 0.375, end: 0 },
        gravityX: -700,
        gravityY: 600 * e,
        frequency: 25,
        blendMode: "ADD",
        alpha: { start: 1, end: 0 },
      })),
      this._shipDragEmitter.stop(),
      this._shipDragEmitter.setDepth(22),
      (this._shipDragActive = !1),
      (this._particleActive = !1),
      (this._flyParticle2Active = !1),
      (this._flyParticleActive = !1);
    const i = {
      frame: "square.png",
      speed: { min: 250, max: 350 },
      angle: { min: 1 === e ? 210 : 30, max: 1 === e ? 330 : 150 },
      lifespan: { min: 50, max: 600 },
      scale: { start: 0.625, end: 0 },
      gravityY: 1e3 * e,
      blendMode: "ADD",
      alpha: { start: 1, end: 0 },
      tint: g,
      emitting: !1,
    };
    (this._landEmitter1 = t.add.particles(0, 0, "GJ_WebSheet", { ...i })),
      (this._landEmitter2 = t.add.particles(0, 0, "GJ_WebSheet", { ...i })),
      (this._aboveContainer = t.add.container(0, 0)),
      this._aboveContainer.setDepth(13),
      this._aboveContainer.add(this._landEmitter1),
      this._aboveContainer.add(this._landEmitter2),
      (this._landIdx = !1),
      (this._streak = new _s(
        this._scene,
        "streak_01",
        0.231,
        10,
        8,
        100,
        v,
        0.7,
      )),
      this._streak.addToContainer(this._gameLayer.container, 8);
  }
  _updateParticles(t, e, i) {
    if (this.p.isDead) return;
    const s = this._scene._playerWorldX,
      r = gameYToScreenY(this.p.y),
      n = this.flipMod();
    (this._particleEmitter.particleX = s - 20),
      (this._particleEmitter.particleY = r + 26 * n);
    const a = this.p.onGround && !this.p.isFlying;
    a && !this._particleActive
      ? (this._particleEmitter.start(), (this._particleActive = !0))
      : !a &&
        this._particleActive &&
        (this._particleEmitter.stop(), (this._particleActive = !1));
    {
      const t = Math.cos(this._rotation),
        e = Math.sin(this._rotation),
        i = -24,
        a = 18 * n,
        o = s + i * t - a * e,
        h = r + i * e + a * t,
        l = 2 * (2 * Math.random() - 1) * 2;
      (this._flyParticleEmitter.particleX = o),
        (this._flyParticleEmitter.particleY = h + l),
        (this._flyParticle2Emitter.particleX = o),
        (this._flyParticle2Emitter.particleY = h + l),
        this._streak.setPosition(o + 8, h);
    }
    this._streak.update(i);
    const o = this.p.isFlying;
    o && !this._flyParticleActive
      ? (this._flyParticleEmitter.start(), (this._flyParticleActive = !0))
      : !o &&
        this._flyParticleActive &&
        (this._flyParticleEmitter.stop(), (this._flyParticleActive = !1));
    const h = this.p.isFlying && this.p.upKeyDown;
    h && !this._flyParticle2Active
      ? (this._flyParticle2Emitter.start(), (this._flyParticle2Active = !0))
      : !h &&
        this._flyParticle2Active &&
        (this._flyParticle2Emitter.stop(), (this._flyParticle2Active = !1)),
      (this._shipDragEmitter.x = l),
      (this._shipDragEmitter.particleY = gameYToScreenY(this.p.y) + e + 30 * n);
    const u = this.p.isFlying && (1 === n ? this.p.onGround : this.p.onCeiling);
    u && !this._shipDragActive
      ? (this._shipDragEmitter.start(), (this._shipDragActive = !0))
      : !u &&
        this._shipDragActive &&
        (this._shipDragEmitter.stop(), (this._shipDragActive = !1));
  }
  setCubeVisible(t) {
    this._playerSpriteLayer.sprite.setVisible(t),
      this._playerGlowLayer &&
        this._playerGlowLayer.sprite.setVisible(
          t && this._playerGlowLayer.sprite._glowEnabled,
        ),
      this._playerOverlayLayer && this._playerOverlayLayer.sprite.setVisible(t),
      this._playerExtraLayer && this._playerExtraLayer.sprite.setVisible(t);
  }
  setShipVisible(t) {
    this._shipSpriteLayer.sprite.setVisible(t),
      this._shipGlowLayer &&
        this._shipGlowLayer.sprite.setVisible(
          t && this._shipGlowLayer.sprite._glowEnabled,
        ),
      this._shipOverlayLayer && this._shipOverlayLayer.sprite.setVisible(t),
      this._shipExtraLayer && this._shipExtraLayer.sprite.setVisible(t);
  }
  setBallVisible(t) {
    this._ballSpriteLayer.sprite.setVisible(t),
      this._ballGlowLayer &&
        this._ballGlowLayer.sprite.setVisible(
          t && this._ballGlowLayer.sprite._glowEnabled,
        ),
      this._ballOverlayLayer && this._ballOverlayLayer.sprite.setVisible(t);
  }
  syncSprites(t, e, i, s) {
    if (this._endAnimating) return;
    const r = void 0 !== s ? s : l,
      n = gameYToScreenY(this.p.y) + e,
      a = this._rotation,
      o = this.flipMod();
    if (
      ((this._lastCameraX = t),
      (this._lastCameraY = e),
      (this._aboveContainer.x = -t),
      (this._aboveContainer.y = e),
      this.p.isFlying)
    ) {
      const t = 10,
        e = Math.cos(a),
        i = Math.sin(a),
        s = -t * i * o,
        h = t * e * o,
        l = t * i * o,
        u = -t * e * o;
      for (const c of this._shipLayers)
        c &&
          ((c.sprite.x = r + s),
          (c.sprite.y = n + h),
          (c.sprite.rotation = a),
          c.sprite.setScale(1, o));
      for (const c of this._playerLayers)
        c &&
          ((c.sprite.x = r + l),
          (c.sprite.y = n + u),
          (c.sprite.rotation = a),
          c.sprite.setScale(0.55, 0.55 * o));
    } else
      for (const h of this._allLayers)
        h &&
          ((h.sprite.x = r),
          (h.sprite.y = n),
          (h.sprite.rotation = a),
          h.sprite.setScale(1));
    this.p.mode === j &&
      (this._ballSpriteLayer && this._ballSpriteLayer.sprite.setScale(1),
      this._ballGlowLayer && this._ballGlowLayer.sprite.setScale(1),
      this._ballOverlayLayer && this._ballOverlayLayer.sprite.setScale(1));
    this._updateParticles(t, e, i);
  }
  enterCubeMode() {
    (this.p.mode = q),
      (this.p.isFlying = !1),
      this._scene.toggleGlitter(!1),
      this._gameLayer.setFlyMode(!1, 0),
      this._gameLayer.setSurfaceCeilingVisible(!1),
      this._streak.stop(),
      this._streak.reset(),
      this.setCubeVisible(!0),
      this.setShipVisible(!1),
      this.setBallVisible(!1);
  }
  enterShipMode(t = null) {
    if (this.p.isFlying) return;
    this.p.mode = H;
    (this.p.isFlying = !0),
      this._scene.toggleGlitter(!0),
      (this.p.yVelocity *= 0.5),
      (this.p.onGround = !1),
      (this.p.canJump = !1),
      (this.p.isJumping = !1),
      this.stopRotation(),
      (this._rotation = 0),
      this._particleEmitter.stop(),
      (this._flyParticle2Active = !1),
      this._streak.reset(),
      this._streak.start(),
      this.setBallVisible(!1),
      this.setShipVisible(!0);
    for (const i of this._playerLayers)
      i && i.sprite.setScale(0.55, 0.55 * this.flipMod());
    for (const i of this._shipLayers) i && i.sprite.setScale(1, this.flipMod());
    this.playerSprite.setScale(1, this.flipMod());
    let e = this.p.y;
    t && (e = void 0 !== t.portalY ? t.portalY : t.y),
      this._gameLayer.setFlyMode(!0, e);
  }
  exitShipMode() {
    if (this.p.isFlying) {
      (this.p.isFlying = !1),
        this._scene.toggleGlitter(!1),
        (this.p.yVelocity *= 0.5),
        (this.p.onGround = !1),
        (this.p.canJump = !1),
        (this.p.isJumping = !1),
        this.stopRotation(),
        (this._rotation = 0),
        this._flyParticleEmitter.stop(),
        (this._flyParticleActive = !1),
        this._flyParticle2Emitter.stop(),
        (this._flyParticle2Active = !1),
        this._shipDragEmitter.stop(),
        (this._shipDragActive = !1),
        (this._particleActive = !1),
        this._streak.stop(),
        this._streak.reset(),
        this.setShipVisible(!1),
        this.enterCubeMode();
      for (const t of this._playerLayers) t && t.sprite.setScale(1);
      this._gameLayer.setFlyMode(!1, 0);
    }
  }
  enterBallMode() {
    this.exitShipMode(),
      (this.p.mode = j),
      (this.p.isFlying = !1),
      (this.p.onGround = !1),
      (this.p.onCeiling = !1),
      (this.p.canJump = !0),
      (this.p.isJumping = !1),
      this._scene.toggleGlitter(!1),
      this._streak.stop(),
      this._streak.reset(),
      this._gameLayer.setFlyMode(!1, 0),
      this._gameLayer.setSurfaceCeilingVisible(!0),
      this.setCubeVisible(!1),
      this.setShipVisible(!1),
      this.setBallVisible(!0);
  }
  _toggleBallGravity() {
    this.p.gravityFlipped = !this.p.gravityFlipped;
    this.p.onGround = !1;
    this.p.onCeiling = !1;
    this.p.canJump = !1;
    this.p.isJumping = !1;
    this.p.isBuffering = !1;
    this.p.yVelocity *= 0.6;
    this.runRotateAction();
  }
  _isBallSurfaceAttached() {
    return (
      this.p.mode === j &&
      (this.p.onGround ||
        this.p.onCeiling ||
        0 !== this.p.collideBottom ||
        0 !== this.p.collideTop)
    );
  }
  hitGround() {
    if (
      1 == this.p.gravityFlipped &&
      this.p.yVelocity < -0.5 &&
      !this.p.isFlying &&
      this.p.mode !== j
    )
      return void this.killPlayer();
    const t = !this.p.onGround;
    if (
      (this.p.isFlying || (this.p.lastGroundY = this.p.y),
      (this.p.yVelocity = 0),
      (this.p.onGround = !0),
      (this.p.canJump = !0),
      (this.p.isBuffering = !1),
      (this.p.isJumping = !1),
      this.stopRotation(),
      t && !this.p.isFlying)
    ) {
      this._landIdx = !this._landIdx;
      const t = this.flipMod(),
        e = 1 === t ? 30 : -30,
        i = this._landIdx ? this._landEmitter1 : this._landEmitter2,
        s = this._lastCameraX + l,
        r = gameYToScreenY(this.p.y) + e;
      i.setEmitterAngle({
        min: 1 === t ? 210 : 30,
        max: 1 === t ? 330 : 150,
      }),
        i.explode(10, s, r);
    }
  }
  killPlayer() {
    if (1 === window.noclip) return;
    if (this.p.isDead) return;
    (this.p.isDead = !0),
      this._scene.toggleGlitter(!1),
      this._particleEmitter.stop(),
      (this._particleActive = !1),
      this._flyParticleEmitter.stop(),
      (this._flyParticleActive = !1),
      this._flyParticle2Emitter.stop(),
      (this._flyParticle2Active = !1),
      this._shipDragEmitter.stop(),
      (this._shipDragActive = !1),
      this._streak.stop(),
      this._streak.reset();
    const t = this._scene,
      e = t._playerWorldX - t._cameraX,
      i = gameYToScreenY(this.p.y) + this._lastCameraY;
    t.add
      .particles(e, i, "GJ_WebSheet", {
        frame: "square.png",
        speed: { min: 200, max: 800 },
        angle: { min: 0, max: 360 },
        scale: { start: 18 / 32, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 50, max: 800 },
        quantity: 100,
        stopAfter: 100,
        blendMode: M,
        tint: g,
        OBJECT_TYPE_HAZARD: { min: -20, max: 20 },
        OBJECT_TYPE_SOLID: { min: -20, max: 20 },
      })
      .setScrollFactor(0)
      .setDepth(15);
    const s = t.add.graphics().setScrollFactor(0).setDepth(15).setBlendMode(M),
      r = { t: 0 };
    t.tweens.add({
      targets: r,
      t: 1,
      duration: 500,
      ease: "Quad.Out",
      onUpdate: () => {
        const t = 18 + 144 * r.t,
          n = 1 - r.t;
        s.clear(), s.fillStyle(g, n), s.fillCircle(e, i, t);
      },
      onComplete: () => s.destroy(),
    }),
      this._createExplosionPieces(e, i, 0.9),
      this.setCubeVisible(!1),
      this.setShipVisible(!1);
  }
  _createExplosionPieces(t, e, i) {
    const s = this._scene,
      r = 40 * i,
      n = Math.round(2 * r),
      a = s.make.renderTexture({
        OBJECT_TYPE_HAZARD: 0,
        OBJECT_TYPE_SOLID: 0,
        width: n,
        height: n,
        add: !1,
      }),
      o = [
        this._playerGlowLayer,
        this._playerOverlayLayer,
        this._shipGlowLayer,
        this._shipOverlayLayer,
        this._playerSpriteLayer,
        this._playerExtraLayer,
        this._shipSpriteLayer,
        this._shipExtraLayer,
      ];
    for (const g of o) {
      if (!g || !g.sprite.visible) continue;
      const i = g.sprite;
      a.draw(i, n / 2 + (i.x - t), n / 2 + (i.y - e));
    }
    const h = "__deathRT_" + Date.now();
    a.saveTexture(h);
    const l = s.textures.get(h);
    let u = 2 + Math.round(2 * Math.random()),
      c = 2 + Math.round(2 * Math.random());
    const d = Math.random();
    d > 0.95 ? (u = 1) : d > 0.9 && (c = 1);
    const p = 9.34740324 * 0.8,
      f = 0.5 * p,
      v = 1 * p,
      m = n / u,
      y = n / c,
      x = [],
      _ = [],
      w = [0],
      T = [0];
    let b = 0,
      S = 0;
    for (let g = 0; g < u - 1; g++) {
      const t = Math.round(m * (0.55 + 0.45 * Math.random() * 2));
      x.push(t), (b += t), w.push(b);
    }
    x.push(n - b);
    for (let g = 0; g < c - 1; g++) {
      const t = Math.round(y * (0.55 + 0.45 * Math.random() * 2));
      _.push(t), (S += t), T.push(S);
    }
    _.push(n - S),
      (this._explosionPieces = []),
      (this._explosionContainer = s.add.container(t, e).setDepth(16));
    let E = 0;
    for (let A = 0; A < u; A++) {
      const t = x[A],
        e = w[A];
      for (let i = 0; i < c; i++) {
        const r = _[i],
          a = T[i];
        if (t <= 0 || r <= 0) continue;
        E++;
        const o = "piece_" + A + "_" + i;
        l.add(o, 0, e, a, t, r);
        const u = s.add.image(0, 0, h, o);
        (u.x = e + t / 2 - n / 2),
          (u.y = -(a + r / 2 - n / 2)),
          this._explosionContainer.add(u);
        let c = null;
        if (E % 2 == 0) {
          const t = 200 + 200 * Math.random(),
            e = u;
          (c = s.add.particles(0, 0, "GJ_WebSheet", {
            frame: "square.png",
            speed: 0,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: t,
            frequency: 25,
            quantity: 1,
            emitting: !0,
            blendMode: M,
            tint: g,
            emitCallback: (t) => {
              (t.x = e.x + 3 * (2 * Math.random() - 1) * 2),
                (t.y = e.y + 3 * (2 * Math.random() - 1) * 2);
            },
          })),
            this._explosionContainer.addAt(c, 0);
        }
        const d = {
          spr: u,
          particle: c,
          xVel: f + (2 * Math.random() - 1) * v,
          yVel: -(12 + 6 * (2 * Math.random() - 1)),
          timer: 1.4,
          fadeTime: 0.5,
          rotDelta: (360 * (2 * Math.random() - 1)) / 60,
          halfSize: Math.min(t, r) / 2,
        };
        this._explosionPieces.push(d);
      }
    }
    (this._explosionGroundSY = gameYToScreenY(0) + this._lastCameraY),
      (this._explosionRT = a),
      (this._explosionTexKey = h);
  }
  updateExplosionPieces(t) {
    if (!this._explosionPieces || 0 === this._explosionPieces.length) return;
    const e = t / 1e3,
      i = Math.min(60 * e * 0.9, 2),
      s = 0.5 * i * 2,
      r = this._explosionGroundSY - this._explosionContainer.y;
    let n = 0;
    for (; n < this._explosionPieces.length; ) {
      const t = this._explosionPieces[n];
      if (((t.timer -= e), t.timer > 0)) {
        {
          (t.yVel += s), (t.xVel *= 0.98 + 0.02 * (1 - i));
          let e = t.spr.x + t.xVel * i,
            n = t.spr.y + t.yVel * i;
          const a = r - t.halfSize;
          if (
            (n > a &&
              t.yVel > 0 &&
              ((n = a),
              (t.yVel *= -0.8),
              Math.abs(t.yVel) < 3 && (t.yVel = -3)),
            (t.spr.x = e),
            (t.spr.y = n),
            (t.spr.angle += t.rotDelta * i),
            t.timer < t.fadeTime)
          ) {
            const e = t.timer / t.fadeTime;
            t.spr.setAlpha(e), t.particle && t.particle.setAlpha(e);
          }
        }
        n++;
      } else
        t.particle && (t.particle.stop(), t.particle.destroy()),
          t.spr.destroy(),
          this._explosionPieces.splice(n, 1);
    }
    0 === this._explosionPieces.length && this._cleanupExplosion();
  }
  _cleanupExplosion() {
    if (this._explosionPieces)
      for (const t of this._explosionPieces)
        t.particle && (t.particle.stop(), t.particle.destroy()),
          t.spr && t.spr.destroy();
    this._explosionContainer &&
      (this._explosionContainer.destroy(), (this._explosionContainer = null)),
      this._explosionTexKey &&
        (this._scene.textures.remove(this._explosionTexKey),
        (this._explosionTexKey = null)),
      this._explosionRT &&
        (this._explosionRT.destroy(), (this._explosionRT = null)),
      (this._explosionPieces = null);
  }
  _playPortalShine(t, e = 1) {
    const i = this._scene,
      s = t.x,
      r = gameYToScreenY(t.portalY || t.y),
      n = 1 === e ? "02" : "01",
      a = [`portalshine_${n}_front_001.png`, `portalshine_${n}_back_001.png`],
      o = [this._gameLayer.topContainer, this._gameLayer.container],
      h = t.rot || 0;
    for (let l = 0; l < 2; l++) {
      const t = findTextureFrame(i, a[l]);
      if (!t) continue;
      const e = i.add.image(s, r, t.atlas, t.frame);
      e.setBlendMode(M),
        e.setAlpha(0),
        e.setAngle(h),
        o[l].add(e),
        i.tweens.chain({
          targets: e,
          tweens: [
            { alpha: 1, duration: 50 },
            { alpha: 0, duration: 400 },
          ],
          onComplete: () => e.destroy(),
        });
    }
  }
  _checkSnapJump(t) {
    const e = [
        { dx: 240, dy: 60 },
        { dx: 300, dy: -60 },
        { dx: 180, dy: 120 },
      ],
      i = this._lastLandObject;
    if (i && i !== t && i.type === m) {
      const s = i.x,
        r = i.y,
        n = t.x,
        a = t.y,
        o = this.p.gravityFlipped ? -1 : 1;
      let h = !1;
      for (const t of e)
        if (
          Math.abs(n - (s + t.dx)) <= 2 &&
          Math.abs(a - (r + t.dy * o)) <= 2
        ) {
          h = !0;
          break;
        }
      if (h) {
        const e = t.x + this._lastXOffset,
          i = this._scene._playerWorldX;
        let s;
        (s = Math.abs(e - i) <= 2 ? e : e > i ? i + 2 : i - 2),
          (this._scene._playerWorldX = s);
      }
    }
    (this._lastLandObject = t),
      (this._lastXOffset = this._scene._playerWorldX - t.x);
  }
  _isFallingPastThreshold() {
    return this.p.gravityFlipped
      ? this.p.yVelocity > 0.25
      : this.p.yVelocity < -0.25;
  }
  flipMod() {
    return this.p.gravityFlipped ? -1 : 1;
  }
  runRotateAction() {
    (this.rotateActionActive = !0),
      (this.rotateActionTime = 0),
      (this.rotateActionDuration = 0.39 / p),
      (this.rotateActionStart = this._rotation),
      (this.rotateActionTotal = Math.PI * this.flipMod());
  }
  stopRotation() {
    this.rotateActionActive = !1;
  }
  updateRotateAction(t) {
    if (!this.rotateActionActive) return;
    (this.rotateActionTime += t),
      this.rotateActionTime >= this.rotateActionDuration &&
        (this.rotateActionActive = !1);
    let e = Math.min(this.rotateActionTime / this.rotateActionDuration, 1);
    this._rotation = this.rotateActionStart + this.rotateActionTotal * e;
  }
  convertToClosestRotation() {
    let t = Math.PI / 2;
    return Math.round(this._rotation / t) * t;
  }
  slerp2D(t, e, i) {
    let s = e - t;
    for (; s > Math.PI; ) s -= 2 * Math.PI;
    for (; s < -Math.PI; ) s += 2 * Math.PI;
    return t + s * i;
  }
  updateGroundRotation(t) {
    let e = this.convertToClosestRotation(),
      i = Math.min(1 * t, 0.1575 * 3 * t);
    this._rotation = this.slerp2D(this._rotation, e, i);
  }
  updateShipRotation(t) {
    let e = -(this.p.y - this.p.lastY),
      i = 10.3860036 * t;
    if (i * i + e * e >= 0.6 * t) {
      let s = Math.atan2(e, i),
        r = 0.15,
        n = Math.min(1 * t, r * t);
      this._rotation = this.slerp2D(this._rotation, s, n);
    }
  }
  playerIsFalling() {
    return this.p.gravityFlipped
      ? this.p.yVelocity > 3.832796
      : this.p.yVelocity < 3.832796;
  }
  updateJump(t) {
    const e =
        this._scene.input.manager.hitTest(
          this._scene.input.activePointer,
          this._scene._startPosGui.list,
          this._scene.cameras.main,
        ).length > 0,
      i = this.p.upKeyDown && !this.p.wasUpKeyDown;
    this.p.isFlying
      ? this.p.touchingOrb && i && (this.p.isBuffering = !0)
      : i &&
        !this.p.onGround &&
        (this.p.yVelocity * this.flipMod() < 0 || this.p.touchingOrb) &&
        (this.p.isBuffering = !0),
      this.p.isFlying
        ? this._updateFlyJump(t, e)
        : this.p.mode === j
          ? this._updateBallJump(t, e, i)
        : this.p.upKeyDown && this.p.canJump && !e
          ? (this.p.touchingOrb && (this.p.isBuffering = !0),
            (this.p.isJumping = !0),
            (this.p.onGround = !1),
            (this.p.canJump = !1),
            (this.p.upKeyPressed = !1),
            (this.p.yVelocity = 22.360064 * this.flipMod()),
            this.runRotateAction())
          : this.p.isJumping
            ? ((this.p.yVelocity -= f * t * this.flipMod()),
              this.playerIsFalling() &&
                ((this.p.isJumping = !1),
                (this.p.isPadJumping = !1),
                (this.p.onGround = !1)))
            : (this.playerIsFalling() && (this.p.canJump = !1),
              (this.p.yVelocity -= f * t * this.flipMod()),
              this.p.gravityFlipped
                ? (this.p.yVelocity = Math.min(this.p.yVelocity, 30))
                : (this.p.yVelocity = Math.max(this.p.yVelocity, -30)),
              this._isFallingPastThreshold() &&
                !this.rotateActionActive &&
                this.runRotateAction(),
              this.playerIsFalling() &&
                (this.p.gravityFlipped
                  ? this.p.yVelocity > 4
                  : this.p.yVelocity < -4) &&
                (this.p.onGround = !1)),
      (this.p.wasUpKeyDown = this.p.upKeyDown);
  }
  _updateBallJump(t, e = !1, i = !1) {
    i &&
      this.p.canJump &&
      !e &&
      !this.p.touchingOrb &&
      this._isBallSurfaceAttached() &&
      this._toggleBallGravity();
    this.playerIsFalling() && (this.p.canJump = !1);
    this.p.yVelocity -= U * t * this.flipMod();
    this.p.gravityFlipped
      ? (this.p.yVelocity = Math.min(this.p.yVelocity, 30))
      : (this.p.yVelocity = Math.max(this.p.yVelocity, -30));
    this._isFallingPastThreshold() &&
      !this.rotateActionActive &&
      this.runRotateAction();
    this.playerIsFalling() &&
      (this.p.gravityFlipped ? this.p.yVelocity > 4 : this.p.yVelocity < -4) &&
      (this.p.onGround = !1);
  }
  _updateFlyJump(t, e = 0) {
    let i = 0.8;
    this.p.upKeyDown && !this.p.wasBoosted && !e && (i = -1),
      (this.p.upKeyDown && !e) || this.playerIsFalling() || (i = 1.2);
    let s = 0.4;
    this.p.upKeyDown && !e && this.playerIsFalling() && (s = 0.5),
      (this.p.yVelocity -= f * t * this.flipMod() * i * s),
      this.p.upKeyDown && !e && (this.p.onGround = !1),
      this.p.wasBoosted ||
        (this.p.gravityFlipped
          ? ((this.p.yVelocity = Math.max(this.p.yVelocity, -16)),
            (this.p.yVelocity = Math.min(this.p.yVelocity, 12.8)))
          : ((this.p.yVelocity = Math.max(this.p.yVelocity, -12.8)),
            (this.p.yVelocity = Math.min(this.p.yVelocity, 16))));
  }
  checkCollisions(t) {
    const e = 30,
      i = t + l,
      s = this.p.y,
      r = this.p.lastY,
      n = this.p.isFlying ? 12 : 20;
    (this.p.collideTop = 0),
      (this.p.collideBottom = 0),
      (this.p.onCeiling = !1);
    let a = !1;
    const o = this._gameLayer.getNearbySectionObjects(i);
    s >= 5e3 && this.killPlayer(), (this.p.touchingOrb = !1);
    const overlappingHazard = o.some((l) => {
      if (l.type !== y) return !1;
      const hazardLeft = l.x - l.w / 2,
        hazardRight = l.x + l.w / 2,
        hazardBottom = l.y - l.h / 2,
        hazardTop = l.y + l.h / 2;
      return !(
        i + 30 <= hazardLeft ||
        i - 30 >= hazardRight ||
        s + e <= hazardBottom ||
        s - e >= hazardTop
      );
    });
    if (overlappingHazard && 1 !== window.noclip) return void this.killPlayer();
    for (let l of o) {
      let t = l.x - l.w / 2,
        o = l.x + l.w / 2,
        h = l.y - l.h / 2,
        u = l.y + l.h / 2;
      if (!(i + 30 <= t || i - 30 >= o || s + e <= h || s - e >= u))
        if ((l.type, l.type !== b))
          if (l.type !== S && l.type !== Y) {
            if (
              (l.type === E &&
                (l.activated ||
                  ((l.activated = !0),
                  this._playPortalShine(l, 2),
                  (this.p.gravityFlipped = !0),
                  (this.p.yVelocity = this.p.yVelocity / 2),
                  (this.p.onGround = !1))),
              l.type === A &&
                (l.activated ||
                  ((l.activated = !0),
                  this._playPortalShine(l, 2),
                  (this.p.gravityFlipped = !1),
                  (this.p.yVelocity = this.p.yVelocity / 2),
                  (this.p.onGround = !1))),
              l.type === x)
            ) {
              if (l.activated) return;
              (this.p.y += 1),
                (this.p.yVelocity = 31.5 * this.flipMod()),
                (this.p.isPadJumping = !0),
                (this.p.isJumping = !1),
                (this.p.onGround = !1),
                (this.p.onCeiling = !1),
                (this.p.canJump = !1),
                this.runRotateAction(),
                (l.activated = !0);
            }
            if (l.type === w) {
              if (l.activated) return;
              const t = l.rot,
                e = 180 === Math.abs(t % 360);
              if (!e && this.p.gravityFlipped) return;
              if (e && !this.p.gravityFlipped) return;
              (this.p.yVelocity = 10 * this.flipMod()),
                (this.p.gravityFlipped = !this.p.gravityFlipped),
                (this.p.isPadJumping = !0),
                (this.p.isJumping = !1),
                (this.p.onGround = !1),
                (this.p.canJump = !1),
                this.runRotateAction(),
                (l.activated = !0);
            }
            if (l.type === _) {
              if (l.activated) return;
              (this.p.touchingOrb = !0),
                this.p.isBuffering &&
                  ((this.p.yVelocity = 22.2 * this.flipMod()),
                    (this.p.isPadJumping = !0),
                    (this.p.isBuffering = !1),
                    (this.p.isJumping = !1),
                    (this.p.onGround = !1),
                    (this.p.onCeiling = !1),
                    (this.p.canJump = !1),
                    this.runRotateAction(),
                    (l.activated = !0));
            }
            if (l.type === T) {
              if (l.activated) return;
              (this.p.touchingOrb = !0),
                this.p.isBuffering &&
                  ((this.p.yVelocity = 10 * this.flipMod()),
                    (this.p.gravityFlipped = !this.p.gravityFlipped),
                    (this.p.isPadJumping = !0),
                    (this.p.isBuffering = !1),
                    (this.p.isJumping = !1),
                    (this.p.onGround = !1),
                    (this.p.onCeiling = !1),
                    (this.p.canJump = !1),
                    this.runRotateAction(),
                    (l.activated = !0));
            }
            if (l.type === y) {
              if (1 !== window.noclip) return void this.killPlayer();
              continue;
            }
            if (l.type === m) {
              let c = s - e + n,
                d = r - e + n,
                p = s + e - n,
                f = r + e - n;
              const g = this.flipMod(),
                v = 1 === g ? this.p.yVelocity <= 0 : this.p.yVelocity >= 0,
                m = 1 === g ? this.p.yVelocity > 0 : this.p.yVelocity < 0,
                y = 9,
                x = i + y > t && i - y < o && s + y > h && s - y < u,
                _ =
                  (v || this.p.onGround) &&
                  (1 === g ? c >= u || d >= u : p <= h || f <= h);
              if (x && !_) {
                if (1 !== window.noclip) return void this.killPlayer();
                continue;
              }
              if (i + 30 - 5 > t && i - 30 + 5 < o) {
                if (_) {
                  (this.p.y = 1 === g ? u + e : h - e),
                    this.hitGround(),
                    (a = !0),
                    1 === g
                      ? (this.p.collideBottom = u)
                      : (this.p.collideTop = h),
                    this.p.isFlying || this._checkSnapJump(l);
                  continue;
                }
                if (
                  (m || this.p.onGround) &&
                  (1 === g ? p <= h || f <= h : c >= u || d >= u) &&
                  this.p.isFlying
                ) {
                  (this.p.y = 1 === g ? h - e : u + e),
                    this.hitGround(),
                    1 === g
                      ? ((this.p.onCeiling = !0), (this.p.collideTop = h))
                      : ((this.p.onGround = !0), (this.p.collideBottom = u));
                  continue;
                }
              }
            }
          } else
            l.activated ||
              ((l.activated = !0),
              this._playPortalShine(l, 1),
              l.type === Y ? this.enterBallMode() : this.enterCubeMode());
        else
          l.activated ||
            ((l.activated = !0),
            this._playPortalShine(l, 1),
            this.enterShipMode(l));
    }
    if (
      0 !== this.p.collideTop &&
      0 !== this.p.collideBottom &&
      Math.abs(this.p.collideTop - this.p.collideBottom) < 48
    )
      if (1 !== window.noclip) return void this.killPlayer();
    let h = this._gameLayer.getFloorY();
    a || (this.p.y <= h + 30 && ((this.p.y = h + 30), this.hitGround()));
    let u = this._gameLayer.getCeilingY();
    if (
      (null !== u &&
        (this.p.isFlying || this.p.mode === j) &&
        this.p.y >= u - 30 &&
        ((this.p.y = u - 30),
        this.hitGround(),
        (this.p.onCeiling = !0),
        this.p.mode === j && ((this.p.onGround = !0), (this.p.canJump = !0))),
      this.p.isFlying)
    ) {
      const t = this.p.y <= h + 30,
        e = null !== u && this.p.y >= u - 30;
      a || t || 0 !== this.p.collideTop || e || (this.p.onGround = !1);
    }
    this.p.mode === j &&
      (this.p.onGround =
        this.p.onGround ||
        this.p.y <= h + 30 ||
        (null !== u && this.p.y >= u - 30) ||
        0 !== this.p.collideTop ||
        0 !== this.p.collideBottom,
      this.p.onCeiling = null !== u && this.p.y >= u - 30,
      this.p.onGround || (this.p.canJump = !1));
  }
  drawHitboxes(t, e, i) {
    if ((t.clear(), !this._showHitboxes)) return;
    const s = e + l,
      r = this.p.y;
    this.p.isFlying;
    const n = this._gameLayer.getNearbySectionObjects(s);
    for (let h of n) {
      let s = h.x - e,
        r = gameYToScreenY(h.y) + i,
        n = 65280;
      h.type === y
        ? (n = 16729156)
        : (h.type !== b && h.type !== S) || (n = 4491519),
        t.lineStyle(2, n, 0.7),
        t.strokeRect(s - h.w / 2, r - h.h / 2, h.w, h.h);
    }
    const a = l,
      o = gameYToScreenY(r) + i;
    t.lineStyle(2, 16776960, 0.8),
      t.strokeRect(a - 30 + 5, o - 30, 50, 60),
      t.lineStyle(2, 16711680, 0.8),
      t.strokeRect(a - 30, o - 30 + 5, 60, 50);
  }
  playEndAnimation(t, e, i) {
    this._endAnimating = !0;
    const s = this._scene,
      r = this.flipMod(),
      n = i || 240,
      a = s._playerWorldX,
      o = this.p.y,
      h = t + 100,
      l = n - 40 * r,
      u = a,
      c = o,
      d = a + 80,
      p = n + 300 * r,
      f = [
        this._playerSpriteLayer,
        this._playerGlowLayer,
        this._playerOverlayLayer,
        this._playerExtraLayer,
        this._shipSpriteLayer,
        this._shipGlowLayer,
        this._shipOverlayLayer,
        this._shipExtraLayer,
      ]
        .filter((t) => t && t.sprite.visible)
        .map((t) => t.sprite);
    (this._startPercent = (s._playerWorldX / s._level.endXPos) * 100),
      this._particleEmitter.stop(),
      this._flyParticleEmitter.stop(),
      this._flyParticle2Emitter.stop(),
      this._shipDragEmitter.stop();
    const g = this.p.isFlying,
      v = [
        this._shipSpriteLayer,
        this._shipGlowLayer,
        this._shipOverlayLayer,
        this._shipExtraLayer,
      ],
      m = [
        this._playerSpriteLayer,
        this._playerGlowLayer,
        this._playerOverlayLayer,
        this._playerExtraLayer,
      ],
      y = f.map((t) => {
        let e = 0;
        if (g) {
          const i = v.some((e) => e && e.sprite === t),
            s = m.some((e) => e && e.sprite === t);
          i ? (e = 10 * r) : s && (e = -10 * r);
        }
        return { spr: t, localY: e };
      }),
      x = this._streak,
      _ = { val: 0 };
    s.tweens.add({
      targets: _,
      val: 1,
      duration: 1e3,
      ease: (t) => Math.pow(t, 1.2),
      onUpdate: () => {
        const t = _.val,
          e =
            (1 - t) ** 3 * u +
            3 * (1 - t) ** 2 * t * u +
            3 * (1 - t) * t ** 2 * d +
            t ** 3 * h,
          i =
            (1 - t) ** 3 * c +
            3 * (1 - t) ** 2 * t * c +
            3 * (1 - t) * t ** 2 * p +
            t ** 3 * l,
          n = e - s._cameraX,
          a = gameYToScreenY(i) + s._cameraY,
          o = 1 - t * t,
          f = y[0].spr.rotation,
          v = Math.cos(f),
          w = Math.sin(f);
        s._interpolatedPercent =
          this._startPercent + (100 - this._startPercent) * t;
        for (const s of y) {
          const t = -s.localY * w,
            e = s.localY * v;
          s.spr.setPosition(n + t, a + e), s.spr.setAlpha(o);
          let i = 1;
          m.some((t) => t && t.sprite === s.spr) && g && (i = 0.55),
            s.spr.setScale(i, i * r);
        }
        x.setPosition(e, gameYToScreenY(i)), x.update(s.game.loop.delta / 1e3);
      },
      onComplete: () => {
        s._interpolatedPercent = 100;
        for (const t of y) t.spr.setVisible(!1);
        x.stop(), x.reset(), e();
      },
    });
    for (const w of f)
      s.tweens.add({
        targets: w,
        angle: w.angle + 360,
        duration: 1e3,
        ease: (t) => Math.pow(t, 1.5),
      });
  }
  reset() {
    this._cleanupExplosion(),
      (this._endAnimating = !1),
      (this._lastLandObject = null),
      (this._lastXOffset = 0),
      this.stopRotation(),
      (this.rotateActionTime = 0),
      (this._rotation = 0),
      (this._lastCameraX = 0),
      (this._lastCameraY = 0),
      this.enterCubeMode();
    for (const t of this._allLayers) t && t.sprite.setAlpha(1);
    for (const t of this._playerLayers) t && t.sprite.setScale(1);
    this._particleEmitter.stop(),
      (this._particleActive = !1),
      this._flyParticleEmitter.stop(),
      (this._flyParticleActive = !1),
      this._flyParticle2Emitter.stop(),
      (this._flyParticle2Active = !1),
      this._shipDragEmitter.stop(),
      (this._shipDragActive = !1),
      this._streak.stop(),
      this._streak.reset();
  }
}
