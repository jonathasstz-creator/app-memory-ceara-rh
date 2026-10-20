// Guarda o jogo no tablet pra abrir sem internet. O build.py troca a versão a cada publicação.
const CACHE = "app-memory-2a9e97ff7f";
const ARQUIVOS = ["./", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ARQUIVOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("app-memory-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Responde do cache na hora (funciona em modo avião) e, se tiver rede, atualiza o cache pra próxima abertura.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const chave = req.mode === "navigate" ? "./" : req;
  const rede = fetch(req).then(async (res) => {
    if (res.ok) await (await caches.open(CACHE)).put(chave, res.clone());
    return res;
  });
  e.waitUntil(rede.catch(() => {}));
  e.respondWith(caches.match(chave, { ignoreSearch: true }).then((hit) => hit || rede));
});
