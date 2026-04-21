// Reverse-engineered source mirror extracted from the runtime bundle.
// GameScene is the main playable Geometry Dash scene. It coordinates menu flow, HUD, pause UI,
// fixed-step gameplay updates, completion effects, and the end screen.
class GameScene extends s.Scene {
  constructor() {
    super({ key: "GameScene" });
  }
  create() {
    this._loadSettings(),
      (this._bgSpeedX = 0.1),
      (this._bgSpeedY = 0.1),
      (this._menuCameraX = -l),
      (this._prevCameraX = -l),
      (this._bg = this.add
        .tileSprite(0, 0, n, a, "game_bg_01")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(-10));
    const backgroundTextureHeight =
      this.textures.get("game_bg_01").source[0].height;
    (this._bgInitY = backgroundTextureHeight - a - h),
      (this._cameraX = -l),
      (this._cameraY = 0),
      (this._cameraXRef = {
        get value() {
          return this._v;
        },
        _v: -l,
      }),
      (this._state = new PlayerState()),
      (this._level = new LevelRuntime(this, this._cameraXRef)),
      (this._player = new PlayerRuntime(this, this._state, this._level)),
      (this._colorManager = new ColorManager()),
      (this._audio = new AudioManager(this));
    let levelData = this.cache.text.get("level_1");
    levelData && this._level.loadLevel(levelData);
    let levelSettings = decodeLevelData(levelData).settings,
      backgroundColor = { r: 0, g: 102, b: 255 },
      groundColor = { r: 0, g: 68, b: 170 };
    // Geometry Dash stores color channels in the serialized kS38 string.
    levelSettings.kS38 &&
      levelSettings.kS38.split("|").forEach((entry) => {
        const parts = entry.split("_"),
          colorFields = {};
        for (let partIndex = 0; partIndex < parts.length; partIndex += 2)
          colorFields[parts[partIndex]] = parts[partIndex + 1];
        "1000" === colorFields[6] &&
          (backgroundColor = {
            r: colorFields[1] || 0,
            g: colorFields[2] || 0,
            b: colorFields[3] || 0,
          }),
          "1001" === colorFields[6] &&
            (groundColor = {
              r: colorFields[1] || 0,
              g: colorFields[2] || 0,
              b: colorFields[3] || 0,
            });
      }),
      (window.bgr = backgroundColor.r),
      (window.bgg = backgroundColor.g),
      (window.bgb = backgroundColor.b),
      (window.gr = groundColor.r),
      (window.gg = groundColor.g),
      (window.gb = groundColor.b),
      (this._colorManager = new ColorManager()),
      this._level.createEndPortal(this),
      (this._glitterCenterX = 0),
      (this._glitterCenterY = 460),
      (this._glitterEmitter = this.add.particles(0, 0, "GJ_WebSheet", {
        frame: "square.png",
        speed: 0,
        scale: { start: 0.375, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 200, max: 1800 },
        frequency: 60,
        blendMode: M,
        tint: g,
        emitting: !1,
        emitCallback: (t) => {
          (t.x = this._glitterCenterX + (2 * Math.random() - 1) * (n / 1.8)),
            (t.y = this._glitterCenterY + 320 * (2 * Math.random() - 1));
        },
      })),
      this._level.additiveContainer.add(this._glitterEmitter),
      this._bg.setTint(this._colorManager.getHex(bs)),
      this._level.setGroundColor(this._colorManager.getHex(Ss)),
      this._level.additiveContainer.setVisible(!1),
      this._level.container.setVisible(!1),
      this._level.topContainer.setVisible(!1),
      (this._attempts = 1),
      (this._bestPercent = 0),
      (this._lastPercent = 0),
      (this._endPortalGameY = 240),
      this._resetGameplayState(),
      (this._totalJumps = 0),
      (this._playTime = 0),
      (this._menuActive = !0),
      (this._slideIn = !1),
      (this._slideGroundX = null),
      (this._firstPlay = !0),
      this._player.setCubeVisible(!1),
      this._player.setShipVisible(!1),
      this._player.setBallVisible(!1),
      (this._debugGraphics = this.add.graphics().setDepth(99)),
      (this._logo = this.add
        .image(0, 100, "GJ_WebSheet", "GJ_logo_001.png")
        .setScrollFactor(0)
        .setDepth(30)),
      (this._robLogo = this.add
        .image(160, 555, "GJ_WebSheet", "RobTopLogoBig_001.png")
        .setScrollFactor(0)
        .setDepth(30)
        .setScale(0.9)),
      (this._copyrightText = this.add
        .text(0, 625, "© 2026 RobTop Games · geometrydash.com", {
          fontSize: "14px",
          color: "#ffffff",
          fontFamily: "Arial",
        })
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(30)
        .setAlpha(0.3)),
      (this._tryMeImg = this.add
        .image(0, 182.5, "GJ_WebSheet", "tryMe_001.png")
        .setScrollFactor(0)
        .setDepth(30)),
      (this._downloadBtns = []);
    const storeButtons = [
      {
        key: "downloadSteam_001",
        url: "https://store.steampowered.com/app/322170/Geometry_Dash",
      },
      {
        key: "downloadGoogle_001",
        url: "https://play.google.com/store/apps/details?id=com.robtopx.geometryjump&hl=en",
      },
      {
        key: "downloadApple_001",
        url: "https://apps.apple.com/us/app/geometry-dash/id625334537",
      },
    ];
    for (
      let buttonIndex = 0;
      buttonIndex < storeButtons.length;
      buttonIndex++
    ) {
      const storeButton = storeButtons[buttonIndex],
        buttonScale = 1 / 1.5,
        buttonImage = this.add
          .image(0, 0, "GJ_WebSheet", storeButton.key + ".png")
          .setScrollFactor(0)
          .setDepth(30)
          .setScale(buttonScale)
          .setInteractive();
      this._makeBouncyButton(
        buttonImage,
        buttonScale,
        () => window.open(storeButton.url, "_blank"),
        () => this._menuActive,
      ),
        this._downloadBtns.push(buttonImage);
    }
    const isFullscreen = this.scale.isFullscreen;
    (this._menuFsBtn = this.add
      .image(
        33,
        33,
        "GJ_WebSheet",
        isFullscreen
          ? "toggleFullscreenOff_001.png"
          : "toggleFullscreenOn_001.png",
      )
      .setScrollFactor(0)
      .setDepth(30)
      .setScale(0.64)
      .setAlpha(0.8)
      .setTint(s.Display.Color.GetColor(0, Math.round(102), 255))
      .setInteractive()),
      this._expandHitArea(this._menuFsBtn, 1.5),
      this._makeBouncyButton(
        this._menuFsBtn,
        0.64,
        () => {
          const t = !this.scale.isFullscreen;
          this._menuFsBtn.setTexture(
            "GJ_WebSheet",
            t ? "toggleFullscreenOff_001.png" : "toggleFullscreenOn_001.png",
          ),
            this._expandHitArea(this._menuFsBtn, 1.5),
            this._toggleFullscreen();
        },
        () => this._menuActive,
      ),
      (this._menuInfoBtn = this.add
        .image(n - 30 - 3, 33, "GJ_WebSheet", "GJ_infoIcon_001.png")
        .setScrollFactor(0)
        .setDepth(30)
        .setScale(0.64)
        .setAlpha(0.8)
        .setTint(s.Display.Color.GetColor(0, Math.round(102), 255))
        .setInteractive()),
      this._expandHitArea(this._menuInfoBtn, 1.5),
      this._makeBouncyButton(
        this._menuInfoBtn,
        0.64,
        () => {
          this._buildInfoPopup();
        },
        () => this._menuActive && !this._infoPopup,
      ),
      (this._menuGlitter = this.add
        .particles(0, 0, "GJ_WebSheet", {
          frame: "square.png",
          speed: 0,
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.6, end: 0.2 },
          lifespan: { min: 1e3, max: 2e3 },
          frequency: 35,
          blendMode: M,
          tint: 20670,
          x: { min: -130, max: 130 },
          y: { min: -100, max: 100 },
        })
        .setScrollFactor(0)
        .setDepth(29)),
      (this._playBtn = this.add
        .image(0, 0, "GJ_WebSheet", "GJ_playBtn_001.png")
        .setScrollFactor(0)
        .setDepth(30)
        .setInteractive()),
      (this._playBtnPressed = !1),
      this._makeBouncyButton(
        this._playBtn,
        1,
        () => {
          this._audio.playEffect("playSound_01", { volume: 1 }),
            this._startGame();
        },
        () => this._menuActive && !this._playBtnPressed,
      ),
      this._positionMenuItems(),
      (this._spaceWasDown = !1),
      (this._wKey = this.input.keyboard.addKey(s.Input.Keyboard.KeyCodes.W)),
      (this._spaceKey = this.input.keyboard.addKey(
        s.Input.Keyboard.KeyCodes.SPACE,
      )),
      (this._upKey = this.input.keyboard.addKey(s.Input.Keyboard.KeyCodes.UP)),
      (this._rKey = this.input.keyboard.addKey(s.Input.Keyboard.KeyCodes.R)),
      (this._startPosIndex = -1),
      this.input.keyboard.on("keydown-Q", () => {
        this.startPosSwitcherEnabled && this.changeStartPos(-1);
      }),
      this.input.keyboard.on("keydown-E", () => {
        this.startPosSwitcherEnabled && this.changeStartPos(1);
      }),
      (this._pauseBtn = this.add
        .image(n - 30, 30, "GJ_WebSheet", "GJ_pauseBtn_clean_001.png")
        .setScrollFactor(0)
        .setDepth(30)
        .setAlpha(75 / 255)
        .setVisible(!1)),
      this._pauseBtn.setInteractive(),
      this._expandHitArea(this._pauseBtn, 2),
      this._pauseBtn.on("pointerdown", () => this._pauseGame()),
      (this._percentageLabel = this.add
        .bitmapText(n / 2, 20, "bigFont", "0%", 30)
        .setOrigin(0.5)),
      this._percentageLabel.setVisible(!1),
      this._percentageLabel.setDepth(100),
      (this._noclipIndicator = this.add
        .bitmapText(10, 10, "bigFont", "Noclip", 20)
        .setOrigin(0, 0)
        .setAlpha(0.4)
        .setDepth(100)
        .setVisible(!1)),
      (this._escKey = this.input.keyboard.addKey(
        s.Input.Keyboard.KeyCodes.ESC,
      )),
      this._escKey.on("down", () =>
        this._settingsPopup
          ? (this._settingsPopup.destroy(), void (this._settingsPopup = null))
          : this._infoPopup
            ? (this._closeInfoPopup(), void (this._infoPopup = null))
            : void (this._paused
                ? this._resumeGame()
                : this._menuActive ||
                  this._slideIn ||
                  this._state.isDead ||
                  this._levelWon ||
                  this._pauseGame()),
      ),
      (this._paused = !1),
      (this._pauseContainer = null),
      (this._sfxVolume = this.game.registry.get("userSfxVol") ?? 1),
      this.input.on("pointerdown", () => {
        this._menuActive || this._paused || this._pushButton();
      }),
      this.input.on("pointerup", () => {
        this._menuActive || this._paused || this._releaseButton();
      }),
      window.addEventListener("pointerup", () => this._releaseButton()),
      window.addEventListener("touchend", () => this._releaseButton()),
      this.scale.on("enterfullscreen", () => this._onFullscreenChange(!0)),
      this.scale.on("leavefullscreen", () => this._onFullscreenChange(!1)),
      this._buildHUD(),
      this._createStartPosGui(),
      document.addEventListener("visibilitychange", () => {
        document.hidden
          ? this._audio.pauseMusic()
          : this._menuActive ||
            this._paused ||
            this._state.isDead ||
            this._levelWon ||
            this._audio.resumeMusic();
      }),
      window.addEventListener("orientationchange", () => {
        this.time.delayedCall(100, () => this.scale.refresh());
      }),
      window.addEventListener("resize", () => {
        this.scale.refresh();
      }),
      this.game.registry.get("fadeInFromBlack") &&
        (this.game.registry.remove("fadeInFromBlack"),
        this.cameras.main.fadeIn(400, 0, 0, 0));
  }
  _buildHUD() {
    (this._attemptsLabel = this.add
      .bitmapText(0, 0, "bigFont", "Attempt 1", 65)
      .setOrigin(0.5, 0.5)
      .setVisible(!1)),
      this._level.topContainer.add(this._attemptsLabel),
      this._positionAttemptsLabel(),
      (this._fpsText = this.add
        .text(n - 20, 10, "", {
          fontSize: "28px",
          fill: "#ff0000",
          fontFamily: "Arial",
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(999)
        .setVisible(!1)),
      (this._fpsAccum = 0),
      (this._fpsFrames = 0),
      this.input.keyboard
        .addKey(s.Input.Keyboard.KeyCodes.createTextureImage)
        .on("down", () => {
          this._fpsText.setVisible(!this._fpsText.visible);
        });
  }
  _createStartPosGui() {
    const t = n / 2;
    (this._startPosGui = this.add
      .container(t, 580)
      .setScrollFactor(0)
      .setDepth(100)),
      this._startPosGui.setVisible(this.startPosSwitcherEnabled);
    const e = this.add
        .image(-80, 0, "GJ_GameSheet03", "GJ_arrow_01_001.png")
        .setScale(0.6)
        .setInteractive(),
      i = this.add
        .image(80, 0, "GJ_GameSheet03", "GJ_arrow_01_001.png")
        .setScale(0.6)
        .setFlipX(!0)
        .setInteractive(),
      s = this._level.getStartPositions().length;
    (this._startPosText = this.add
      .bitmapText(0, 0, "bigFont", `0/${s}`, 40)
      .setOrigin(0.5)),
      this._startPosGui.add([e, i, this._startPosText]),
      this._makeBouncyButton(e, 0.6, () => this.changeStartPos(-1)),
      this._makeBouncyButton(i, 0.6, () => this.changeStartPos(1));
  }
  changeStartPos(t) {
    if (this._paused || this._levelWon || this._menuActive || this._slideIn)
      return;
    const e = this._level.getStartPositions().length;
    if (0 !== e) {
      if (
        ((this._startPosIndex += t),
        this._startPosIndex < -1
          ? (this._startPosIndex = e - 1)
          : this._startPosIndex >= e && (this._startPosIndex = -1),
        this._startPosText)
      ) {
        const t = -1 === this._startPosIndex ? 0 : this._startPosIndex + 1;
        this._startPosText.setText(`${t}/${e}`);
      }
      this._restartLevel();
    }
  }
  toggleGlitter(t) {
    t ? this._glitterEmitter.start() : this._glitterEmitter.stop();
  }
  _setParticleTimeScale(t) {
    const e = (i) => {
      i && "ParticleEmitter" === i.type && (i.timeScale = t),
        i && i.list && i.list.forEach(e);
    };
    e(this._level.container),
      e(this._level.topContainer),
      this._glitterEmitter && (this._glitterEmitter.timeScale = t);
  }
  _pauseGame() {
    this._paused ||
      this._menuActive ||
      this._slideIn ||
      this._state.isDead ||
      this._levelWon ||
      ((this._paused = !0),
      this._pauseBtn.setVisible(!1),
      this._audio.pauseMusic(),
      this._setParticleTimeScale(0),
      this._buildPauseOverlay());
  }
  _resumeGame() {
    this._paused &&
      (this._setParticleTimeScale(1),
      (this._paused = !1),
      this._pauseBtn.setVisible(!0).setAlpha(75 / 255),
      this._audio.resumeMusic(),
      this._pauseContainer &&
        (this._pauseContainer.destroy(), (this._pauseContainer = null)));
  }
  _buildPauseOverlay() {
    const centerX = n / 2,
      panelWidth = n - 40;
    this._pauseContainer = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(100);
    const dimmer = this.add.rectangle(centerX, 320, n, a, 0, 75 / 255);
    dimmer.setInteractive(), this._pauseContainer.add(dimmer);
    const panelCornerSize =
        0.325 * this.textures.get("square04_001").source[0].width,
      pausePanel = this._drawScale9(
        centerX,
        320,
        panelWidth,
        600,
        "square04_001",
        panelCornerSize,
        0,
        150 / 255,
      );
    this._pauseContainer.add(pausePanel);
    const isFullscreen = this.scale.isFullscreen,
      fullscreenButton = this.add
        .image(
          centerX - panelWidth / 2 + 40,
          60,
          "GJ_WebSheet",
          isFullscreen
            ? "toggleFullscreenOff_001.png"
            : "toggleFullscreenOn_001.png",
        )
        .setScale(0.64)
        .setInteractive();
    this._expandHitArea(fullscreenButton, 2.5),
      this._pauseContainer.add(fullscreenButton),
      this._makeBouncyButton(fullscreenButton, 0.64, () => {
        const shouldEnterFullscreen = !this.scale.isFullscreen;
        fullscreenButton.setTexture(
          "GJ_WebSheet",
          shouldEnterFullscreen
            ? "toggleFullscreenOff_001.png"
            : "toggleFullscreenOn_001.png",
        ),
          this._expandHitArea(fullscreenButton, 2.5),
          this._toggleFullscreen();
      }),
      this._pauseContainer.add(
        this.add
          .bitmapText(centerX, 65, "bigFont", window.levelName, 40)
          .setOrigin(0.5, 0.5),
      );
    const bestPercent = this._bestPercent || 0,
      progressBarBackground = this.add
        .image(centerX, 170, "GJ_WebSheet", "GJ_progressBar_001.png")
        .setTint(0)
        .setAlpha(125 / 255);
    this._pauseContainer.add(progressBarBackground);
    const progressBarFrame = this.textures.getFrame(
        "GJ_WebSheet",
        "GJ_progressBar_001.png",
      ),
      progressBarWidth = progressBarFrame ? progressBarFrame.width : 680,
      progressBarHeight = progressBarFrame ? progressBarFrame.height : 40,
      progressFillWidth = Math.max(
        1,
        Math.floor(progressBarWidth * (bestPercent / 100)),
      ),
      progressBarFill = this.add
        .image(0, 0, "GJ_WebSheet", "GJ_progressBar_001.png")
        .setTint(65280)
        .setScale(0.992, 0.86)
        .setOrigin(0, 0.5)
        .setCrop(0, 0, progressFillWidth, progressBarHeight);
    progressBarFill.setPosition(centerX - (0.992 * progressBarWidth) / 2, 170),
      this._pauseContainer.add(progressBarFill),
      this._pauseContainer.add(
        this.add
          .bitmapText(centerX, 170, "bigFont", bestPercent + "%", 30)
          .setOrigin(0.5, 0.5)
          .setScale(0.7),
      ),
      this._pauseContainer.add(
        this.add
          .bitmapText(centerX, 130, "bigFont", "Normal Mode", 30)
          .setOrigin(0.5, 0.5)
          .setScale(0.78),
      );
    const pauseActions = [
        {
          frame: "GJ_replayBtn_001.png",
          action: () => {
            this._resumeGame(), this._restartLevel();
          },
        },
        { frame: "GJ_playBtn2_001.png", action: () => this._resumeGame() },
        {
          frame: "GJ_menuBtn_001.png",
          action: () => {
            this._audio.playEffect("quitSound_01"),
              this._audio.stopMusic(),
              this._resumeGame(),
              this.scene.restart();
          },
        },
      ],
      buttonWidths = pauseActions.map((actionButton) => {
        const frame = this.textures.getFrame("GJ_WebSheet", actionButton.frame);
        return frame ? frame.width : 246;
      });
    let buttonCursorX =
      centerX -
      (buttonWidths.reduce((total, width) => total + width, 0) +
        40 * (pauseActions.length - 1)) /
        2;
    for (
      let buttonIndex = 0;
      buttonIndex < pauseActions.length;
      buttonIndex++
    ) {
      const actionButton = pauseActions[buttonIndex],
        buttonWidth = buttonWidths[buttonIndex],
        buttonImage = this.add
          .image(
            buttonCursorX + buttonWidth / 2,
            330,
            "GJ_WebSheet",
            actionButton.frame,
          )
          .setInteractive();
      this._pauseContainer.add(buttonImage),
        this._makeBouncyButton(buttonImage, 1, actionButton.action),
        (buttonCursorX += buttonWidth + 40);
    }
    const settingsButton = this.add
      .image(
        centerX + panelWidth / 2 - 60,
        80,
        "GJ_GameSheet03",
        "GJ_optionsBtn_001.png",
      )
      .setAngle(90)
      .setFlipY(!0)
      .setScale(0.64)
      .setInteractive();
    this._expandHitArea(settingsButton, 2.5),
      this._pauseContainer.add(settingsButton),
      this._makeBouncyButton(settingsButton, 0.64, () =>
        this._buildSettingsPopup(),
      );
    const sliderY = 500,
      sliderScale = 0.7,
      sliderGrooveFrame = this.textures.getFrame(
        "GJ_WebSheet",
        "slidergroove.png",
      ),
      sliderGrooveWidth = sliderGrooveFrame ? sliderGrooveFrame.width : 420,
      createVolumeSlider = (
        sliderCenterX,
        iconFrame,
        initialValue,
        onChange,
      ) => {
        this._pauseContainer.add(
          this.add
            .image(sliderCenterX - 180 - 5, sliderY, "GJ_WebSheet", iconFrame)
            .setScale(1.2),
        );
        const dragWidth = (sliderGrooveWidth - 8) * sliderScale,
          sliderLeftX =
            sliderCenterX - (sliderGrooveWidth * sliderScale) / 2 + 2.8,
          fillWidth = initialValue * dragWidth,
          sliderFill = this.add
            .tileSprite(
              sliderLeftX,
              sliderY,
              fillWidth > 0 ? fillWidth : 1,
              11.2,
              "sliderBar",
            )
            .setOrigin(0, 0.5)
            .setVisible(fillWidth > 0);
        this._pauseContainer.add(sliderFill);
        const sliderGroove = this.add
          .image(sliderCenterX, sliderY, "GJ_WebSheet", "slidergroove.png")
          .setScale(sliderScale);
        this._pauseContainer.add(sliderGroove);
        const thumbX = sliderLeftX + initialValue * dragWidth,
          sliderThumb = this.add
            .image(thumbX, sliderY, "GJ_WebSheet", "sliderthumb.png")
            .setScale(sliderScale)
            .setInteractive({ draggable: !0, useHandCursor: !0 });
        this._pauseContainer.add(sliderThumb),
          sliderThumb.on("pointerdown", () =>
            sliderThumb.setTexture("GJ_WebSheet", "sliderthumbsel.png"),
          ),
          sliderThumb.on("pointerup", () =>
            sliderThumb.setTexture("GJ_WebSheet", "sliderthumb.png"),
          ),
          sliderThumb.on("pointerout", () =>
            sliderThumb.setTexture("GJ_WebSheet", "sliderthumb.png"),
          ),
          sliderThumb.on("drag", (pointer, dragX) => {
            sliderThumb.x = Math.max(
              sliderLeftX,
              Math.min(sliderLeftX + dragWidth, dragX),
            );
            const sliderValue = (sliderThumb.x - sliderLeftX) / dragWidth,
              clampedValue = sliderValue < 0.03 ? 0 : sliderValue;
            (sliderFill.width = Math.max(1, clampedValue * dragWidth)),
              sliderFill.setVisible(clampedValue > 0),
              onChange(clampedValue);
          });
      };
    createVolumeSlider(
      centerX - 200,
      "gj_songIcon_001.png",
      this._audio.getUserMusicVolume(),
      (volume) => this._audio.setUserMusicVolume(volume),
    ),
      createVolumeSlider(
        centerX + 200,
        "GJ_sfxIcon_001.png",
        this._sfxVolume,
        (volume) => {
          (this._sfxVolume = volume),
            this.game.registry.set("userSfxVol", volume);
        },
      );
  }
  _saveSettings() {
    const t = {
      noclip: window.noclip,
      showPercentage: this.showPercentageEnabled,
      percentDecimals: this.percentageDecimalsEnabled,
      showHitboxes: this._showHitboxes,
      startPosSwitcher: this.startPosSwitcherEnabled,
    };
    localStorage.setItem("gd_settings", JSON.stringify(t));
  }
  _loadSettings() {
    const t = localStorage.getItem("gd_settings"),
      e = t
        ? JSON.parse(t)
        : {
            noclip: 0,
            showPercentage: !0,
            percentDecimals: !1,
            showHitboxes: !1,
            startPosSwitcher: !1,
          };
    (window.noclip = e.noclip),
      (this.showPercentageEnabled = e.showPercentage),
      (this.percentageDecimalsEnabled = e.percentDecimals),
      (this._showHitboxes = e.showHitboxes),
      (this.startPosSwitcherEnabled = e.startPosSwitcher);
  }
  _buildSettingsPopup() {
    if (this._settingsPopup) return;
    const t = n / 2;
    this._settingsPopup = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(250);
    const e = this.add.rectangle(t, 320, n, a, 0, 150 / 255).setInteractive();
    this._settingsPopup.add(e);
    const i = 0.325 * this.textures.get("GJ_square02").source[0].width,
      s = this._drawScale9(t, 320, 800, 550, "GJ_square02", i, 16777215, 1);
    this._settingsPopup.add(s),
      this._settingsPopup.add(
        this.add.bitmapText(t, 90, "bigFont", "Settings", 40).setOrigin(0.5),
      );
    const r = this.add
      .image(t - 400 + 20, 65, "GJ_WebSheet", "GJ_closeBtn_001.png")
      .setScale(0.8)
      .setInteractive();
    this._settingsPopup.add(r),
      this._makeBouncyButton(r, 0.8, () => {
        this._settingsPopup.destroy(), (this._settingsPopup = null);
      });
    const o = t - 180,
      h = -120,
      l = -70,
      u = () =>
        this.showPercentageEnabled
          ? "GJ_checkOn_001.png"
          : "GJ_checkOff_001.png",
      c = this.add
        .image(o + h, 170, "GJ_GameSheet03", u())
        .setScale(0.8)
        .setInteractive();
    this._settingsPopup.add(c),
      this._settingsPopup.add(
        this.add
          .bitmapText(o + l, 170, "bigFont", "Show Percentage", 25)
          .setOrigin(0, 0.5),
      ),
      this._makeBouncyButton(c, 0.8, () => {
        (this.showPercentageEnabled = !this.showPercentageEnabled),
          c.setTexture("GJ_GameSheet03", u()),
          this._percentageLabel &&
            this._percentageLabel.setVisible(this.showPercentageEnabled),
          this._saveSettings();
      });
    const d = () =>
        this.percentageDecimalsEnabled
          ? "GJ_checkOn_001.png"
          : "GJ_checkOff_001.png",
      p = this.add
        .image(o + h, 240, "GJ_GameSheet03", d())
        .setScale(0.8)
        .setInteractive();
    this._settingsPopup.add(p),
      this._settingsPopup.add(
        this.add
          .bitmapText(o + l, 240, "bigFont", "Percentage Decimals", 25)
          .setOrigin(0, 0.5),
      ),
      this._makeBouncyButton(p, 0.8, () => {
        (this.percentageDecimalsEnabled = !this.percentageDecimalsEnabled),
          p.setTexture("GJ_GameSheet03", d()),
          this._saveSettings();
      });
    const f = () =>
        this.startPosSwitcherEnabled
          ? "GJ_checkOn_001.png"
          : "GJ_checkOff_001.png",
      g = this.add
        .image(o + h, 310, "GJ_GameSheet03", f())
        .setScale(0.8)
        .setInteractive();
    this._settingsPopup.add(g),
      this._settingsPopup.add(
        this.add
          .bitmapText(o + l, 310, "bigFont", "StartPos Switcher", 25)
          .setOrigin(0, 0.5),
      ),
      this._makeBouncyButton(g, 0.8, () => {
        (this.startPosSwitcherEnabled = !this.startPosSwitcherEnabled),
          g.setTexture("GJ_GameSheet03", f()),
          this.startPosSwitcherEnabled || (this._startPosIndex = -1),
          this._startPosGui.setVisible(this.startPosSwitcherEnabled),
          this._startPosText.setText(
            `0/${this._level.getStartPositions().length}`,
          ),
          this._saveSettings();
      });
    const v = () =>
        1 === window.noclip ? "GJ_checkOn_001.png" : "GJ_checkOff_001.png",
      m = this.add
        .image(o + h, 380, "GJ_GameSheet03", v())
        .setScale(0.8)
        .setInteractive();
    this._settingsPopup.add(m),
      this._settingsPopup.add(
        this.add
          .bitmapText(o + l, 380, "bigFont", "Noclip", 25)
          .setOrigin(0, 0.5),
      ),
      this._makeBouncyButton(m, 0.8, () => {
        (window.noclip = 1 === window.noclip ? 0 : 1),
          m.setTexture("GJ_GameSheet03", v()),
          this._saveSettings();
      });
    const y = () =>
        this._showHitboxes ? "GJ_checkOn_001.png" : "GJ_checkOff_001.png",
      x = this.add
        .image(o + h, 450, "GJ_GameSheet03", y())
        .setScale(0.8)
        .setInteractive();
    this._settingsPopup.add(x),
      this._settingsPopup.add(
        this.add
          .bitmapText(o + l, 450, "bigFont", "Show Hitboxes", 25)
          .setOrigin(0, 0.5),
      ),
      this._makeBouncyButton(x, 0.8, () => {
        (this._showHitboxes = !this._showHitboxes),
          x.setTexture("GJ_GameSheet03", y()),
          !this._showHitboxes &&
            this._debugGraphics &&
            this._debugGraphics.clear(),
          this._saveSettings();
      });
  }
  _buildInfoPopup() {
    if (this._infoPopup) return;
    const t = n / 2;
    this._infoPopup = this.add.container(0, 0).setScrollFactor(0).setDepth(200);
    const e = this.add.rectangle(t, 320, n, a, 0, 100 / 255);
    e.setInteractive(), this._infoPopup.add(e);
    const i = 0.325 * this.textures.get("GJ_square02").source[0].width,
      s = this._drawScale9(t, 320, 480, 336, "GJ_square02", i, 16777215, 1);
    this._infoPopup.add(s);
    const r = this.add
      .image(t - 240 + 20, 172, "GJ_WebSheet", "GJ_closeBtn_001.png")
      .setScale(0.8)
      .setInteractive();
    this._infoPopup.add(r),
      this._expandHitArea(r, 2),
      this._makeBouncyButton(r, 0.8, () => this._closeInfoPopup());
    let o = 206;
    const h = this.add
      .bitmapText(t, o, "bigFont", "Credits", 40)
      .setOrigin(0.5, 0.5);
    this._infoPopup.add(h), (o += 70);
    const l = this.add
      .bitmapText(t, o, "goldFont", "Made by RobTop Games", 40)
      .setOrigin(0.5, 0.5)
      .setScale(0.6);
    this._infoPopup.add(l), (o += 60);
    const u = this.add
      .bitmapText(t, o, "goldFont", "WBDL by Lasokar", 40)
      .setOrigin(0.5, 0.5)
      .setScale(0.6);
    this._infoPopup.add(u), (o += 30);
    const c = this.add
      .bitmapText(t - 20, o, "goldFont", "Version 1.0.6", 40)
      .setOrigin(0.5, 0.5)
      .setScale(0.6);
    this._infoPopup.add(c), (o -= 30);
    const d = t + (0.7 * u.width) / 2,
      p = this.add
        .image(d + 20 + 50 - 10, o + 2, "GJ_WebSheet", "gj_ytIcon_001.png")
        .setScale(0.5)
        .setInteractive();
    this._infoPopup.add(p),
      this._expandHitArea(p, 2),
      this._makeBouncyButton(p, 0.5, () => {
        window.open("https://www.youtube.com/@lasokar", "_blank");
      });
    const f = this.add
      .text(t, 446, "© 2026 RobTop Games. All rights reserved.", {
        fontSize: "12px",
        color: "#000000",
        fontFamily: "Arial",
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.7)
      .setResolution(2);
    this._infoPopup.add(f);
    const g = this.add
      .text(
        t,
        463,
        "Unauthorized copying, distribution, or hosting of this demo is prohibited.",
        { fontSize: "12px", color: "#000000", fontFamily: "Arial" },
      )
      .setOrigin(0.5, 0.5)
      .setAlpha(0.7)
      .setResolution(2);
    this._infoPopup.add(g);
  }
  _closeInfoPopup() {
    this._infoPopup && (this._infoPopup.destroy(), (this._infoPopup = null));
  }
  _expandHitArea(t, e) {
    const i = t.width,
      s = t.height,
      r = (i * (e - 1)) / 2,
      n = (s * (e - 1)) / 2;
    t.input.hitArea.setTo(-r, -n, i + 2 * r, s + 2 * n);
  }
  _makeBouncyButton(t, e, i, s) {
    const r = 1.26 * e;
    return (
      t.on("pointerdown", () => {
        (s && !s()) ||
          ((t._pressed = !0),
          this.tweens.killTweensOf(t, "scale"),
          this.tweens.add({
            targets: t,
            scale: r,
            duration: 300,
            ease: "Bounce.Out",
          }));
      }),
      t.on("pointerout", () => {
        t._pressed &&
          ((t._pressed = !1),
          this.tweens.killTweensOf(t, "scale"),
          this.tweens.add({
            targets: t,
            scale: e,
            duration: 400,
            ease: "Bounce.Out",
          }));
      }),
      t.on("pointerup", () => {
        t._pressed &&
          ((t._pressed = !1),
          this.tweens.killTweensOf(t, "scale"),
          t.setScale(e),
          i());
      }),
      t
    );
  }
  _toggleFullscreen() {
    if (this.scale.isFullscreen) this.scale.stopFullscreen();
    else {
      this.scale.startFullscreen();
      try {
        screen.orientation.lock("landscape").catch(() => {});
      } catch (t) {}
    }
  }
  _drawScale9(t, e, i, s, r, n, a, o) {
    const h = this.add.container(t, e),
      l = this.textures.get(r),
      u = l.source[0],
      c = u.width,
      d = u.height,
      p = i - 2 * n,
      f = s - 2 * n,
      g = [
        { sx: 0, sy: 0, sw: n, sh: n, dx: -i / 2, dy: -s / 2, dw: n, dh: n },
        {
          sx: n,
          sy: 0,
          sw: c - 2 * n,
          sh: n,
          dx: -i / 2 + n,
          dy: -s / 2,
          dw: p,
          dh: n,
        },
        {
          sx: c - n,
          sy: 0,
          sw: n,
          sh: n,
          dx: i / 2 - n,
          dy: -s / 2,
          dw: n,
          dh: n,
        },
        {
          sx: 0,
          sy: n,
          sw: n,
          sh: d - 2 * n,
          dx: -i / 2,
          dy: -s / 2 + n,
          dw: n,
          dh: f,
        },
        {
          sx: n,
          sy: n,
          sw: c - 2 * n,
          sh: d - 2 * n,
          dx: -i / 2 + n,
          dy: -s / 2 + n,
          dw: p,
          dh: f,
        },
        {
          sx: c - n,
          sy: n,
          sw: n,
          sh: d - 2 * n,
          dx: i / 2 - n,
          dy: -s / 2 + n,
          dw: n,
          dh: f,
        },
        {
          sx: 0,
          sy: d - n,
          sw: n,
          sh: n,
          dx: -i / 2,
          dy: s / 2 - n,
          dw: n,
          dh: n,
        },
        {
          sx: n,
          sy: d - n,
          sw: c - 2 * n,
          sh: n,
          dx: -i / 2 + n,
          dy: s / 2 - n,
          dw: p,
          dh: n,
        },
        {
          sx: c - n,
          sy: d - n,
          sw: n,
          sh: n,
          dx: i / 2 - n,
          dy: s / 2 - n,
          dw: n,
          dh: n,
        },
      ];
    for (let v = 0; v < g.length; v++) {
      const t = g[v],
        e = "_s9_" + v;
      l.has(e) || l.add(e, 0, t.sx, t.sy, t.sw, t.sh);
      const i = this.add
        .image(t.dx, t.dy, r, e)
        .setOrigin(0, 0)
        .setDisplaySize(t.dw, t.dh);
      void 0 !== a && i.setTint(a), void 0 !== o && i.setAlpha(o), h.add(i);
    }
    return h;
  }
  _startGame() {
    if (!this._menuActive) return;
    if (
      ((this._menuActive = !1),
      (this._slideIn = !0),
      this._menuGlitter &&
        (this._menuGlitter.destroy(), (this._menuGlitter = null)),
      this._playBtn &&
        (this.tweens.killTweensOf(this._playBtn),
        this.tweens.add({
          targets: this._playBtn,
          scale: 0.01,
          duration: 200,
          ease: "Quad.In",
          onComplete: () => {
            this._playBtn.destroy(), (this._playBtn = null);
          },
        })),
      this._robLogo &&
        this.tweens.add({
          targets: this._robLogo,
          y: a + this._robLogo.height,
          duration: 300,
          ease: "Quad.In",
          onComplete: () => {
            this._robLogo.destroy(), (this._robLogo = null);
          },
        }),
      this._copyrightText &&
        this.tweens.add({
          targets: this._copyrightText,
          y: 680,
          duration: 300,
          ease: "Quad.In",
          onComplete: () => {
            this._copyrightText.destroy(), (this._copyrightText = null);
          },
        }),
      this._menuFsBtn &&
        this.tweens.add({
          targets: this._menuFsBtn,
          y: -this._menuFsBtn.height,
          duration: 300,
          ease: "Quad.In",
          onComplete: () => {
            this._menuFsBtn.destroy(), (this._menuFsBtn = null);
          },
        }),
      this._menuInfoBtn &&
        this.tweens.add({
          targets: this._menuInfoBtn,
          y: -this._menuInfoBtn.height,
          duration: 300,
          ease: "Quad.In",
          onComplete: () => {
            this._menuInfoBtn.destroy(), (this._menuInfoBtn = null);
          },
        }),
      this._closeInfoPopup(),
      this._tryMeImg &&
        this.tweens.add({
          targets: this._tryMeImg,
          y: -this._tryMeImg.height,
          duration: 300,
          ease: "Quad.In",
          onComplete: () => {
            this._tryMeImg.destroy(), (this._tryMeImg = null);
          },
        }),
      this._downloadBtns)
    ) {
      for (const t of this._downloadBtns)
        this.tweens.killTweensOf(t),
          this.tweens.add({
            targets: t,
            y: a + t.height,
            duration: 300,
            ease: "Quad.In",
            onComplete: () => t.destroy(),
          });
      this._downloadBtns = null;
    }
    this._logo &&
      this.tweens.add({
        targets: this._logo,
        y: -this._logo.height,
        duration: 300,
        ease: "Quad.In",
        onComplete: () => {
          this._logo.destroy(), (this._logo = null);
        },
      }),
      (this._cameraX = -l),
      (this._cameraY = 0),
      (this._cameraXRef._v = this._cameraX),
      (this._prevCameraX = this._cameraX);
    const t = this._cameraX - (this._menuCameraX || 0);
    this._level.shiftGroundTiles(t),
      (this._playerWorldX = this._cameraX),
      (this._state.y = 30),
      (this._state.onGround = !0),
      this._level.additiveContainer.setVisible(!0),
      this._level.container.setVisible(!0),
      this._level.topContainer.setVisible(!0),
      this._player.reset(),
      this._attemptsLabel.setVisible(this._attempts > 1),
      this._positionAttemptsLabel();
  }
  _pushButton() {
    if (this._menuActive)
      return (
        this._audio.playEffect("playSound_01", { volume: 1 }),
        void this._startGame()
      );
    this._slideIn ||
      this._state.isDead ||
      ((this._state.upKeyDown = !0),
      (this._state.upKeyPressed = !0),
      !this._state.isFlying &&
        this._state.canJump &&
        (this._player.updateJump(0), this._totalJumps++));
  }
  _releaseButton() {
    (this._state.upKeyDown = !1), (this._state.upKeyPressed = !1);
  }
  _positionMenuItems() {
    const t = n / 2;
    if (
      (this._logo && (this._logo.x = t),
      this._menuInfoBtn && (this._menuInfoBtn.x = n - 30 - 3),
      this._copyrightText && (this._copyrightText.x = n - 20),
      this._tryMeImg && (this._tryMeImg.x = t + 175),
      this._menuGlitter &&
        ((this._menuGlitter.x = t), (this._menuGlitter.y = 320)),
      this._playBtn &&
        ((this._playBtn.x = t),
        this.tweens.killTweensOf(this._playBtn, "y"),
        (this._playBtn.y = 320),
        this.tweens.add({
          targets: this._playBtn,
          y: 324,
          duration: 750,
          ease: "Quad.InOut",
          yoyo: !0,
          repeat: -1,
        })),
      this._downloadBtns)
    ) {
      const t = n - 130,
        e = 555,
        i = 210;
      for (let s = 0; s < this._downloadBtns.length; s++)
        this._downloadBtns[s].setPosition(t - s * i, e);
    }
  }
  _positionAttemptsLabel() {
    let t = this._cameraX + n / 2;
    this._attempts > 1 && (t += 100), this._attemptsLabel.setPosition(t, 150);
  }
  _resetGameplayState() {
    (this._cameraX = -l),
      (this._cameraY = 0),
      (this._cameraXRef._v = -l),
      (this._prevCameraX = -l),
      (this._playerWorldX = 0),
      (this._deltaBuffer = 0),
      (this._deathTimer = 0),
      (this._deathSoundPlayed = !1),
      (this._newBestShown = !1),
      (this._hadNewBest = !1),
      (this._levelWon = !1),
      (this._endCameraOverride = !1),
      (this._endCamTween = null),
      (this._spaceWasDown = !1);
  }
  _restartLevel() {
    this._attempts++;
    const t = this._cameraX;
    this._resetGameplayState(),
      this._state.reset(),
      this._player.reset(),
      this._glitterEmitter.stop(),
      this._level.resetObjects(),
      this._level.shiftGroundTiles(this._cameraX - t),
      this._level.resetGroundState(),
      this._level.resetColorTriggers(),
      this._level.resetEnterEffectTriggers(),
      this._level.resetVisibility(),
      this._colorManager.reset();
    const e = this._level.getStartPositions();
    let i = 0;
    if (-1 !== this._startPosIndex && e[this._startPosIndex]) {
      const t = e[this._startPosIndex];
      (this._playerWorldX = t.x),
        (this._state.y = t.y),
        H === t.mode
          ? this._player.enterShipMode()
          : j === t.mode
            ? this._player.enterBallMode()
            : this._player.enterCubeMode(),
        (this._state.gravityFlipped = t.gravityFlipped),
        this._level.fastForwardTriggers(t.x, this._colorManager),
        (i = t.x / 623.16);
    }
    this._audio.reset(),
      this._audio.startMusic(i),
      (this._paused = !1),
      this._pauseContainer &&
        (this._pauseContainer.destroy(), (this._pauseContainer = null)),
      this._pauseBtn.setVisible(!0).setAlpha(75 / 255),
      this._attemptsLabel.setText("Attempt " + this._attempts),
      this._attemptsLabel.setVisible(!0),
      this._positionAttemptsLabel();
  }
  _onFullscreenChange(t) {
    t || u(1138), this.time.delayedCall(200, () => this._applyScreenResize());
  }
  _applyScreenResize() {
    if (this.scale.isFullscreen) {
      const t = window.innerWidth / window.innerHeight;
      u(Math.round(a * t));
    }
    if (
      (this.scale.setGameSize(n, a),
      this.scale.refresh(),
      this._bg.setSize(n, a),
      (this._pauseBtn.x = n - 30),
      this._menuActive && this._positionMenuItems(),
      this._paused &&
        this._pauseContainer &&
        (this._pauseContainer.destroy(),
        (this._pauseContainer = null),
        this._buildPauseOverlay()),
      this._level.resizeScreen(),
      !this._menuActive)
    ) {
      const t = this._cameraX;
      (this._cameraX = this._playerWorldX - l),
        (this._cameraXRef._v = this._cameraX),
        (this._level.additiveContainer.x = -this._cameraX),
        (this._level.additiveContainer.y = this._cameraY),
        (this._level.container.x = -this._cameraX),
        (this._level.container.y = this._cameraY),
        (this._level.topContainer.x = -this._cameraX),
        (this._level.topContainer.y = this._cameraY),
        this._level.shiftGroundTiles(this._cameraX - t),
        this._level.updateGroundTiles(this._cameraY),
        this._level.updateVisibility(this._cameraX),
        this._level.applyEnterEffects(this._cameraX);
      const e = this._playerWorldX - this._cameraX;
      this._player.syncSprites(this._cameraX, this._cameraY, 0, e);
    }
  }
  _updateBackground() {
    (this._bg.tilePositionX +=
      (this._cameraX - this._prevCameraX) * this._bgSpeedX),
      (this._prevCameraX = this._cameraX),
      (this._bg.tilePositionY = this._bgInitY - this._cameraY * this._bgSpeedY);
  }
  _updateCameraY(t) {
    let e = this._cameraY,
      i = e;
    if (null !== this._level.flyCameraTarget) i = this._level.flyCameraTarget;
    else {
      let t = this._state.y,
        s = 140,
        r = 80,
        n = e - h + 320;
      t > n + s ? (i = t - 320 - s + h) : t < n - r && (i = t - 320 + r + h);
    }
    i < 0 && (i = 0),
      0 !== t &&
        ((e += (i - e) / (10 / t)), e < 0 && (e = 0), (this._cameraY = e));
  }
  _quantizeDelta(t) {
    let e = t / 1e3 + this._deltaBuffer,
      i = Math.round(e / c);
    i < 0 && (i = 0), i > 60 && (i = 60);
    let s = i * c;
    return (this._deltaBuffer = e - s), 60 * s;
  }
  update(t, e) {
    !s.Input.Keyboard.JustDown(this._rKey) ||
      this._paused ||
      this._levelWon ||
      this._menuActive ||
      this._slideIn ||
      this._restartLevel();
    let percentageText,
      completionPercent = (this._playerWorldX / this._level.endXPos) * 100;
    if (
      ((completionPercent = Math.min(100, Math.max(0, completionPercent))),
      this._levelWon)
    ) {
      const interpolatedPercent = this._interpolatedPercent || 0;
      percentageText = this.percentageDecimalsEnabled
        ? interpolatedPercent.toFixed(2) + "%"
        : Math.floor(interpolatedPercent) + "%";
    } else
      percentageText = this.percentageDecimalsEnabled
        ? completionPercent.toFixed(2) + "%"
        : Math.floor(completionPercent) + "%";
    if (
      (this._percentageLabel.setText(percentageText),
      this._percentageLabel.setVisible(
        this.showPercentageEnabled && !this._menuActive,
      ),
      this._noclipIndicator.setVisible(
        1 === window.noclip && !this._menuActive,
      ),
      (this._fpsAccum += e),
      this._fpsFrames++,
      this._fpsAccum >= 250 &&
        (this._fpsText.setText(
          Math.round((1e3 * this._fpsFrames) / this._fpsAccum),
        ),
        (this._fpsAccum = 0),
        (this._fpsFrames = 0)),
      this._paused)
    )
      return void (this._deltaBuffer = 0);
    if (this._menuActive) {
      if ((this._spaceKey.isDown || this._upKey.isDown) && !this._spaceWasDown)
        return (
          (this._spaceWasDown = !0),
          this._audio.playEffect("playSound_01", { volume: 1 }),
          void this._startGame()
        );
      this._spaceWasDown = this._spaceKey.isDown || this._upKey.isDown;
      const t = Math.min((e / 1e3) * 60, 2),
        i = 0.25;
      this._menuCameraX = (this._menuCameraX || 0) + t * d * p * i;
      const s = this._cameraX;
      return (
        (this._cameraX = this._menuCameraX),
        this._updateBackground(),
        (this._cameraX = s),
        (this._prevCameraX = this._menuCameraX),
        (this._cameraXRef._v = this._menuCameraX),
        this._level.stepGroundAnimation(e / 1e3),
        this._level.updateGroundTiles(this._cameraY),
        void this._renderDebugHitboxes()
      );
    }
    if (this._slideIn) {
      const quantizedDelta = this._quantizeDelta(e);
      this._playerWorldX += quantizedDelta * d * p;
      const groundScrollScale = 0.25;
      (this._slideGroundX =
        (this._slideGroundX || this._cameraX) +
        quantizedDelta * d * p * groundScrollScale),
        (this._cameraXRef._v = this._slideGroundX);
      const playerScreenX = this._playerWorldX - this._cameraX;
      if (
        (this._player.updateGroundRotation(quantizedDelta * p),
        this._player.syncSprites(
          this._cameraX,
          this._cameraY,
          e / 1e3,
          playerScreenX,
        ),
        (this._level.additiveContainer.x = -this._cameraX),
        (this._level.additiveContainer.y = this._cameraY),
        (this._level.container.x = -this._cameraX),
        (this._level.container.y = this._cameraY),
        (this._level.topContainer.x = -this._cameraX),
        (this._level.topContainer.y = this._cameraY),
        this._level.updateVisibility(this._cameraX),
        this._updateBackground(),
        this._level.stepGroundAnimation(e / 1e3),
        this._level.updateGroundTiles(this._cameraY),
        this._playerWorldX >= 0)
      ) {
        (this._slideIn = !1),
          (this._deltaBuffer = 0),
          (this._playerWorldX = 0),
          (this._cameraX = this._playerWorldX - l),
          (this._cameraXRef._v = this._cameraX);
        const t = this._cameraX - this._slideGroundX;
        this._level.shiftGroundTiles(t),
          this._firstPlay && ((this._firstPlay = !1), this._audio.startMusic()),
          this._pauseBtn.setVisible(!0).setAlpha(0),
          this.tweens.add({
            targets: this._pauseBtn,
            alpha: 75 / 255,
            duration: 500,
          });
      }
      return void this._renderDebugHitboxes();
    }
    let jumpHeld =
      this._spaceKey.isDown || this._upKey.isDown || this._wKey.isDown;
    if (
      (jumpHeld && !this._spaceWasDown
        ? this._pushButton()
        : !jumpHeld && this._spaceWasDown && this._releaseButton(),
      (this._spaceWasDown = jumpHeld),
      !this.input.activePointer.isDown ||
        this._state.upKeyDown ||
        this._state.isDead ||
        (this._state.upKeyDown = !0),
      this._level.updateEndPortalY(this._cameraY, this._state.isFlying),
      !this._levelWon && !this._state.isDead && this._level.endXPos > 0)
    ) {
      const t = 600;
      this._playerWorldX >= this._level.endXPos - t &&
        ((this._levelWon = !0),
        (this._endPortalGameY = this._level._endPortalGameY || 240),
        this._triggerEndPortal());
    }
    if (this._levelWon) {
      if (((this._deltaBuffer = 0), this._endCamTween)) {
        const t = this._endCamTween;
        (this._cameraX = t.fromX + (t.toX - t.fromX) * t.p),
          (this._cameraY = t.fromY + (t.toY - t.fromY) * t.p);
      }
      return (
        (this._cameraXRef._v = this._cameraX),
        (this._level.additiveContainer.x = -this._cameraX),
        (this._level.additiveContainer.y = this._cameraY),
        (this._level.container.x = -this._cameraX),
        (this._level.container.y = this._cameraY),
        (this._level.topContainer.x = -this._cameraX),
        (this._level.topContainer.y = this._cameraY),
        this._updateBackground(),
        this._level.stepGroundAnimation(e / 1e3),
        this._level.updateGroundTiles(this._cameraY),
        void this._renderDebugHitboxes()
      );
    }
    if (this._state.isDead) {
      if (
        (this._deathSoundPlayed ||
          (this._audio.stopMusic(),
          this._audio.playEffect("explode_11", { volume: 0.65 }),
          (this._deathSoundPlayed = !0)),
        !this._newBestShown)
      ) {
        this._newBestShown = !0;
        let t = this._level.endXPos || 6e3,
          e = this._playerWorldX;
        (this._lastPercent = Math.min(
          99,
          Math.max(0, Math.floor((e / t) * 100)),
        )),
          this._lastPercent > this._bestPercent &&
            ((this._bestPercent = this._lastPercent),
            (this._hadNewBest = !0),
            this._showNewBest());
      }
      this._player.updateExplosionPieces(e), (this._deathTimer += e);
      let t = this._hadNewBest ? 1400 : 1e3;
      return (
        this._renderDebugHitboxes(),
        void (this._deathTimer > t && this._restartLevel())
      );
    }
    (this._playTime += e / 1e3),
      this._audio.update(e / 1e3),
      this._level.updateAudioScale(this._audio.getMeteringValue());
    // Quantize to fixed-size physics slices to match the original GD feel.
    let quantizedDelta = this._quantizeDelta(e),
      physicsSteps =
        quantizedDelta > 0 ? Math.max(1, Math.round(4 * quantizedDelta)) : 0;
    physicsSteps > 60 && (physicsSteps = 60);
    let stepDistance = physicsSteps > 0 ? quantizedDelta / physicsSteps : 0,
      physicsStep = stepDistance * p;
    const previousY = this._state.y;
    for (let stepIndex = 0; stepIndex < physicsSteps; stepIndex++)
      (this._state.lastY = this._state.y),
        this._player.updateJump(physicsStep),
        (this._state.y += this._state.yVelocity * physicsStep),
        this._player.checkCollisions(this._playerWorldX - l),
        (this._playerWorldX += stepDistance * d * p),
        this._state.isFlying ||
          (this._state.onGround
            ? this._player.updateGroundRotation(physicsStep)
            : this._player.rotateActionActive &&
              this._player.updateRotateAction(c));
    if (((this._state.lastY = previousY), !this._endCameraOverride)) {
      const t = this._playerWorldX - l;
      if (this._level.endXPos > 0) {
        const e = this._level.endXPos - n;
        if (t >= e - 200) {
          (this._endCameraOverride = !0), (this._cameraX = t);
          const i = -140 + (this._level._endPortalGameY || 240),
            s = 1.8,
            r = (t) =>
              t < 0.5
                ? Math.pow(2 * t, s) / 2
                : 1 - Math.pow(2 * (1 - t), s) / 2;
          (this._endCamTween = {
            p: 0,
            fromX: this._cameraX,
            toX: e,
            fromY: this._cameraY,
            toY: i,
          }),
            this.tweens.add({
              targets: this._endCamTween,
              p: 1,
              duration: 1200,
              ease: r,
            });
        } else this._cameraX = t;
      } else this._cameraX = t;
    }
    if (this._endCameraOverride && this._endCamTween) {
      const t = this._endCamTween;
      (this._cameraX = t.fromX + (t.toX - t.fromX) * t.p),
        (this._cameraY = t.fromY + (t.toY - t.fromY) * t.p);
    }
    (this._cameraXRef._v = this._cameraX),
      this._endCameraOverride || this._updateCameraY(quantizedDelta),
      (this._level.additiveContainer.x = -this._cameraX),
      (this._level.additiveContainer.y = this._cameraY),
      (this._level.container.x = -this._cameraX),
      (this._level.container.y = this._cameraY),
      (this._level.topContainer.x = -this._cameraX),
      (this._level.topContainer.y = this._cameraY);
    let playerTriggerX = this._playerWorldX;
    for (let trigger of this._level.checkColorTriggers(playerTriggerX))
      this._colorManager.triggerColor(
        trigger.index,
        trigger.color,
        trigger.duration,
      ),
        trigger.tintGround &&
          this._colorManager.triggerColor(Ss, trigger.color, trigger.duration);
    this._colorManager.step(e / 1e3),
      this._bg.setTint(this._colorManager.getHex(bs)),
      this._level.setGroundColor(this._colorManager.getHex(Ss)),
      this._level.updateVisibility(this._cameraX),
      this._level.checkEnterEffectTriggers(playerTriggerX),
      this._level.applyEnterEffects(this._cameraX),
      (this._glitterCenterX = this._cameraX + n / 2),
      (this._glitterCenterY = 460 - this._cameraY),
      this._updateBackground(),
      this._level.stepGroundAnimation(e / 1e3),
      this._level.updateGroundTiles(this._cameraY),
      this._state.isFlying && this._player.updateShipRotation(quantizedDelta);
    const playerScreenX = this._playerWorldX - this._cameraX;
    this._player.syncSprites(
      this._cameraX,
      this._cameraY,
      e / 1e3,
      playerScreenX,
    );
    this._renderDebugHitboxes();
  }
  _renderDebugHitboxes() {
    this._menuActive ||
    this._slideIn ||
    !this._showHitboxes
      ? this._debugGraphics.clear()
      : this._player.drawHitboxes(
          this._debugGraphics,
          this._cameraX,
          this._cameraY,
        );
  }
  _showNewBest() {
    let t = n / 2,
      e = this.add
        .image(0, 0, "GJ_WebSheet", "GJ_newBest_001.png")
        .setOrigin(0.5, 1),
      i = this.add
        .bitmapText(0, 2, "bigFont", this._lastPercent + "%", 65)
        .setOrigin(0.5, 0)
        .setScale(1.1),
      s = this.add
        .container(t, 300, [e, i])
        .setScrollFactor(0)
        .setDepth(60)
        .setScale(0.01);
    this.tweens.add({
      targets: s,
      scale: 1,
      duration: 400,
      ease: "Elastic.Out",
      easeParams: [1, 0.6],
      onComplete: () => {
        this.tweens.add({
          targets: s,
          scale: 0.01,
          duration: 200,
          delay: 700,
          ease: "Quad.In",
          onComplete: () => {
            s.setVisible(!1), s.destroy();
          },
        });
      },
    });
  }
  _triggerEndPortal() {
    this._player.playEndAnimation(
      this._level.endXPos,
      () => this._levelComplete(),
      this._endPortalGameY,
    );
  }
  _levelComplete() {
    const t = this._level.endXPos - this._cameraX,
      e = gameYToScreenY(this._endPortalGameY) + this._cameraY;
    for (let i = 0; i < 5; i++)
      this.time.delayedCall(50 * i, () =>
        spawnPulseRing(this, t, e, 10, n, 500, !1, !0, g),
      );
    spawnPulseRing(this, t, e, 10, 1e3, 500, !0, !1, g),
      this._showCompleteEffect();
  }
  _showCompleteEffect() {
    this._audio.fadeOutMusic(1500),
      this._audio.playEffect("endStart_02", { volume: 0.8 }),
      // Fire a fan of expanding quads behind the portal to mimic the
      // original Geometry Dash clear animation.
      (function (scene, originX, originY) {
        const rayHeight = Math.round(Math.sqrt(n ** 2 + 102400)) + 65,
          baseAlpha = 155 / 255,
          alphaVariance = 100 / 255,
          angleStep = 90 / 8,
          baseAngles = Array.from(
            { length: 8 },
            (unused, index) => index * angleStep - 135,
          );
        for (
          let angleIndex = baseAngles.length - 1;
          angleIndex > 0;
          angleIndex--
        ) {
          const swapIndex = Math.floor(Math.random() * (angleIndex + 1));
          [baseAngles[angleIndex], baseAngles[swapIndex]] = [
            baseAngles[swapIndex],
            baseAngles[angleIndex],
          ];
        }
        let maxStartDelay = 0;
        const rayGraphics = [];
        for (let rayIndex = 0; rayIndex < 8; rayIndex++) {
          const startDelay = 195 * rayIndex + 40 + 40 * (2 * Math.random() - 1),
            beamWidth = 60 + 40 * (2 * Math.random() - 1),
            beamDuration = 180 + 40 * (2 * Math.random() - 1),
            beamAlpha = Math.min(
              1,
              Math.max(0, baseAlpha + alphaVariance * (2 * Math.random() - 1)),
            ),
            beamAngle = baseAngles[rayIndex] + angleStep * Math.random() + 180,
            beamGraphic = scene.add
              .graphics()
              .setScrollFactor(0)
              .setDepth(-1)
              .setBlendMode(M)
              .setPosition(originX, originY)
              .setAngle(beamAngle)
              .setAlpha(beamAlpha)
              .setVisible(!1),
            beamShape = { h: 1, w: 2 };
          scene.time.delayedCall(Math.max(0, startDelay), () => {
            beamGraphic.setVisible(!0),
              scene.tweens.add({
                targets: beamShape,
                h: rayHeight,
                w: beamWidth,
                duration: beamDuration,
                ease: "Quad.Out",
                onUpdate: () => {
                  const tipWidth = 2 + (beamShape.w - 2) / 4;
                  beamGraphic.clear(),
                    beamGraphic.fillStyle(65280, 1),
                    beamGraphic.beginPath(),
                    beamGraphic.moveTo(-tipWidth / 2, 0),
                    beamGraphic.lineTo(tipWidth / 2, 0),
                    beamGraphic.lineTo(beamShape.w / 2, beamShape.h),
                    beamGraphic.lineTo(-beamShape.w / 2, beamShape.h),
                    beamGraphic.closePath(),
                    beamGraphic.fillPath();
                },
              });
          }),
            startDelay > maxStartDelay && (maxStartDelay = startDelay),
            rayGraphics.push(beamGraphic);
        }
        scene.time.delayedCall(maxStartDelay + 400, () => {
          for (const beamGraphic of rayGraphics) {
            const fadeDelay = 200 * Math.random(),
              fadeDuration = 400 + 100 * (2 * Math.random() - 1);
            scene.tweens.add({
              targets: beamGraphic,
              alpha: 0,
              delay: fadeDelay,
              duration: fadeDuration,
              onComplete: () => beamGraphic.destroy(),
            });
          }
        });
      })(
        this,
        this._level.endXPos - this._cameraX + 60,
        gameYToScreenY(this._endPortalGameY) + this._cameraY,
      ),
      this.cameras.main.shake(1950, 0.004),
      this.time.delayedCall(1950, () => this._showCompleteText());
  }
  _showCompleteText() {
    const t = n / 2,
      e = this.add
        .image(t, 250, "GJ_WebSheet", "GJ_levelComplete_001.png")
        .setScrollFactor(0)
        .setDepth(60)
        .setScale(0.01);
    this.tweens.add({
      targets: e,
      scale: 1.1,
      duration: 660,
      ease: "Elastic.Out",
      easeParams: [1, 0.6],
      onComplete: () => {
        this.tweens.add({
          targets: e,
          scale: 0.01,
          duration: 220,
          delay: 880,
          ease: "Quad.In",
          onComplete: () => {
            e.setVisible(!1), e.destroy();
          },
        });
      },
    });
    const i = [g, 16777215];
    for (let n = 0; n < 2; n++)
      this.add
        .particles(t, 250, "GJ_WebSheet", {
          frame: "square.png",
          speed: { min: 300, max: 700 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.4, end: 0.13 },
          lifespan: { min: 0, max: 1e3 },
          quantity: 50,
          stopAfter: 200,
          blendMode: M,
          tint: i[n],
          x: { min: -800, max: 800 },
          y: { min: -80, max: 80 },
        })
        .setScrollFactor(0)
        .setDepth(59);
    const s = this._level.endXPos - this._cameraX,
      r = gameYToScreenY(this._endPortalGameY) + this._cameraY;
    spawnPulseRing(this, s, r, 10, n, 800, !0, !1, g),
      spawnPulseRing(this, t, 250, 10, 1e3, 800, !0, !1, g);
    for (let a = 0; a < 5; a++)
      this.time.delayedCall(50 * a, () =>
        spawnPulseRing(this, s, r, 10, n, 500, !1, !0, g),
      );
    for (let n = 0; n < 10; n++) {
      const t = 150 * n + (160 * Math.random() - 80);
      this.time.delayedCall(Math.max(0, t), () =>
        spawnConfettiBurst(this, g, v),
      );
    }
    this.time.delayedCall(1500, () => this._showEndLayer());
  }
  _showEndLayer() {
    this._pauseBtn &&
      this.tweens.add({ targets: this._pauseBtn, alpha: 0, duration: 300 });
    const centerX = n / 2;
    (this._endLayerOverlay = this.add
      .rectangle(centerX, 320, n, a, 0, 0)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive()),
      (this._endLayerInternal = this.add
        .container(0, -640)
        .setScrollFactor(0)
        .setDepth(201)),
      this.tweens.add({
        targets: this._endLayerOverlay,
        alpha: 100 / 255,
        duration: 1e3,
      });
    const overlayTweenState = { p: 0 };
    this.tweens.add({
      targets: overlayTweenState,
      p: 1,
      duration: 1e3,
      ease: "Bounce.Out",
      onUpdate: () => {
        this._endLayerInternal.y = 650 * overlayTweenState.p - 640;
      },
      onComplete: () => this._playStarAward(),
    });
    const panelLeft = (n - 712) / 2;
    this._endLayerInternal.add(
      this.add.rectangle(panelLeft + 356, 310, 712, 460, 0, 180 / 255),
    );
    const s = this.textures.getFrame("GJ_WebSheet", "GJ_table_side_001.png"),
      r = s ? 460 / s.height : 1;
    this._endLayerInternal.add(
      this.add
        .image(panelLeft - 40, 80, "GJ_WebSheet", "GJ_table_side_001.png")
        .setOrigin(0, 0)
        .setScale(1, r),
    ),
      this._endLayerInternal.add(
        this.add
          .image(
            panelLeft + 712 + 40,
            80,
            "GJ_WebSheet",
            "GJ_table_side_001.png",
          )
          .setOrigin(1, 0)
          .setFlipX(!0)
          .setScale(1, r),
      );
    const o = this.add.image(
      panelLeft + 356,
      70,
      "GJ_WebSheet",
      "GJ_table_top_001.png",
    );
    this._endLayerInternal.add(o),
      this._endLayerInternal.add(
        this.add.image(
          panelLeft + 356,
          560,
          "GJ_WebSheet",
          "GJ_table_bottom_001.png",
        ),
      );
    const h = o.y - 65;
    this._endLayerInternal.add(
      this.add
        .image(centerX - 312, h, "GJ_WebSheet", "chain_01_001.png")
        .setOrigin(0.5, 1),
    ),
      this._endLayerInternal.add(
        this.add
          .image(centerX + 312, h, "GJ_WebSheet", "chain_01_001.png")
          .setOrigin(0.5, 1),
      ),
      this._endLayerInternal.add(
        this.add
          .image(centerX, 170, "GJ_WebSheet", "GJ_levelComplete_001.png")
          .setScale(0.8),
      );
    let l = 250;
    const u = this.add
      .bitmapText(centerX, l, "goldFont", "Attempts: " + this._attempts, 40)
      .setOrigin(0.5, 0.5)
      .setScale(0.8);
    this._endLayerInternal.add(u),
      (l += 48),
      this._endLayerInternal.add(
        this.add
          .bitmapText(centerX, l, "goldFont", "Jumps: " + this._totalJumps, 40)
          .setOrigin(0.5, 0.5)
          .setScale(0.8),
      ),
      (l += 48);
    const c = Math.floor(this._playTime),
      d = Math.floor(c / 3600),
      p = Math.floor((c % 3600) / 60),
      f = c % 60;
    let g;
    g =
      d > 0
        ? String(d).padStart(2, "0") +
          ":" +
          String(p).padStart(2, "0") +
          ":" +
          String(f).padStart(2, "0")
        : String(p).padStart(2, "0") + ":" + String(f).padStart(2, "0");
    const v = l;
    this._endLayerInternal.add(
      this.add
        .bitmapText(centerX, l, "goldFont", "Time: " + g, 40)
        .setOrigin(0.5, 0.5)
        .setScale(0.8),
    );
    const m = [
        "Awesome!",
        "Good\nJob!",
        "Well\nDone!",
        "Impressive!",
        "Amazing!",
        "Incredible!",
        "Skillful!",
        "Brilliant!",
        "Not\nbad!",
        "Warp\nSpeed!",
        "Challenge\nBreaker!",
        "Reflex\nMaster!",
        "I am\nspeechless...",
        "You are...\nThe One!",
        "How is this\npossible!?",
        "You beat\nme...",
      ],
      y = m[Math.floor(Math.random() * m.length)],
      x = 225;
    this._endLayerInternal.add(
      this.add
        .bitmapText(centerX + x, v, "bigFont", y, 40)
        .setOrigin(0.5, 0.5)
        .setScale(0.8)
        .setCenterAlign(),
    ),
      this._endLayerInternal.add(
        this.add
          .image(centerX - x, 352.5, "GJ_WebSheet", "getIt_001.png")
          .setScale(1 / 1.5),
      );
    const _ = [
      {
        key: "downloadApple_001",
        url: "https://apps.apple.com/us/app/geometry-dash/id625334537",
      },
      {
        key: "downloadGoogle_001",
        url: "https://play.google.com/store/apps/details?id=com.robtopx.geometryjump&hl=en",
      },
      {
        key: "downloadSteam_001",
        url: "https://store.steampowered.com/app/322170/Geometry_Dash",
      },
    ];
    for (let n = 0; n < _.length; n++) {
      const e = _[n],
        i = (n - 1) * x,
        s = 1 / 1.5,
        r = this.add
          .image(centerX + i, 437.5, "GJ_WebSheet", e.key + ".png")
          .setScale(s)
          .setInteractive();
      this._endLayerInternal.add(r),
        this._makeBouncyButton(r, s, () => window.open(e.url, "_blank"));
    }
    u.width, (this._endStarX = centerX + x), (this._endStarY = v - 77.5);
    const w = [
      {
        frame: "GJ_replayBtn_001.png",
        dx: -200,
        action: () => this._hideEndLayer(() => this._restartLevel()),
      },
      {
        frame: "GJ_menuBtn_001.png",
        dx: 200,
        action: () => {
          this._audio.playEffect("quitSound_01"),
            this._audio.stopMusic(),
            this.game.registry.set("fadeInFromBlack", !0),
            this.cameras.main.fadeOut(400, 0, 0, 0, (t, e) => {
              e >= 1 && this.scene.restart();
            });
        },
      },
    ];
    for (const n of w) {
      const e = this.add
        .image(centerX + n.dx, 555, "GJ_WebSheet", n.frame)
        .setInteractive();
      this._endLayerInternal.add(e), this._makeBouncyButton(e, 1, n.action);
    }
  }
  _playStarAward() {
    if (!this._endLayerInternal) return;
    const t = this._endStarX,
      e = this._endStarY,
      i = this.add
        .image(t, e, "GJ_WebSheet", "GJ_bigStar_001.png")
        .setScale(3)
        .setAlpha(0);
    this._endLayerInternal.add(i),
      this.tweens.add({
        targets: i,
        scale: 0.8,
        alpha: 1,
        duration: 300,
        delay: 0,
        ease: "Bounce.Out",
      }),
      this.time.delayedCall(100, () => {
        this._audio.playEffect("highscoreGet02");
        const i = t,
          s = e + this._endLayerInternal.y;
        this.add
          .particles(i, s, "GJ_WebSheet", {
            frame: "square.png",
            speed: { min: 200, max: 600 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: { min: 200, max: 600 },
            quantity: 30,
            stopAfter: 30,
            blendMode: M,
            tint: 16776960,
          })
          .setScrollFactor(0)
          .setDepth(202);
        const r = this.add
            .graphics()
            .setScrollFactor(0)
            .setDepth(202)
            .setBlendMode(M),
          n = { t: 0 };
        this.tweens.add({
          targets: n,
          t: 1,
          duration: 400,
          ease: "Quad.Out",
          onUpdate: () => {
            r.clear(),
              r.fillStyle(16776960, 1 - n.t),
              r.fillCircle(i, s, 20 + 200 * n.t);
          },
          onComplete: () => r.destroy(),
        });
      });
  }
  _hideEndLayer(t) {
    if (!this._endLayerInternal) return void (t && t());
    const e = { p: 0 };
    this.tweens.add({
      targets: e,
      p: 1,
      duration: 500,
      ease: (t) =>
        t < 0.5 ? Math.pow(2 * t, 2) / 2 : 1 - Math.pow(2 * (1 - t), 2) / 2,
      onUpdate: () => {
        this._endLayerInternal.y = -640 * e.p;
      },
      onComplete: () => {
        this._endLayerInternal.destroy(),
          (this._endLayerInternal = null),
          this._endLayerOverlay &&
            (this._endLayerOverlay.destroy(), (this._endLayerOverlay = null)),
          t && t();
      },
    }),
      this.tweens.add({
        targets: this._endLayerOverlay,
        alpha: 0,
        duration: 500,
      });
  }
}
