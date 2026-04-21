// Reverse-engineered source mirror extracted from the runtime bundle.
// LevelRuntime owns parsed objects, section culling, trigger evaluation, ground animation,
// enter effects, and end-portal placement.
class LevelRuntime {
  constructor(t, e) {
    (this._scene = t),
      (this._cameraXRef = e),
      (this.additiveContainer = t.add.container(0, 0).setDepth(-1)),
      (this.container = t.add.container(0, 0)),
      (this.topContainer = t.add.container(0, 0).setDepth(13)),
      (this.objects = []),
      (this.endXPos = 0),
      (this._groundY = 0),
      (this._ceilingY = null),
      (this._flyGroundActive = !1),
      (this._groundAnimFrom = 0),
      (this._groundAnimTo = 0),
      (this._groundAnimTime = 0),
      (this._groundAnimDuration = 0),
      (this._groundAnimating = !1),
      (this._groundTargetValue = 0),
      (this._flyFloorY = 0),
      (this._flyCeilingY = 0),
      (this._surfaceCeilingVisible = !1),
      (this.flyCameraTarget = null),
      (this._colorTriggers = []),
      (this._colorTriggerIdx = 0),
      (this._audioScaleSprites = []),
      (this._audioScaleSprites2 = []),
      (this._enterEffectTriggers = []),
      (this._enterEffectTriggerIdx = 0),
      (this._activeEnterEffect = 0),
      (this._activeExitEffect = 0),
      (this._sections = []),
      (this._sectionContainers = []),
      (this._collisionSections = []),
      (this._nearbyBuffer = []),
      (this._visMinSec = -1),
      (this._visMaxSec = -1),
      (this._groundStartScreenY = gameYToScreenY(0)),
      (this._ceilingStartScreenY = 0),
      (this._activeStartPosIndex = -1),
      (this._startPositions = []),
      this._buildGround();
  }
  getStartPositions() {
    return this._startPositions.slice().sort((t, e) => t.x - e.x);
  }
  fastForwardTriggers(t, e) {
    const i = this._colorTriggers.sort((t, e) => t.x - e.x);
    for (let s of i) {
      if (!(s.x <= t)) break;
      e.triggerColor(s.index, s.color, 0);
    }
  }
  loadLevel(t) {
    let { objects: e } = decodeLevelData(t);
    this._spawnLevelObjects(e);
  }
  _buildGround() {
    const t = this._scene,
      e = t.textures.getFrame("GJ_WebSheet", "groundSquare_01_001.png");
    (this._tileW = e ? e.width : 1012),
      (this._groundTiles = []),
      (this._ceilingTiles = []);
    let i = Math.ceil(n / this._tileW) + 2,
      s = gameYToScreenY(0);
    const r = -l;
    for (let n = 0; n < i; n++) {
      let e = r + n * this._tileW,
        i = t.add.image(0, s, "GJ_WebSheet", "groundSquare_01_001.png");
      i.setOrigin(0, 0),
        i.setTint(17578),
        i.setDepth(20),
        (i._worldX = e),
        this._groundTiles.push(i);
      let a = t.add.image(0, s, "GJ_WebSheet", "groundSquare_01_001.png");
      a.setOrigin(0, 1),
        a.setFlipY(!0),
        a.setTint(17578),
        a.setDepth(20),
        a.setVisible(!1),
        (a._worldX = e),
        this._ceilingTiles.push(a);
    }
    this._maxGroundWorldX = r + (i - 1) * this._tileW;
    const a = t.textures.getFrame("GJ_WebSheet", "floorLine_01_001.png"),
      o = a ? a.width : 888,
      h = n / o;
    (this._groundLine = t.add
      .image(n / 2, s - 1, "GJ_WebSheet", "floorLine_01_001.png")
      .setOrigin(0.5, 0)
      .setScale(h, 1)
      .setBlendMode(M)
      .setDepth(21)
      .setScrollFactor(0)),
      (this._ceilingLine = t.add
        .image(n / 2, s + 1, "GJ_WebSheet", "floorLine_01_001.png")
        .setOrigin(0.5, 1)
        .setScale(h, 1)
        .setFlipY(!0)
        .setBlendMode(M)
        .setDepth(21)
        .setScrollFactor(0)
        .setVisible(!1));
    const u = 100 / 255;
    (this._groundShadowL = t.add
      .image(-1, s, "GJ_WebSheet", "groundSquareShadow_001.png")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(22)
      .setAlpha(u)
      .setScale(0.7, 1)
      .setBlendMode(P)),
      (this._groundShadowR = t.add
        .image(n + 1, s, "GJ_WebSheet", "groundSquareShadow_001.png")
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(22)
        .setAlpha(u)
        .setScale(0.7, 1)
        .setFlipX(!0)
        .setBlendMode(P)),
      (this._ceilingShadowL = t.add
        .image(-1, s, "GJ_WebSheet", "groundSquareShadow_001.png")
        .setOrigin(0, 1)
        .setScrollFactor(0)
        .setDepth(22)
        .setAlpha(u)
        .setScale(0.7, 1)
        .setFlipY(!0)
        .setBlendMode(P)
        .setVisible(!1)),
      (this._ceilingShadowR = t.add
        .image(n + 1, s, "GJ_WebSheet", "groundSquareShadow_001.png")
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(22)
        .setAlpha(u)
        .setScale(0.7, 1)
        .setFlipX(!0)
        .setFlipY(!0)
        .setBlendMode(P)
        .setVisible(!1));
  }
  resizeScreen() {
    var t, e;
    const i = this._scene,
      s = this._tileW,
      r = Math.ceil(n / s) + 2,
      a = gameYToScreenY(0);
    for (; this._groundTiles.length < r; ) {
      const r = this._maxGroundWorldX + s;
      let n = i.add.image(0, a, "GJ_WebSheet", "groundSquare_01_001.png");
      n
        .setOrigin(0, 0)
        .setTint(
          (null == (t = this._groundTiles[0]) ? void 0 : t.tintTopLeft) ||
            17578,
        )
        .setDepth(20),
        (n._worldX = r),
        this._groundTiles.push(n);
      let o = i.add.image(0, a, "GJ_WebSheet", "groundSquare_01_001.png");
      o
        .setOrigin(0, 1)
        .setFlipY(!0)
        .setTint(
          (null == (e = this._groundTiles[0]) ? void 0 : e.tintTopLeft) ||
            17578,
        )
        .setDepth(20)
        .setVisible(!1),
        (o._worldX = r),
        this._ceilingTiles.push(o),
        (this._maxGroundWorldX = r);
    }
    const o = this._scene.textures.getFrame(
        "GJ_WebSheet",
        "floorLine_01_001.png",
      ),
      h = n / (o ? o.width : 888);
    (this._groundLine.x = n / 2),
      this._groundLine.setScale(h, 1),
      (this._ceilingLine.x = n / 2),
      this._ceilingLine.setScale(h, 1),
      (this._groundShadowR.x = n + 1),
      (this._ceilingShadowR.x = n + 1);
  }
  updateGroundTiles(t = 0) {
    const e = this._cameraXRef.value,
      i = this._tileW;
    let s,
      r,
      n = this._maxGroundWorldX || -1 / 0;
    const showFlyBounds = this._flyGroundActive && this._groundTargetValue > 0.001;
    if (showFlyBounds) {
      let e = this._groundTargetValue,
        i = 620,
        n = 20;
      (s = this._groundStartScreenY + (i - this._groundStartScreenY) * e),
        (r = this._ceilingStartScreenY + (n - this._ceilingStartScreenY) * e);
      let a = gameYToScreenY(0) + t;
      s > a && (s = a);
    } else (s = gameYToScreenY(0) + t), (r = this._surfaceCeilingVisible ? 20 : 0);
    for (let o = 0; o < this._groundTiles.length; o++) {
      let t = this._groundTiles[o],
        a = this._ceilingTiles[o];
      t._worldX + i <= e &&
        ((t._worldX = n + i),
        (a._worldX = t._worldX),
        (n = t._worldX),
        (this._maxGroundWorldX = n));
      let h = t._worldX - e;
      (t.x = h),
        (t.y = s),
        (a.x = h),
        (a.y = r),
        a.setVisible(showFlyBounds || this._surfaceCeilingVisible);
    }
    (this._groundLine.y = s),
      showFlyBounds || this._surfaceCeilingVisible
        ? ((this._ceilingLine.y = r), this._ceilingLine.setVisible(!0))
        : this._ceilingLine.setVisible(!1),
      (this._groundShadowL.y = s),
      (this._groundShadowR.y = s);
    let a = showFlyBounds || this._surfaceCeilingVisible;
    (this._ceilingShadowL.y = r),
      (this._ceilingShadowR.y = r),
      this._ceilingShadowL.setVisible(a),
      this._ceilingShadowR.setVisible(a);
  }
  shiftGroundTiles(t) {
    for (let e = 0; e < this._groundTiles.length; e++)
      (this._groundTiles[e]._worldX += t), (this._ceilingTiles[e]._worldX += t);
    this._maxGroundWorldX += t;
  }
  resetGroundTiles(t) {
    const e = this._tileW;
    for (let i = 0; i < this._groundTiles.length; i++)
      (this._groundTiles[i]._worldX = t + i * e),
        (this._ceilingTiles[i]._worldX = t + i * e);
    (this._maxGroundWorldX = t + (this._groundTiles.length - 1) * e),
      this.resetGroundState();
  }
  resetGroundState() {
    (this._flyGroundActive = !1),
      (this._surfaceCeilingVisible = !1),
      (this._groundTargetValue = 0),
      (this._groundAnimating = !1),
      (this._groundY = 0),
      (this._ceilingY = null),
      (this.flyCameraTarget = null);
  }
  _computeFlyBounds(t) {
    let e = t - 300;
    return (
      (e = Math.floor(e / o) * o),
      (e = Math.max(0, e)),
      { floorY: e, ceilingY: e + 600 }
    );
  }
  setFlyMode(t, e) {
    if (t) {
      let t = this._computeFlyBounds(e);
      (this._flyFloorY = t.floorY),
        (this._flyCeilingY = t.ceilingY),
        (this._flyGroundActive = !0);
      let i = this._flyFloorY + 300;
      (this.flyCameraTarget = i - 320 + h),
        this.flyCameraTarget < 0 && (this.flyCameraTarget = 0);
      let s = (this._scene && this._scene._cameraY) || 0;
      (this._groundStartScreenY = gameYToScreenY(0) + s),
        (this._ceilingStartScreenY = 0),
        (this._groundAnimFrom = this._groundTargetValue),
        (this._groundAnimTo = 1),
        (this._groundAnimTime = 0),
        (this._groundAnimDuration = 0.5),
        (this._groundAnimating = !0);
    } else
      (this.flyCameraTarget = null),
        (this._groundAnimFrom = this._groundTargetValue),
        (this._groundAnimTo = 0),
        (this._groundAnimTime = 0),
        (this._groundAnimDuration = 0.5),
        (this._groundAnimating = !0);
  }
  stepGroundAnimation(t) {
    if (!this._groundAnimating) return;
    this._groundAnimTime += t;
    let e =
      this._groundAnimDuration > 0
        ? Math.min(this._groundAnimTime / this._groundAnimDuration, 1)
        : 1;
    (this._groundTargetValue =
      this._groundAnimFrom + (this._groundAnimTo - this._groundAnimFrom) * e),
      e >= 1 &&
        ((this._groundAnimating = !1),
        (this._groundTargetValue = this._groundAnimTo),
        0 === this._groundAnimTo && (this._flyGroundActive = !1));
  }
  getFloorY() {
    return this._flyGroundActive ? this._flyFloorY : 0;
  }
  getCeilingY() {
    return this._flyGroundActive ? this._flyCeilingY : this._surfaceCeilingVisible ? 600 : null;
  }
  setSurfaceCeilingVisible(visible) {
    this._surfaceCeilingVisible = !!visible;
  }
  _applyVisualProps(t, e, i, s, r = null) {
    if (!e) return;
    let { dx: n, dy: a } = (function (t, e) {
      let i = findTextureFrame(t, e);
      if (!i) return { dx: 0, dy: 0 };
      let s = t.textures.get(i.atlas).get(i.frame);
      if (!s) return { dx: 0, dy: 0 };
      let r = s.customData || {};
      if (r.gjSpriteOffset)
        return {
          dx: r.gjSpriteOffset.x || 0,
          dy: -(r.gjSpriteOffset.y || 0),
        };
      let n = s.realWidth,
        a = s.realHeight,
        o = s.width,
        h = s.height,
        l = 0,
        u = 0;
      return (
        r.spriteSourceSize &&
          ((l = r.spriteSourceSize.x || 0), (u = r.spriteSourceSize.y || 0)),
        { dx: n / 2 - (l + o / 2), dy: a / 2 - (u + h / 2) }
      );
    })(t, i);
    s.flipX && e.setFlipX(!0), s.flipY && e.setFlipY(!0);
    let o = (e.getData("gjBaseRotationDeg") || 0) + s.rot;
    0 !== o && e.setAngle(o),
      1 !== s.scale && e.setScale(s.scale),
      r && (void 0 !== r.tint ? e.setTint(r.tint) : r.black && e.setTint(0));
  }
  _addVisualSprite(t, e = null) {
    t &&
      (e && "additive" === e.blend
        ? (t.setBlendMode(M), (t._eeLayer = 0))
        : e && e._portalFront
          ? (t._eeLayer = 2)
          : e && void 0 !== e.PlayerState && e.PlayerState < 0
            ? (t._eeLayer = 0)
            : (t._eeLayer = 1));
  }
  _getGlowFrameName(t) {
    return t && t.endsWith("_001.png")
      ? t.replace("_001.png", "_glow_001.png")
      : null;
  }
  _addGlowSprite(t, e, i, s, r, n) {
    let a = this._getGlowFrameName(s);
    if (!a) return;
    if (!findTextureFrame(t, a) && !t.textures.exists(a)) return;
    let o = createTextureImage(t, e, i, a);
    o &&
      (this._applyVisualProps(t, o, a, r),
      o.setBlendMode(M),
      (o._eeLayer = 0),
      void 0 !== n &&
        ((o._eeWorldX = n), (o._eeBaseY = i), this._addToSection(o)));
  }
  _spawnLevelObjects(t) {
    const e = this._scene;
    let i = new Set();
    this._lastObjectX = 0;
    for (let r of t) {
      let t = ys(r.id);
      if (t && t.type === N) {
        if (29 === r.id || 30 === r.id || 899 === r.id) {
          let t;
          (t =
            29 === r.id
              ? 1e3
              : 30 === r.id
                ? 1001
                : parseInt(r._raw[23] ?? 1, 10)),
            this._colorTriggers.push({
              x: 2 * r.x,
              index: t,
              color: {
                r: parseInt(r._raw[7] ?? 255, 10),
                g: parseInt(r._raw[8] ?? 255, 10),
                b: parseInt(r._raw[9] ?? 255, 10),
              },
              duration: parseFloat(r._raw[10] ?? 0),
              tintGround: "1" === r._raw[14],
            });
        }
        t.enterEffect &&
          this._enterEffectTriggers.push({
            x: 2 * r.x,
            effect: t.enterEffect,
          });
        continue;
      }
      if (t && t.type === X) {
        this._startPositions.push({
          x: 2 * r.x,
          y: 2 * r.y,
          mode: decodeStartPositionMode(r.gameMode),
          isFlying: 1 === r.gameMode,
          gravityFlipped: r.flipGravity,
        });
      }
      let n = 2 * r.x,
        a = 2 * r.y;
      n > this._lastObjectX && (this._lastObjectX = n);
      let h = t ? t.frame : null;
      if (
        (t &&
          t.randomFrames &&
          (h =
            t.randomFrames[Math.floor(Math.random() * t.randomFrames.length)]),
        h)
      ) {
        let i = n,
          s = gameYToScreenY(a);
        const o = (t.type === F || t.type === G) && h.includes("_front_"),
          l = t.type === k || t.type === B;
        if (o) {
          const t = h.replace("_front_", "_back_");
          let a = createTextureImage(e, i, s, t);
          a &&
            (this._applyVisualProps(e, a, t, r),
            (a._eeLayer = 1),
            (a._eeWorldX = n),
            (a._eeBaseY = s),
            this._addToSection(a));
        }
        t.glow && this._addGlowSprite(e, i, s, h, r, n);
        const u = o ? { ...t, _portalFront: !0 } : t;
        let c = createTextureImage(e, i, s, h);
        if (
          (c &&
            (this._applyVisualProps(e, c, h, r, t),
            this._addVisualSprite(c, u),
            (c._eeWorldX = n),
            (c._eeBaseY = s),
            this._addToSection(c)),
          t && (t.type === R || t.type === L))
        ) {
          let t = h.replace("_001.png", "_2_001.png"),
            a = findTextureFrame(e, t) ? createTextureImage(e, i, s, t) : null;
          a &&
            (this._applyVisualProps(e, a, t, r),
            this._addVisualSprite(a),
            (a._eeWorldX = n),
            (a._eeBaseY = s),
            this._addToSection(a));
        }
        if (
          (l && ((c._eeAudioScale = !0), this._audioScaleSprites2.push(c)),
          t.children)
        )
          for (let a of t.children) {
            let t = a.dx || 0,
              o = a.dy || 0;
            if (void 0 !== a.localDx || void 0 !== a.localDy) {
              let e = a.localDx || 0,
                i = a.localDy || 0;
              r.flipX && (e = -e), r.flipY && (i = -i);
              let s = ((r.rot || 0) * Math.PI) / 180;
              (t = e * Math.cos(s) - i * Math.sin(s)),
                (o = e * Math.sin(s) + i * Math.cos(s));
            }
            let h = createTextureImage(e, i + t, s + o, a.frame);
            h &&
              (this._applyVisualProps(e, h, a.frame, r, a),
              a.audioScale &&
                (h.setScale(0.1),
                h.setAlpha(0.9),
                (h._eeAudioScale = !0),
                this._audioScaleSprites.push(h)),
              (void 0 !== a.PlayerState ? a.PlayerState : -1) < 0
                ? ((h._eeLayer = 1), (h._eeBehindParent = !0))
                : this._addVisualSprite(h, a),
              (h._eeWorldX = n + t),
              (h._eeBaseY = s + o),
              this._addToSection(h));
          }
      } else t || i.add(r.id);
      if (t && t.portalParticle && h) {
        let i = n,
          o = gameYToScreenY(a);
        const h = 2,
          l = (parseInt(r.rot || 0) * Math.PI) / 180;
        let u = -5 * h,
          c = 0,
          d = i + (u * Math.cos(l) - c * Math.sin(l)),
          p = o + (u * Math.sin(l) + c * Math.cos(l));
        const f = {
            getRandomPoint: (t) => {
              let e = ((190 * Math.random() + 85) * Math.PI) / 180 + l,
                i = 20 * h + 40 * Math.random() * h;
              return (t.x = Math.cos(e) * i), (t.y = Math.sin(e) * i), t;
            },
          },
          g = 20;
        let v = e.add.particles(d, p, "GJ_WebSheet", {
          frame: "square.png",
          lifespan: { min: 200, max: 1e3 },
          speed: 0,
          scale: { start: 0.75, end: 0.125 },
          alpha: { start: 0.5, end: 0 },
          tint: t.portalParticleColor,
          blendMode: s.BlendModes.ADD,
          frequency: 20,
          maxParticles: 0,
          emitting: !0,
          emitZone: { type: "random", source: f },
          emitCallback: (t) => {
            let e = -t.x,
              i = -t.y,
              s = Math.sqrt(e * e + i * i) || 1,
              r = t.life / 1e3,
              n = (s - g) / (r || 0.3);
            (t.velocityX = (e / s) * n), (t.velocityY = (i / s) * n);
          },
        });
        v.setDepth(14),
          (v._eeLayer = 2),
          (v._eeWorldX = n),
          (v._eeBaseY = p),
          this._addToSection(v);
      }
      if (t) {
        let e = parseInt(r.rot || 0);
        if (t.type === R && t.gridW > 0 && t.gridH > 0) {
          let e = t.gridW * o,
            i = t.gridH * o,
            s = new LevelHitbox(m, n, a, e, i);
          this.objects.push(s), this._addCollisionToSection(s);
        } else if (t.type === L) {
          let e = 0,
            i = 0;
          if (
            (t.spriteW > 0 &&
            t.spriteH > 0 &&
            void 0 !== t.hitboxScaleX &&
            void 0 !== t.hitboxScaleY
              ? ((e = t.spriteW * t.hitboxScaleX * 2),
                (i = t.spriteH * t.hitboxScaleY * 2))
              : t.gridW > 0 &&
                t.gridH > 0 &&
                ((e = 12 * t.gridW), (i = 24 * t.gridH)),
            e > 0 && i > 0)
          ) {
            let t = new LevelHitbox(y, n, a, e, i);
            this.objects.push(t), this._addCollisionToSection(t);
          }
        } else if (t.type === F) {
          let i = 90,
            s = t.gridH * o,
            r = null;
          if (90 === e || 270 === e || -90 === e || -270 === e) {
            let t = i;
            (i = s), (s = t);
          }
          if (
            ("fly" === t.sub
              ? (r = b)
              : "cube" === t.sub
                ? (r = S)
                : "ball" === t.sub
                  ? (r = Y)
                : "flip" === t.sub
                  ? (r = E)
                  : "normal" === t.sub && (r = A),
            r)
          ) {
            let t = new LevelHitbox(r, n, a, i, s);
            (t.portalY = a),
              (t.rot = e),
              this.objects.push(t),
              this._addCollisionToSection(t);
          }
        } else if (t.type === D && t.gridW > 0 && t.gridH > 0) {
          let e = t.gridW * o,
            i = t.gridH * o,
            s = new LevelHitbox(x, n, a, e, i);
          this.objects.push(s), this._addCollisionToSection(s);
        } else if (t.type === k && t.gridW > 0 && t.gridH > 0) {
          let e = t.gridW * o,
            i = t.gridH * o,
            s = new LevelHitbox(_, n, a, e, i);
          this.objects.push(s), this._addCollisionToSection(s);
        } else if (t.type === I && t.gridW > 0 && t.gridH > 0) {
          let i = t.gridW * o,
            s = t.gridH * o,
            r = new LevelHitbox(w, n, a, i, s);
          (r.rot = e), this.objects.push(r), this._addCollisionToSection(r);
        } else if (t.type === B && t.gridW > 0 && t.gridH > 0) {
          let e = t.gridW * o,
            i = t.gridH * o,
            s = new LevelHitbox(T, n, a, e, i);
          this.objects.push(s), this._addCollisionToSection(s);
        }
      }
    }
    i.size,
      this._colorTriggers.sort((t, e) => t.x - e.x),
      this._enterEffectTriggers.sort((t, e) => t.x - e.x),
      (this.endXPos = Math.max(n + 1200, this._lastObjectX + 680));
  }
  createEndPortal(t) {
    var e;
    if (this.endXPos <= 0) return;
    const i = this.endXPos,
      r = gameYToScreenY(240),
      n = Math.round(16);
    this._endPortalContainer = t.add.container(i, r);
    for (let s = 0; s < n; s++) {
      const e = t.add
        .image(
          0,
          (s - Math.floor(n / 2)) * o,
          "GJ_WebSheet",
          "square_02_001.png",
        )
        .setAngle(-90);
      this._endPortalContainer.add(e);
    }
    this.container.add(this._endPortalContainer),
      (this._endPortalShine = t.add.image(
        i - 58,
        r,
        "GJ_WebSheet",
        "gradientBar.png",
      ));
    const a =
      (null == (e = t.textures.getFrame("GJ_WebSheet", "gradientBar.png"))
        ? void 0
        : e.height) || 64;
    this._endPortalShine.setBlendMode(M),
      this._endPortalShine.setTint(g),
      this._endPortalShine.setScale(1, 960 / a),
      this.additiveContainer.add(this._endPortalShine);
    const h = i - 30,
      l = {
        getRandomPoint: (t) => {
          const e = ((85 + 190 * Math.random()) * Math.PI) / 180,
            i = 320 + 80 * (2 * Math.random() - 1);
          return (t.x = Math.cos(e) * i), (t.y = Math.sin(e) * i), t;
        },
      };
    (this._endPortalEmitter = t.add.particles(h, r, "GJ_WebSheet", {
      frame: "square.png",
      lifespan: { min: 200, max: 1e3 },
      speed: 0,
      scale: { start: 0.75, end: 0.125 },
      alpha: { start: 1, end: 0 },
      tint: g,
      blendMode: s.BlendModes.ADD,
      frequency: 10,
      maxParticles: 100,
      emitting: !0,
      emitZone: { type: "random", source: l },
      emitCallback: (t) => {
        const e = -t.x,
          i = -t.y,
          s = Math.sqrt(e * e + i * i) || 1,
          r = (s - 20) / (t.life / 1e3 || 0.3);
        (t.velocityX = (e / s) * r), (t.velocityY = (i / s) * r);
      },
    })),
      this._endPortalEmitter.setDepth(14),
      this.topContainer.add(this._endPortalEmitter),
      (this._endPortalGameY = 240);
  }
  updateEndPortalY(t, e) {
    if (!this._endPortalContainer) return;
    const i = 140 + t;
    let s;
    s = e ? i : Math.max(240, i);
    const r = gameYToScreenY(s);
    (this._endPortalContainer.y = r),
      (this._endPortalShine.y = r),
      (this._endPortalEmitter.y = r),
      (this._endPortalGameY = s);
  }
  checkColorTriggers(t) {
    let e = [];
    for (; this._colorTriggerIdx < this._colorTriggers.length; ) {
      let i = this._colorTriggers[this._colorTriggerIdx];
      if (!(i.x <= t)) break;
      e.push(i), this._colorTriggerIdx++;
    }
    return e;
  }
  resetColorTriggers() {
    this._colorTriggerIdx = 0;
  }
  _addToSection(t) {
    const e = Math.max(0, Math.floor(t._eeWorldX / 400));
    this._sections[e] || (this._sections[e] = []), this._sections[e].push(t);
    const i = void 0 !== t._eeLayer ? t._eeLayer : 1;
    if (2 === i) return void this.topContainer.add(t);
    if (!this._sectionContainers[e]) {
      const t = {
        additive: this._scene.add.container(0, 0),
        normal: this._scene.add.container(0, 0),
      };
      this.additiveContainer.add(t.additive),
        this.container.add(t.normal),
        (this._sectionContainers[e] = t);
    }
    const s = this._sectionContainers[e];
    0 === i
      ? s.additive.add(t)
      : t._eeBehindParent
        ? s.normal.addAt(t, 0)
        : s.normal.add(t);
  }
  _addCollisionToSection(t) {
    const e = Math.max(0, Math.floor(t.x / 400));
    this._collisionSections[e] || (this._collisionSections[e] = []),
      this._collisionSections[e].push(t);
  }
  _setSectionVisible(t, e) {
    const i = this._sectionContainers[t];
    i && ((i.additive.visible = e), (i.normal.visible = e));
  }
  updateVisibility(t) {
    const e = this._sectionContainers.length - 1;
    if (e < 0) return;
    const i = Math.max(0, Math.floor((t - 140) / 400)),
      s = Math.min(e, Math.floor((t + n + 140) / 400)),
      r = this._visMinSec,
      a = this._visMaxSec;
    if (r < 0) {
      for (let t = 0; t <= e; t++) this._setSectionVisible(t, t >= i && t <= s);
      return (this._visMinSec = i), void (this._visMaxSec = s);
    }
    if (i !== r || s !== a) {
      if (i > r)
        for (let t = r; t <= Math.min(i - 1, a); t++)
          this._setSectionVisible(t, !1);
      if (s < a)
        for (let t = Math.max(s + 1, r); t <= a; t++)
          this._setSectionVisible(t, !1);
      if (i < r)
        for (let t = i; t <= Math.min(r - 1, s); t++)
          this._setSectionVisible(t, !0);
      if (s > a)
        for (let t = Math.max(a + 1, i); t <= s; t++)
          this._setSectionVisible(t, !0);
      (this._visMinSec = i), (this._visMaxSec = s);
    }
  }
  getNearbySectionObjects(t) {
    const e = Math.max(0, Math.floor(t / 400)),
      i = Math.max(0, e - 1),
      s = Math.min(this._collisionSections.length - 1, e + 1),
      r = this._nearbyBuffer;
    r.length = 0;
    for (let n = i; n <= s; n++) {
      const t = this._collisionSections[n];
      if (t) for (let e = 0; e < t.length; e++) r.push(t[e]);
    }
    return r;
  }
  checkEnterEffectTriggers(t) {
    for (; this._enterEffectTriggerIdx < this._enterEffectTriggers.length; ) {
      let e = this._enterEffectTriggers[this._enterEffectTriggerIdx];
      if (!(e.x <= t)) break;
      (this._activeEnterEffect = e.effect),
        (this._activeExitEffect = e.effect),
        this._enterEffectTriggerIdx++;
    }
  }
  resetEnterEffectTriggers() {
    (this._enterEffectTriggerIdx = 0),
      (this._activeEnterEffect = 0),
      (this._activeExitEffect = 0);
    for (let t = 0; t < this._sections.length; t++) {
      this._setSectionVisible(t, !0);
      const e = this._sections[t];
      if (e)
        for (let t = 0; t < e.length; t++) {
          const i = e[t];
          (i._eeActive = !1),
            (i.visible = !0),
            (i.x = i._eeWorldX),
            (i.y = i._eeBaseY),
            i._eeAudioScale || i.setScale(1),
            i.setAlpha(1);
        }
    }
  }
  applyEnterEffects(t) {
    const e = 400,
      i = 140,
      s = 200,
      r = t,
      a = t + n,
      o = t + n / 2,
      h = Math.max(0, Math.floor((r - i) / e)),
      l = Math.min(this._sections.length - 1, Math.floor((a + i) / e));
    for (let n = h; n <= l; n++) {
      const t = this._sections[n];
      if (!t) continue;
      const h = n * e,
        l = h >= r + i && h + e <= a - i;
      for (let e = 0; e < t.length; e++) {
        const n = t[e];
        if (l) {
          n._eeActive &&
            ((n._eeActive = !1),
            (n.y = n._eeBaseY),
            (n.x = n._eeWorldX),
            n._eeAudioScale || n.setScale(1),
            n.setAlpha(1));
          continue;
        }
        const h = n._eeWorldX,
          u = h > o;
        let c;
        if (
          ((c = u
            ? Math.max(0, Math.min(1, (a - h) / i))
            : Math.max(0, Math.min(1, (h - r) / i))),
          c >= 1)
        ) {
          n._eeActive &&
            ((n._eeActive = !1),
            (n.y = n._eeBaseY),
            (n.x = n._eeWorldX),
            n._eeAudioScale || n.setScale(1),
            n.setAlpha(1));
          continue;
        }
        n._eeActive = !0;
        const d = u ? this._activeEnterEffect : this._activeExitEffect,
          p = 1 - c;
        let f = n._eeBaseY,
          g = n._eeWorldX,
          v = c,
          m = 1;
        switch (d) {
          case 0:
            break;
          case 1:
            f = n._eeBaseY + s * p;
            break;
          case 2:
            f = n._eeBaseY - s * p;
            break;
          case 3:
            g = n._eeWorldX - s * p;
            break;
          case 4:
            g = n._eeWorldX + s * p;
            break;
          case 5:
            n._eeAudioScale || (m = c);
            break;
          case 6:
            n._eeAudioScale || (m = 1 + 0.75 * p);
        }
        n.x !== g && (n.x = g),
          n.y !== f && (n.y = f),
          n.alpha !== v && (n.alpha = v),
          n._eeAudioScale || n.scaleX === m || n.setScale(m);
      }
    }
  }
  setGroundColor(t) {
    for (let e of this._groundTiles) e.setTint(t);
    for (let e of this._ceilingTiles) e.setTint(t);
  }
  updateAudioScale(t) {
    for (let e of this._audioScaleSprites) e.setScale(t);
    for (let e of this._audioScaleSprites2) e.setScale(0.5 + t);
  }
  resetVisibility() {
    (this._visMinSec = -1), (this._visMaxSec = -1);
  }
  resetObjects() {
    for (let t of this.objects) t.activated = !1;
    for (let t of this._audioScaleSprites) t.setScale(0.1);
  }
}
class _s {
  constructor(t, e, i, r, n, a, o = 16777215, h = 1) {
    (this._color = o),
      (this._opacity = h),
      (this._fadeDelta = 1 / i),
      (this._minSegSq = r * r),
      (this._maxSeg = a),
      (this._maxPoints = 5 * Math.floor(60 * i + 2)),
      (this._stroke = n),
      (this._pts = []),
      (this._posR = { x: 0, y: 0 }),
      (this._posInit = !1),
      (this._active = !1),
      (this._gfx = t.add.graphics()),
      this._gfx.setBlendMode(s.BlendModes.ADD);
  }
  addToContainer(t, e) {
    t.add(this._gfx), this._gfx.setDepth(e);
  }
  setPosition(t, e) {
    (this._posR.x = t), (this._posR.y = e), (this._posInit = !0);
  }
  start() {
    this._active = !0;
  }
  stop() {
    this._active = !1;
  }
  reset() {
    (this._pts = []), (this._posInit = !1), this._gfx.clear();
  }
  update(t) {
    if (!this._posInit) return void this._gfx.clear();
    const e = t * this._fadeDelta;
    let i = 0;
    for (let r = 0; r < this._pts.length; r++)
      (this._pts[r].state -= e),
        this._pts[r].state > 0 &&
          (i !== r && (this._pts[i] = this._pts[r]), i++);
    if (
      ((this._pts.length = i),
      this._active && this._pts.length < this._maxPoints)
    ) {
      const t = this._pts.length;
      let e = !0;
      if (t > 0) {
        const i = this._pts[t - 1],
          s = this._posR.x - i.x,
          r = this._posR.y - i.y,
          n = s * s + r * r;
        if (this._maxSeg > 0 && Math.sqrt(n) > this._maxSeg)
          this._pts.length = 0;
        else if (n < this._minSegSq) e = !1;
        else if (t > 1) {
          const i = this._pts[t - 2],
            s = this._posR.x - i.x,
            r = this._posR.y - i.y;
          s * s + r * r < 2 * this._minSegSq && (e = !1);
        }
      }
      e && this._pts.push({ x: this._posR.x, y: this._posR.y, state: 1 });
    }
    this._gfx.clear();
    const s = this._pts.length;
    if (!(s < 2))
      for (let r = 0; r < s - 1; r++) {
        const t = this._pts[r],
          e = this._pts[r + 1],
          i = 0.5 * (t.state + e.state) * this._opacity;
        this._gfx.lineStyle(this._stroke, this._color, i),
          this._gfx.lineBetween(t.x, t.y, e.x, e.y);
      }
  }
}
function ws(t, e, i, s, r, n) {
  let a = findTextureFrame(t, s);
  if (!a) return null;
  let o = t.add.image(e, i, a.atlas, a.frame);
  return o.setDepth(r), o.setVisible(n), { sprite: o };
}
