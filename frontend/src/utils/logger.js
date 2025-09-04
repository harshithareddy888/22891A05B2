// Logging utility that uses the provided Logging Middleware if available.
// Required signature: Log(stack, level, package, message)
// We will safely call window.Log if present; otherwise, store logs in localStorage fallback.

export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const LOG_STORAGE_KEY = 'url_shortener_logs_v1';
const PACKAGE_NAME = 'url-short-frontend';

function persistFallbackLog(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
    existing.push(entry);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(existing));
  } catch (_) {
    // Swallow all logging errors (no console usage allowed)
  }
}

export function log(level, message, stack) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    package: PACKAGE_NAME,
    message,
    stack: stack || new Error().stack,
  };
  try {
    if (typeof window !== 'undefined' && typeof window.Log === 'function') {
      // Call provided middleware
      window.Log(entry.stack, level, PACKAGE_NAME, message);
      return;
    }
  } catch (_) {
    // ignore and fallback
  }
  persistFallbackLog(entry);
}

export function getStoredLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
  } catch (_) {
    return [];
  }
}
