// LocalStorage persistence helpers for the URL shortener
// Schema: DB is an object keyed by shortcode.
// value = { longUrl, createdAt, expiryMinutes, expiryAt, analytics: { clicks, lastAccessed, events: [{ ts, referrer, location }] } }

import { log, LOG_LEVELS } from './logger';

const DB_KEY = 'url_shortener_db_v1';

export function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    log(LOG_LEVELS.ERROR, `Failed to load DB: ${e?.message || 'unknown'}`);
    return {};
  }
}

export function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    log(LOG_LEVELS.ERROR, `Failed to save DB: ${e?.message || 'unknown'}`);
  }
}

export function getEntry(shortcode) {
  const db = loadDB();
  return db[shortcode] || null;
}

export function getAllEntries() {
  const db = loadDB();
  return Object.entries(db).map(([code, data]) => ({ shortcode: code, ...data }));
}

export function isExpired(entry) {
  if (!entry) return true;
  const now = Date.now();
  return typeof entry.expiryAt === 'number' && now > entry.expiryAt;
}

export function addEntry(shortcode, longUrl, expiryMinutes) {
  const db = loadDB();
  if (db[shortcode]) return { ok: false, reason: 'collision' };
  const createdAt = Date.now();
  const minutes = Number.isInteger(expiryMinutes) && expiryMinutes > 0 ? expiryMinutes : 30;
  const expiryAt = createdAt + minutes * 60 * 1000;
  db[shortcode] = {
    longUrl,
    createdAt,
    expiryMinutes: minutes,
    expiryAt,
    analytics: {
      clicks: 0,
      lastAccessed: null,
      events: [],
    },
  };
  saveDB(db);
  log(LOG_LEVELS.INFO, `Added entry ${shortcode} -> ${longUrl} (expires in ${minutes} mins)`);
  return { ok: true, entry: db[shortcode] };
}

export function deleteEntry(shortcode) {
  const db = loadDB();
  if (db[shortcode]) {
    delete db[shortcode];
    saveDB(db);
    log(LOG_LEVELS.INFO, `Deleted entry ${shortcode}`);
    return true;
  }
  return false;
}

export function upsertEntry(shortcode, updater) {
  const db = loadDB();
  const prev = db[shortcode] || null;
  const next = updater(prev);
  db[shortcode] = next;
  saveDB(db);
  return next;
}

export function recordClick(shortcode, referrer, location) {
  const db = loadDB();
  const entry = db[shortcode];
  if (!entry) return null;
  const ts = Date.now();
  entry.analytics.clicks = (entry.analytics.clicks || 0) + 1;
  entry.analytics.lastAccessed = ts;
  entry.analytics.events = entry.analytics.events || [];
  entry.analytics.events.push({ ts, referrer, location });
  saveDB(db);
  log(LOG_LEVELS.INFO, `Recorded click for ${shortcode}`);
  return entry;
}
