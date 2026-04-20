// Reverse-engineered source mirror extracted from the runtime bundle.
// This file handles Geometry Dash level string decoding and object parsing.

function parseLevelSettings(settingsText) {
  let tokens = settingsText.split(","),
    settings = {};
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 2)
    settings[tokens[tokenIndex]] = tokens[tokenIndex + 1];
  return settings;
}

function parseLevelObjectRecord(objectText) {
  let tokens = objectText.split(","),
    fields = {};
  for (let tokenIndex = 0; tokenIndex + 1 < tokens.length; tokenIndex += 2) {
    let fieldId = tokens[tokenIndex],
      fieldValue = tokens[tokenIndex + 1];
    fields[fieldId] = fieldValue;
  }

  let objectId = parseInt(fields[1] || "0", 10);
  return 0 === objectId
    ? null
    : {
        id: objectId,
        x: parseFloat(fields[2] || "0"),
        y: parseFloat(fields[3] || "0"),
        flipX: "1" === fields[4],
        flipY: "1" === fields[5],
        rot: parseFloat(fields[6] || "0"),
        scale: parseFloat(fields[32] || "1"),
        zLayer: parseInt(fields[24] || "0", 10),
        zOrder: parseInt(fields[25] || "0", 10),
        groups: fields[57] || "",
        color1: parseInt(fields[21] || "0", 10),
        color2: parseInt(fields[22] || "0", 10),
        gameMode: parseInt(fields.kA2 ?? "0", 10),
        flipGravity: "1" === (fields.kA11 ?? "0"),
        _raw: fields,
      };
}

function decodeWebSafeBase64(encodedText) {
  if ("string" != typeof encodedText) return "";
  let normalizedBase64 = encodedText.trim().replace(/-/g, "+").replace(/_/g, "/");
  for (; normalizedBase64.length % 4 !== 0; ) normalizedBase64 += "=";
  return normalizedBase64;
}

function inflateLevelString(encodedLevelData) {
  if ("string" != typeof encodedLevelData || "" === encodedLevelData.trim() || "-1" === encodedLevelData.trim())
    return "";
  let base64Text = decodeWebSafeBase64(encodedLevelData),
    binaryText = atob(base64Text),
    compressedBytes = new Uint8Array(binaryText.length);
  for (let byteIndex = 0; byteIndex < binaryText.length; byteIndex++)
    compressedBytes[byteIndex] = binaryText.charCodeAt(byteIndex);

  let inflatedBytes = window.pako.inflate(compressedBytes);
  return new TextDecoder().decode(inflatedBytes);
}

function decodeLevelData(encodedLevelData) {
  if ("string" != typeof encodedLevelData || "" === encodedLevelData.trim() || "-1" === encodedLevelData.trim())
    return { settings: {}, objects: [] };
  let decodedSections = inflateLevelString(encodedLevelData).split(";"),
    objects = [],
    settings = parseLevelSettings(decodedSections.length > 0 ? decodedSections[0] : "");

  for (
    let sectionIndex = 1;
    sectionIndex < decodedSections.length;
    sectionIndex++
  ) {
    if (0 === decodedSections[sectionIndex].length) continue;
    let levelObject = parseLevelObjectRecord(decodedSections[sectionIndex]);
    levelObject && objects.push(levelObject);
  }

  return { settings, objects };
}
