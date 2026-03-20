/**
 * AppState — singleton state manager with localStorage persistence.
 * Caches developer profiles with 1-hour TTL.
 */

const CACHE_KEY = 'vcc_profile';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

class AppState {
  constructor() {
    this.profile = null;
    this.listeners = new Set();
    this._loadFromCache();
  }

  _loadFromCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (Date.now() - cached._cachedAt < CACHE_TTL) {
        this.profile = cached;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  setProfile(profile) {
    this.profile = { ...profile, _cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(this.profile));
    this._notify();
  }

  clearProfile() {
    this.profile = null;
    localStorage.removeItem(CACHE_KEY);
    this._notify();
  }

  isConnected() {
    return this.profile !== null;
  }

  getProfile() {
    return this.profile;
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    for (const fn of this.listeners) fn(this.profile);
  }
}

export const appState = new AppState();
