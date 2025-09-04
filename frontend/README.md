# Frontend: URL Shortener

This is the guide to run and test the frontend app.

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
```bash
npm install
npm start
```
The dev server runs at `http://localhost:3000`.

## Short Link Base
The displayed/copy URL base is resolved in this order:
1) `REACT_APP_SHORT_BASE` in `.env`
2) `localStorage['short_base']`
3) Default: in dev it may resolve to `http://short` if configured, otherwise current origin

You can override in dev from the browser console, then refresh:
```js
localStorage.setItem('short_base', 'http://localhost:3000')
```

## Features to Verify
- Unique shortcode generation (random when no token provided)
- Custom token is always jumbled (e.g., `mytag-AB12c`)
- Copy button copies the generated short URL
- Dashboard is public (no auth)
- Redirect page resolves shortcodes and forwards to the long URL

For step-by-step test cases, see `manual-test-cases.md`.
