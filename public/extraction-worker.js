// Service worker for text extraction from screen capture
// This helps with cross-tab functionality and global key listening

// Cache name for offline support
const CACHE_NAME = "text-extraction-cache-v1";

// Install event - cache basic resources
self.addEventListener("install", (event) => {
  console.log("Extraction service worker installed");

  // Skip waiting to activate immediately
  self.skipWaiting();

  // Cache basic assets
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/index.html", "/extraction-worker.js"]);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Extraction service worker activated");

  // Claim clients immediately
  event.waitUntil(clients.claim());

  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data) {
    console.log("Service worker received message:", event.data);

    // Start monitoring keyboard events globally
    if (event.data.type === "START_MONITORING") {
      const extractionKey = event.data.extractionKey || "t";
      console.log(
        `Service worker now monitoring for ${extractionKey} key presses`
      );

      // Note: Service workers can't directly monitor keyboard input,
      // this is just a message handler showing we've received the request
    }

    // Handle extraction broadcast
    if (event.data.type === "BROADCAST_EXTRACTION") {
      console.log("Broadcasting extraction to all clients");

      // Notify all clients about the new extraction
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          // Don't send back to the original sender
          if (client.id !== event.source.id) {
            client.postMessage({
              type: "NEW_EXTRACTION",
              extraction: event.data.extraction,
            });
          }
        });
      });
    }
  }
});

// Handle fetch requests - simple offline fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
