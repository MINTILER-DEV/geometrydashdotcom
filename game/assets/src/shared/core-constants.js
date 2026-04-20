// Reverse-engineered source mirror extracted from the runtime bundle.
// This file groups global gameplay constants, shared coordinate helpers, the bitmap font loader,
// the boot scene, player state, and texture lookup helpers.
// It intentionally stops before the bundled pako runtime starts.
const s = window.Phaser;
const r = window.Phaser;

let GAME_WIDTH = Math.round(10240 / 9);
const GAME_HEIGHT = 640,
  TARGET_FPS = 60,
  CAMERA_VERTICAL_PADDING = 180;
let PLAYER_SCREEN_OFFSET_X = GAME_WIDTH / 2 - 150;

// The game keeps the player a fixed distance from the left side of the screen.
function setGameWidth(nextGameWidth) {
  (GAME_WIDTH = nextGameWidth),
    (PLAYER_SCREEN_OFFSET_X = nextGameWidth / 2 - 150),
    (n = GAME_WIDTH),
    (l = PLAYER_SCREEN_OFFSET_X);
}

function syncBlendModeAliases() {
  M = ADDITIVE_BLEND_MODE;
  P = NORMAL_BLEND_MODE;
}
const FIXED_TIME_STEP_SECONDS = 1 / 240,
  BASE_PLAYER_SPEED = 11.540004,
  GAMEPLAY_SPEED_SCALE = 0.9,
  BASE_GRAVITY_ACCELERATION = 1.916398,
  PRIMARY_GLOW_TINT = 65280,
  SECONDARY_GLOW_TINT = 65535,
  COLLISION_TYPE_SOLID = "solid",
  COLLISION_TYPE_HAZARD = "hazard",
  PAD_TYPE_YELLOW = "yellow_pad",
  RING_TYPE_YELLOW = "yellow_ring",
  PAD_TYPE_BLUE = "blue_pad",
  RING_TYPE_BLUE = "blue_ring",
  PORTAL_MODE_SHIP = "portal_fly",
  PORTAL_MODE_CUBE = "portal_cube",
  PORTAL_MODE_FLIP = "portal_flip",
  PORTAL_MODE_NORMAL = "portal_normal";

function gameYToScreenY(gameY) {
  return 460 - gameY;
}
let ADDITIVE_BLEND_MODE = s.BlendModes.ADD,
  NORMAL_BLEND_MODE = s.BlendModes.NORMAL;
const OBJECT_GROUP_SOLID = "solid",
  OBJECT_GROUP_HAZARD = "hazard",
  OBJECT_GROUP_DECORATION = "deco",
  OBJECT_GROUP_PORTAL = "portal",
  OBJECT_GROUP_PAD = "pad",
  OBJECT_GROUP_RING = "ring",
  OBJECT_GROUP_GRAVITY_PAD = "gravpad",
  OBJECT_GROUP_GRAVITY_RING = "gravring",
  OBJECT_GROUP_TRIGGER = "trigger",
  OBJECT_GROUP_START_POS = "startpos",
  OBJECT_GROUP_SPEED = "speed";

// Compatibility aliases preserved so the split runtime can execute while some
// reverse-engineered files still reference legacy bundle variable names.
let n = GAME_WIDTH;
const a = GAME_HEIGHT,
  o = TARGET_FPS,
  h = CAMERA_VERTICAL_PADDING;
let l = PLAYER_SCREEN_OFFSET_X;
const c = FIXED_TIME_STEP_SECONDS,
  d = BASE_PLAYER_SPEED,
  p = GAMEPLAY_SPEED_SCALE,
  f = BASE_GRAVITY_ACCELERATION,
  g = PRIMARY_GLOW_TINT,
  v = SECONDARY_GLOW_TINT,
  m = COLLISION_TYPE_SOLID,
  y = COLLISION_TYPE_HAZARD,
  x = PAD_TYPE_YELLOW,
  _ = RING_TYPE_YELLOW,
  w = PAD_TYPE_BLUE,
  T = RING_TYPE_BLUE,
  b = PORTAL_MODE_SHIP,
  S = PORTAL_MODE_CUBE,
  E = PORTAL_MODE_FLIP,
  A = PORTAL_MODE_NORMAL,
  R = OBJECT_GROUP_SOLID,
  L = OBJECT_GROUP_HAZARD,
  O = OBJECT_GROUP_DECORATION,
  F = OBJECT_GROUP_PORTAL,
  D = OBJECT_GROUP_PAD,
  k = OBJECT_GROUP_RING,
  I = OBJECT_GROUP_GRAVITY_PAD,
  B = OBJECT_GROUP_GRAVITY_RING,
  N = OBJECT_GROUP_TRIGGER,
  X = OBJECT_GROUP_START_POS,
  G = OBJECT_GROUP_SPEED;
let M = ADDITIVE_BLEND_MODE,
  P = NORMAL_BLEND_MODE;
// Bitmap font loader for AngelCode .fnt metadata shipped with the web port.
function loadBitmapFontFromFnt(scene, textureKey, fontMetadataText) {
  const texture = scene.textures.get(textureKey),
    textureSource = texture.source[0],
    textureWidth = textureSource.width,
    textureHeight = textureSource.height,
    bitmapFontData = { font: textureKey, size: 0, lineHeight: 0, chars: {} },
    kerningPairs = [];
  for (const metadataLine of fontMetadataText.split("\n")) {
    const tokens = metadataLine.trim().split(/\s+/);
    if (!tokens.length) continue;
    const recordType = tokens[0],
      recordFields = {};
    for (let tokenIndex = 1; tokenIndex < tokens.length; tokenIndex++) {
      const separatorIndex = tokens[tokenIndex].indexOf("=");
      separatorIndex >= 0 &&
        (recordFields[tokens[tokenIndex].slice(0, separatorIndex)] = tokens[
          tokenIndex
        ]
          .slice(separatorIndex + 1)
          .replace(/^"|"$/g, ""));
    }

    if ("info" === recordType)
      bitmapFontData.size = parseInt(recordFields.size, 10);
    else if ("common" === recordType)
      bitmapFontData.lineHeight = parseInt(recordFields.lineHeight, 10);
    else if ("char" === recordType) {
      const characterCode = parseInt(recordFields.id, 10),
        frameX = parseInt(recordFields.x, 10),
        frameY = parseInt(recordFields.y, 10),
        frameWidth = parseInt(recordFields.width, 10),
        frameHeight = parseInt(recordFields.height, 10),
        u0 = frameX / textureWidth,
        v0 = frameY / textureHeight,
        u1 = (frameX + frameWidth) / textureWidth,
        v1 = (frameY + frameHeight) / textureHeight;
      if (
        ((bitmapFontData.chars[characterCode] = {
          x: frameX,
          y: frameY,
          width: frameWidth,
          height: frameHeight,
          centerX: Math.floor(frameWidth / 2),
          centerY: Math.floor(frameHeight / 2),
          xOffset: parseInt(recordFields.xoffset, 10),
          yOffset: parseInt(recordFields.yoffset, 10),
          xAdvance: parseInt(recordFields.xadvance, 10),
          data: {},
          kerning: {},
          u0,
          v0,
          u1,
          v1,
        }),
        0 !== frameWidth && 0 !== frameHeight)
      ) {
        const character = String.fromCharCode(characterCode),
          textureFrame = texture.add(
            character,
            0,
            frameX,
            frameY,
            frameWidth,
            frameHeight,
          );
        textureFrame &&
          textureFrame.setUVs(frameWidth, frameHeight, u0, v0, u1, v1);
      }
    } else
      "kerning" === recordType &&
        kerningPairs.push({
          first: parseInt(recordFields.first, 10),
          second: parseInt(recordFields.second, 10),
          amount: parseInt(recordFields.amount, 10),
        });
  }
  for (const kerningPair of kerningPairs)
    bitmapFontData.chars[kerningPair.second] &&
      (bitmapFontData.chars[kerningPair.second].kerning[kerningPair.first] =
        kerningPair.amount);
  scene.cache.bitmapFont.add(textureKey, {
    data: bitmapFontData,
    texture: textureKey,
    frame: null,
  });
}
// Asset preload and one-time renderer setup.
class BootScene extends s.Scene {
  constructor() {
    super({ key: "BootScene" });
  }
  preload() {
    !(function (game) {
      if (game.renderer.type === s.WEBGL) {
        let glContext = game.renderer.gl;
        (customAdditiveBlendMode = game.renderer.addBlendMode(
          [glContext.SRC_ALPHA, glContext.ONE],
          glContext.FUNC_ADD,
        )),
          (ADDITIVE_BLEND_MODE = customAdditiveBlendMode),
          (function (normalBlendMode) {
            NORMAL_BLEND_MODE = normalBlendMode;
          })(
            game.renderer.addBlendMode(
              [glContext.DST_COLOR, glContext.ONE_MINUS_SRC_ALPHA],
              glContext.FUNC_ADD,
            ),
          );
        syncBlendModeAliases();
      }
      var customAdditiveBlendMode;
    })(this.game);
    let viewportWidth = this.cameras.main.width,
      viewportHeight = this.cameras.main.height,
      progressBarWidth = 0.6 * viewportWidth,
      progressBar = this.add
        .rectangle(
          viewportWidth / 2,
          viewportHeight / 2,
          progressBarWidth,
          8,
          PRIMARY_GLOW_TINT,
        )
        .setOrigin(0.5, 0.5);
    (progressBar.scaleX = 0),
      this.load.on("progress", (progressValue) => {
        progressBar.scaleX = progressValue;
      }),
      this.load.on("loaderror", (file) => {}),
      this.load.atlas(
        "GJ_WebSheet",
        "assets/GJ_WebSheet.png",
        "assets/GJ_WebSheet.json",
      ),
      this.load.atlas(
        "GJ_GameSheet",
        "assets/GJ_GameSheet.png",
        "assets/GJ_GameSheet.json",
      ),
      this.load.atlas(
        "GJ_GameSheet02",
        "assets/GJ_GameSheet02.png",
        "assets/GJ_GameSheet02.json",
      ),
      this.load.atlas(
        "GJ_GameSheet03",
        "assets/GJ_GameSheet03.png",
        "assets/GJ_GameSheet03.json",
      ),
      this.load.atlas(
        "GJ_GameSheet04",
        "assets/GJ_GameSheet04.png",
        "assets/GJ_GameSheet04.json",
      ),
      this.load.image("bigFont", "assets/bigFont.png"),
      this.load.text("bigFontFnt", "assets/bigFont.fnt"),
      this.load.image("goldFont", "assets/goldFont.png"),
      this.load.text("goldFontFnt", "assets/goldFont.fnt"),
      this.load.image("game_bg_01", "assets/game_bg_01_001.png"),
      this.load.image("sliderBar", "assets/sliderBar.png"),
      this.load.image("square04_001", "assets/square04_001.png"),
      this.load.image("GJ_square02", "assets/GJ_square02.png"),
      this.load.text("level_1", "assets/1.txt"),
      this.load.audio("stereo_madness", "assets/StereoMadness.mp3"),
      this.load.audio("explode_11", "assets/explode_11.ogg"),
      this.load.audio("endStart_02", "assets/endStart_02.ogg"),
      this.load.audio("playSound_01", "assets/playSound_01.ogg"),
      this.load.audio("quitSound_01", "assets/quitSound_01.ogg"),
      this.load.audio("highscoreGet02", "assets/highscoreGet02.ogg");
  }
  create() {
    this.cache.text.get("level_1");
    const bigFontMetadata = this.cache.text.get("bigFontFnt");
    bigFontMetadata && loadBitmapFontFromFnt(this, "bigFont", bigFontMetadata);
    const goldFontMetadata = this.cache.text.get("goldFontFnt");
    goldFontMetadata &&
      loadBitmapFontFromFnt(this, "goldFont", goldFontMetadata),
      this.scene.start("GameScene");
  }
}
// Mutable player physics flags shared between the runtime player object and the scene.
class PlayerState {
  constructor() {
    this.reset();
  }
  reset() {
    (this.y = 30),
      (this.lastY = 30),
      (this.lastGroundPosY = 30),
      (this.yVelocity = 0),
      (this.onGround = !0),
      (this.canJump = !0),
      (this.isJumping = !1),
      (this.gravityFlipped = !1),
      (this.isFlying = !1),
      (this.wasBoosted = !1),
      (this.collideTop = 0),
      (this.collideBottom = 0),
      (this.onCeiling = !1),
      (this.upKeyDown = !1),
      (this.upKeyPressed = !1),
      (this.isDead = !1);
  }
}
// Atlas search order used when frame names are reused across multiple sheets.
const ATLAS_SEARCH_ORDER = [
  "GJ_WebSheet",
  "GJ_GameSheet",
  "GJ_GameSheet02",
  "GJ_GameSheet03",
  "GJ_GameSheet04",
  "GJ_GameSheetGlow",
];
function findTextureFrame(scene, frameName) {
  for (let atlasKey of ATLAS_SEARCH_ORDER)
    if (
      scene.textures.exists(atlasKey) &&
      scene.textures.get(atlasKey).has(frameName)
    )
      return { atlas: atlasKey, frame: frameName };
  return null;
}
function createTextureImage(scene, x, y, textureOrFrameName) {
  let frameReference = findTextureFrame(scene, textureOrFrameName);
  return frameReference
    ? scene.add.image(x, y, frameReference.atlas, frameReference.frame)
    : scene.textures.exists(textureOrFrameName)
      ? scene.add.image(x, y, textureOrFrameName)
      : null;
}
class LevelHitbox {
  constructor(type, x, y, width, height) {
    (this.type = type),
      (this.x = x),
      (this.y = y),
      (this.w = width),
      (this.h = height),
      (this.activated = !1);
  }
}
