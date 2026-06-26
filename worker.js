let levelID = null;

self.addEventListener('message', event => {
  if (Number.isFinite(event.data?.levelId)) {
    levelID = Number(event.data.levelId);
  }
});

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

async function resolveRequestedLevelId(event) {
  if (Number.isFinite(levelID)) return levelID;
  try {
    if (event.clientId) {
      const client = await self.clients.get(event.clientId);
      if (client?.url) {
        const clientLevelId = Number(new URL(client.url).searchParams.get("id"));
        if (Number.isFinite(clientLevelId)) return clientLevelId;
      }
    }
    const referrer = event.request.referrer;
    if (referrer) {
      const referrerLevelId = Number(new URL(referrer).searchParams.get("id"));
      if (Number.isFinite(referrerLevelId)) return referrerLevelId;
    }
  } catch {}
  return null;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.includes("1.txt") && !url.pathname.includes("StereoMadness.mp3")) {
    return;
  }
  event.respondWith((async () => {
    const requestedLevelId = await resolveRequestedLevelId(event);
    if (!Number.isFinite(requestedLevelId)) {
      return fetch(event.request);
    }

    if (requestedLevelId < 0) {
      if (url.pathname.includes("1.txt")) {
        return fetch(`/geometrydashdotcom/game/assets/levels/${requestedLevelId}.txt`);
      }

      if (url.pathname.includes("StereoMadness.mp3")) {
        return fetch(`/geometrydashdotcom/game/assets/music/${requestedLevelId}.mp3`);
      }
    }

    if (requestedLevelId >= 0) {
      if (url.pathname.includes("1.txt")) {
        return handleLevelRequest(requestedLevelId);
      }

      if (url.pathname.includes("StereoMadness.mp3")) {
        return fetch(`https://getlevelsong.lasokar.workers.dev?id=${requestedLevelId}`);
      }
    }

    return fetch(event.request);
  })());
});

async function handleLevelRequest(targetLevelId) {
  const res = await fetch(
    `https://getleveldata.lasokar.workers.dev?id=${targetLevelId}`
  );
  
  const data = await res.json();

  if (data.error) {
    self.clients.matchAll().then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: data.error === "rate-limit" ? "rate-limit" : "invalid-id" });
      }
    });
    return new Response("-1");
  }

  self.clients.matchAll().then((clients) => {
    for (const client of clients) {
      client.postMessage({ 
        type: "set-level-name", 
        name: data["name"] 
      });
    }
  });

  return new Response(data["data"]);
}
