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

function getElementChildren(node) {
  return Array.from(node.childNodes).filter((childNode) => childNode.nodeType === 1);
}

function parsePlistValueNode(valueNode) {
  switch (valueNode.tagName) {
    case "dict":
      return parsePlistDictNode(valueNode);
    case "array":
      return getElementChildren(valueNode).map(parsePlistValueNode);
    case "string":
      return valueNode.textContent || "";
    case "integer":
      return parseInt(valueNode.textContent || "0", 10);
    case "real":
      return parseFloat(valueNode.textContent || "0");
    case "true":
      return !0;
    case "false":
      return !1;
    default:
      return valueNode.textContent || "";
  }
}

function parsePlistDictNode(dictNode) {
  const childElements = getElementChildren(dictNode),
    parsedObject = {};
  for (let childIndex = 0; childIndex < childElements.length; childIndex += 2) {
    const keyNode = childElements[childIndex],
      valueNode = childElements[childIndex + 1];
    keyNode &&
      valueNode &&
      "key" === keyNode.tagName &&
      (parsedObject[keyNode.textContent || ""] = parsePlistValueNode(valueNode));
  }
  return parsedObject;
}

function parsePlistDocument(plistText) {
  const plistDocument = new DOMParser().parseFromString(plistText, "application/xml"),
    parseErrorNode = plistDocument.querySelector("parsererror");
  if (parseErrorNode)
    throw new Error("Failed to parse plist atlas data: " + parseErrorNode.textContent);
  const plistRoot = plistDocument.querySelector("plist > dict");
  if (!plistRoot) throw new Error("Invalid plist atlas document");
  return parsePlistDictNode(plistRoot);
}

function parsePlistTuple(tupleText) {
  return (tupleText.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}

function buildSpriteSourceOffset(
  sourceWidth,
  sourceHeight,
  trimmedWidth,
  trimmedHeight,
  spriteOffsetX,
  spriteOffsetY,
) {
  return {
    x: Math.round((sourceWidth - trimmedWidth) / 2 + spriteOffsetX),
    y: Math.round((sourceHeight - trimmedHeight) / 2 - spriteOffsetY),
  };
}

function convertPlistAtlasToPhaserHash(plistText) {
  const plistData = parsePlistDocument(plistText),
    frameEntries = plistData.frames || {},
    convertedFrames = {};
  for (const [frameName, frameData] of Object.entries(frameEntries)) {
    const textureRectValues = parsePlistTuple(frameData.textureRect || ""),
      spriteSizeValues = parsePlistTuple(frameData.spriteSize || ""),
      sourceSizeValues = parsePlistTuple(frameData.spriteSourceSize || ""),
      spriteOffsetValues = parsePlistTuple(frameData.spriteOffset || ""),
      sourceWidth = sourceSizeValues[0] || spriteSizeValues[0] || textureRectValues[2] || 0,
      sourceHeight = sourceSizeValues[1] || spriteSizeValues[1] || textureRectValues[3] || 0,
      trimmedWidth = spriteSizeValues[0] || textureRectValues[2] || 0,
      trimmedHeight = spriteSizeValues[1] || textureRectValues[3] || 0,
      spriteOffsetX = spriteOffsetValues[0] || 0,
      spriteOffsetY = spriteOffsetValues[1] || 0,
      spriteSourceOffset = buildSpriteSourceOffset(
        sourceWidth,
        sourceHeight,
        trimmedWidth,
        trimmedHeight,
        spriteOffsetX,
        spriteOffsetY,
      ),
      isRotated = !!frameData.textureRotated,
      atlasFrameWidth = isRotated
        ? textureRectValues[3] || trimmedHeight
        : textureRectValues[2] || trimmedWidth,
      atlasFrameHeight = isRotated
        ? textureRectValues[2] || trimmedWidth
        : textureRectValues[3] || trimmedHeight,
      isTrimmed =
        spriteSourceOffset.x !== 0 ||
        spriteSourceOffset.y !== 0 ||
        trimmedWidth !== sourceWidth ||
        trimmedHeight !== sourceHeight;
    convertedFrames[frameName] = {
      frame: {
        x: textureRectValues[0] || 0,
        y: textureRectValues[1] || 0,
        w: atlasFrameWidth,
        h: atlasFrameHeight,
      },
      rotated: isRotated,
      trimmed: isTrimmed,
      spriteSourceSize: {
        x: spriteSourceOffset.x,
        y: spriteSourceOffset.y,
        w: trimmedWidth,
        h: trimmedHeight,
      },
      sourceSize: {
        w: sourceWidth,
        h: sourceHeight,
      },
      gjSpriteOffset: {
        x: spriteOffsetX,
        y: spriteOffsetY,
      },
    };
  }
  return {
    frames: convertedFrames,
    meta: {
      image:
        (plistData.metadata && plistData.metadata.textureFileName) || "atlas.png",
      size: {
        w: parsePlistTuple((plistData.metadata && plistData.metadata.size) || "{0,0}")[0] || 0,
        h: parsePlistTuple((plistData.metadata && plistData.metadata.size) || "{0,0}")[1] || 0,
      },
      scale: "1",
    },
  };
}

function buildAtlasFromPlist(scene, atlasKey, rawImageKey, plistCacheKey) {
  if (scene.textures.exists(atlasKey)) return;
  const rawTexture = scene.textures.get(rawImageKey),
    plistText = scene.cache.text.get(plistCacheKey);
  if (!rawTexture || !plistText)
    throw new Error("Missing raw atlas assets for " + atlasKey);
  const sourceImage = rawTexture.source[0].image,
    atlasData = convertPlistAtlasToPhaserHash(plistText),
    texture = scene.textures.addAtlasJSONHash(atlasKey, sourceImage, atlasData);
  for (const [frameName, frameConfig] of Object.entries(atlasData.frames)) {
    const frame = texture.get(frameName);
    frame &&
      (frame.customData = {
        ...(frame.customData || {}),
        gjSpriteOffset: frameConfig.gjSpriteOffset,
        spriteSourceSize: frameConfig.spriteSourceSize,
      });
  }
}
const FIXED_TIME_STEP_SECONDS = 1 / 240,
  BASE_PLAYER_SPEED = 11.540004,
  GAMEPLAY_SPEED_SCALE = 0.9,
  BASE_GRAVITY_ACCELERATION = 1.916398,
  BALL_GRAVITY_ACCELERATION = 1.7,
  PRIMARY_GLOW_TINT = 65280,
  SECONDARY_GLOW_TINT = 65535,
  PLAYER_MODE_CUBE = "cube",
  PLAYER_MODE_SHIP = "ship",
  PLAYER_MODE_BALL = "ball",
  COLLISION_TYPE_SOLID = "solid",
  COLLISION_TYPE_HAZARD = "hazard",
  PAD_TYPE_YELLOW = "yellow_pad",
  RING_TYPE_YELLOW = "yellow_ring",
  PAD_TYPE_BLUE = "blue_pad",
  RING_TYPE_BLUE = "blue_ring",
  PORTAL_MODE_SHIP = "portal_fly",
  PORTAL_MODE_CUBE = "portal_cube",
  PORTAL_MODE_BALL = "portal_ball",
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
  U = BALL_GRAVITY_ACCELERATION,
  g = PRIMARY_GLOW_TINT,
  v = SECONDARY_GLOW_TINT,
  q = PLAYER_MODE_CUBE,
  H = PLAYER_MODE_SHIP,
  j = PLAYER_MODE_BALL,
  m = COLLISION_TYPE_SOLID,
  y = COLLISION_TYPE_HAZARD,
  x = PAD_TYPE_YELLOW,
  _ = RING_TYPE_YELLOW,
  w = PAD_TYPE_BLUE,
  T = RING_TYPE_BLUE,
  b = PORTAL_MODE_SHIP,
  S = PORTAL_MODE_CUBE,
  Y = PORTAL_MODE_BALL,
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
    const officialLevelId =
        "number" == typeof window.levelId && window.levelId < 0
          ? window.levelId
          : null,
      levelTextPath =
        null !== officialLevelId
          ? `assets/levels/${officialLevelId}.txt`
          : "assets/1.txt",
      musicPath =
        null !== officialLevelId
          ? `assets/music/${officialLevelId}.mp3`
          : "assets/StereoMadness.mp3";
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
      this.load.image(
        "PlayerBallIconRaw",
        "assets/extraicons/player_ball_00-hd.png",
      ),
      this.load.text(
        "PlayerBallIconPlist",
        "assets/extraicons/player_ball_00-hd.plist",
      ),
      this.load.image("bigFont", "assets/bigFont.png"),
      this.load.text("bigFontFnt", "assets/bigFont.fnt"),
      this.load.image("goldFont", "assets/goldFont.png"),
      this.load.text("goldFontFnt", "assets/goldFont.fnt"),
      this.load.image("game_bg_01", "assets/game_bg_01_001.png"),
      this.load.image("sliderBar", "assets/sliderBar.png"),
      this.load.image("square04_001", "assets/square04_001.png"),
      this.load.image("GJ_square02", "assets/GJ_square02.png"),
      this.load.text("level_1", levelTextPath),
      this.load.audio("stereo_madness", musicPath),
      this.load.audio("explode_11", "assets/explode_11.ogg"),
      this.load.audio("endStart_02", "assets/endStart_02.ogg"),
      this.load.audio("playSound_01", "assets/playSound_01.ogg"),
      this.load.audio("quitSound_01", "assets/quitSound_01.ogg"),
      this.load.audio("highscoreGet02", "assets/highscoreGet02.ogg");
  }
  create() {
    this.cache.text.get("level_1");
    buildAtlasFromPlist(this, "PlayerBallIcon", "PlayerBallIconRaw", "PlayerBallIconPlist");
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
      (this.mode = q),
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

function decodeStartPositionMode(gameModeValue) {
  return 1 === gameModeValue ? H : 2 === gameModeValue ? j : q;
}
// Atlas search order used when frame names are reused across multiple sheets.
const ATLAS_SEARCH_ORDER = [
  "PlayerBallIcon",
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
