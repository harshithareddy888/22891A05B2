# Logging Middleware

This folder contains a simple Logging Middleware definition and reference implementation that matches the frontend’s expected signature.

The frontend (see `src/utils/logger.js`) will call a global function if available:

- Signature: `Log(stack, level, pkg, message)`
- Example: `window.Log(stackTrace, 'INFO', 'url-short-frontend', 'Short URL created: abc123')`

You can implement the middleware in any environment (browser or server). Below is a browser-friendly reference in `middleware.js` that you can import or inject. You can also adapt it to send logs to a backend endpoint.

## Files
- `middleware.js` — A reference implementation that:
  - Attaches `window.Log` if not already defined.
  - Buffers logs and prints them to the console.
  - Provides a hook to ship logs to a backend endpoint.

## Integrating with the Frontend
1. Include `middleware.js` into the app (e.g., via a `<script>` tag in `public/index.html`), or import it early in your app bootstrap (`src/index.js`).
2. Optionally configure a backend endpoint for shipping logs.

## Backend Shipping (Optional)
- If you want to persist logs, set `LOG_ENDPOINT` in `middleware.js` to your server route. The reference uses `fetch` to POST logs in batches.

