// Validation helpers for URL, expiry, and shortcode

import { log, LOG_LEVELS } from './logger';

export function isValidUrl(url) {
  try {
    const u = new URL(url);
    // Only allow http or https to avoid launching non-web protocols
    return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.host;
  } catch (e) {
    return false;
  }
}

export function isValidExpiryMinutes(value) {
  if (value === undefined || value === null || value === '') return true; // optional
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 365 * 24 * 60;
}

export function isValidShortcode(code) {
  if (!code) return true; // optional
  // Allow alphanumeric and hyphen; length 3-32
  return /^[a-zA-Z0-9-]{3,32}$/.test(code);
}

export function normalizeUrl(url) {
  // Ensure protocol if missing
  try {
    new URL(url);
    return url;
  } catch (_) {
    try {
      const fixed = `https://${url}`;
      new URL(fixed);
      log(LOG_LEVELS.DEBUG, `Normalized URL by adding https:// -> ${fixed}`);
      return fixed;
    } catch (e) {
      return url; // will fail validation elsewhere
    }
  }
}
