// Simple frontend-only auth utilities backed by localStorage
// NOTE: This is not secure and only for demo purposes.

import { log, LOG_LEVELS } from './logger';

const AUTH_KEY = 'url_shortener_auth_v1';

export function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function isAuthenticated() {
  const auth = getAuth();
  return !!(auth && auth.user);
}

export function getUser() {
  const auth = getAuth();
  return auth?.user || null;
}

export function login(username) {
  const user = { username, loggedInAt: Date.now() };
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user }));
  log(LOG_LEVELS.INFO, `User logged in: ${username}`);
  return user;
}

export function logout() {
  const user = getUser();
  localStorage.removeItem(AUTH_KEY);
  log(LOG_LEVELS.INFO, `User logged out: ${user?.username || 'unknown'}`);
}
