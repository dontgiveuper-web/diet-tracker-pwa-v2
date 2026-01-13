self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("diet-v2").then(c =>
      c.addAll([
        "./",
        "./index.html",
        "./app.js",
        "./foods-db.json",
        "./manifest.json"
      ])
    )
  );
});
