import { loadDB } from './storage';

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateShortcode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return code;
}

export function generateUniqueShortcode(length = 6, maxAttempts = 50) {
  const db = loadDB();
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateShortcode(length);
    if (!db[code]) return code;
  }
  // If collisions persist, increment length and try again quickly
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateShortcode(length + 1);
    if (!db[code]) return code;
  }
  throw new Error('Unable to generate a unique shortcode');
}

export function generateJumbledShortcode(custom = '', length = 5) {
  const base = (custom || '').trim();
  const rand = generateShortcode(length);
  if (base) return `${base}-${rand}`; // e.g., mytoken-AB12c
  return rand;
}
