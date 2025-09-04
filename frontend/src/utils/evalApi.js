// Evaluation service API helpers: registration and auth token handling
// Uses CRA dev proxy (package.json "proxy") to avoid CORS in dev.
// Base URL is proxied to http://20.244.56.144

import { log, LOG_LEVELS } from './logger';

const CREDS_KEY = 'eval_service_credentials_v1';
const TOKEN_KEY = 'eval_service_token_v1';

export function saveCredentials({ email, name, rollNo, accessCode, clientID, clientSecret, githubUsername, mobileNo }) {
  const data = { email, name, rollNo, accessCode, clientID, clientSecret, githubUsername, mobileNo };
  localStorage.setItem(CREDS_KEY, JSON.stringify(data));
}

export function getCredentials() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function hasCredentials() {
  const c = getCredentials();
  return !!(c?.email && c?.name && c?.rollNo && c?.accessCode && c?.clientID && c?.clientSecret);
}

export async function ensureCredentialsFromConfig() {
  if (hasCredentials()) return getCredentials();
  try {
    const res = await fetch('/eval-config.json', { cache: 'no-store' });
    if (!res.ok) return getCredentials();
    const cfg = await res.json();
    // Only save if at least required fields are present
    if (cfg?.email && cfg?.name && cfg?.rollNo && cfg?.accessCode && cfg?.clientID && cfg?.clientSecret) {
      saveCredentials({
        email: cfg.email,
        name: cfg.name,
        rollNo: cfg.rollNo,
        accessCode: cfg.accessCode,
        clientID: cfg.clientID,
        clientSecret: cfg.clientSecret,
        githubUsername: cfg.githubUsername || '',
        mobileNo: cfg.mobileNo || '',
      });
      log(LOG_LEVELS.INFO, 'Loaded evaluation credentials from eval-config.json');
      return getCredentials();
    }
  } catch (e) {
    // ignore
  }
  return getCredentials();
}

export function saveToken(tokenResponse) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenResponse));
}

export function getToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function register(payload) {
  // payload: { email, name, mobileNo, githubUsername, rollNo, accessCode }
  try {
    const res = await fetch('/evaluation-service/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Register failed ${res.status}: ${text}`);
    }
    const data = await res.json();
    // Save credentials that will be needed for auth
    saveCredentials({
      email: payload.email,
      name: payload.name,
      rollNo: payload.rollNo,
      accessCode: payload.accessCode,
      githubUsername: payload.githubUsername,
      mobileNo: payload.mobileNo,
      clientID: data.clientID,
      clientSecret: data.clientSecret,
    });
    log(LOG_LEVELS.INFO, 'Registration successful');
    return data;
  } catch (e) {
    log(LOG_LEVELS.ERROR, `Registration error: ${e?.message || 'unknown'}`);
    throw e;
  }
}

export async function getAuthToken(creds) {
  // creds may be provided or read from localStorage
  const stored = creds || getCredentials();
  if (!stored) throw new Error('No stored credentials found. Please register first.');
  const payload = {
    email: stored.email,
    name: stored.name,
    rollNo: stored.rollNo,
    accessCode: stored.accessCode,
    clientID: stored.clientID,
    clientSecret: stored.clientSecret,
  };
  try {
    const res = await fetch('/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Auth failed ${res.status}: ${text}`);
    }
    const data = await res.json();
    saveToken(data);
    log(LOG_LEVELS.INFO, 'Auth token obtained');
    return data;
  } catch (e) {
    log(LOG_LEVELS.ERROR, `Auth error: ${e?.message || 'unknown'}`);
    throw e;
  }
}
