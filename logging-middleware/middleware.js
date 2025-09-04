(function attachLoggingMiddleware() {
  if (typeof window === 'undefined') return;
  if (window.Log && typeof window.Log === 'function') return;

  const BUFFER = [];
  const MAX_BUFFER = 100;
  const FLUSH_INTERVAL_MS = 5000;
  const LOG_ENDPOINT = null;

  function safeConsole(level, payload) {
    const line = `[${new Date().toISOString()}] [${level}] [${payload.pkg}] ${payload.message}`;
    try {
      
      (console[level.toLowerCase()] || console.log)(line, payload.stack);
    } catch (_) {}
  }

  async function flush() {
    if (!LOG_ENDPOINT || BUFFER.length === 0) return;
    const toSend = BUFFER.splice(0, BUFFER.length);
    try {
      await fetch(LOG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: toSend }),
      });
    } catch (_) {}
  }

  setInterval(flush, FLUSH_INTERVAL_MS);

  window.Log = function Log(stack, level, pkg, message) {
    const payload = {
      ts: Date.now(),
      level: String(level || 'INFO'),
      pkg: String(pkg || 'app'),
      message: String(message || ''),
      stack: stack || null,
    };
    BUFFER.push(payload);
    if (BUFFER.length > MAX_BUFFER) BUFFER.shift();
    safeConsole(payload.level, payload);
  };
})();
