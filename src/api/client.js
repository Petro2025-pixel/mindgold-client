/**
 * API client utilities for MindGold.
 *
 * Provides:
 *   - `API_URL`         — base URL for all API requests
 *   - `apiFetch()`      — fetch wrapper with automatic Bearer token injection
 *   - `getToken()`      — read JWT from localStorage
 *   - `saveToken()`     — store JWT in localStorage
 *   - `clearToken()`    — remove JWT from localStorage
 *
 * All requests assume JSON. For non-JSON (e.g. file uploads), pass custom
 * headers via `options.headers` — the default Content-Type will be overridden.
 */

/**
 * Base URL of the MindGold API.
 * In dev, you can temporarily point this to `http://localhost:3000/api/v1`
 * to hit the local backend instead of production.
 *
 * @constant {string}
 */
export const API_URL = "https://mindgold.top/api/v1";

/**
 * localStorage key under which the JWT is stored.
 * Namespaced with `mg_` to avoid collisions with other apps on the same origin.
 *
 * @constant {string}
 */
const TOKEN_KEY = "mg_token";

/**
 * Reads the JWT from localStorage.
 *
 * @returns {string | null} The stored token, or null if none.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Saves the JWT to localStorage.
 *
 * @param {string} token - JWT returned by POST /users/login.
 * @returns {void}
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Removes the JWT from localStorage.
 * Call this on logout or when the token is known to be invalid (401 response).
 *
 * @returns {void}
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Wrapper around `fetch` that automatically injects the JWT
 * (if present) into the `Authorization: Bearer <token>` header.
 *
 * Usage:
 *   const res  = await apiFetch("/quizzes");
 *   const data = await res.json();
 *
 * @param {string} path - API path starting with a slash, e.g. "/quizzes".
 * @param {RequestInit} [options={}] - Standard fetch options (method, body, ...).
 * @returns {Promise<Response>} The raw fetch Response — caller decides how to read it.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}
