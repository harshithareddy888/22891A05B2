// Base domain for short URLs.
// Priority: REACT_APP_SHORT_BASE env > localStorage('short_base') > window.location.origin
export function getShortBase() {
  const envBase = process.env.REACT_APP_SHORT_BASE;
  if (envBase && typeof envBase === 'string' && envBase.trim()) return envBase.replace(/\/$/, '');
  try {
    const ls = localStorage.getItem('short_base');
    if (ls && ls.trim()) return ls.replace(/\/$/, '');
  } catch (_) {}
  const { hostname, port, protocol } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  if (isLocal) {
    // Default to http://short (no port) as requested
    return 'http://short';
  }
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}
