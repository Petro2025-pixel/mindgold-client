import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, saveToken, clearToken, getToken } from "../api/client";

/**
 * AuthContext — global authentication state.
 *
 * Stores the currently logged-in user and exposes `login` / `logout`
 * helpers. On mount, if a token exists in localStorage, the user
 * is treated as logged in (we do not verify the token server-side —
 * an expired token will simply fail on the next protected request).
 *
 * @typedef {Object} AuthContextValue
 * @property {{ id: string, name: string, role: string } | null} user
 * @property {boolean} loading - True while restoring state on mount.
 * @property {(name: string, password: string) => Promise<void>} login
 * @property {() => void} logout
 */

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and supplies auth state to all children.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * On mount, restore session from localStorage.
   * We store only the token — the user object is persisted separately
   * under `mg_user` so we don't need a /users/me endpoint.
   */
  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem("mg_user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear everything to avoid broken state.
        clearToken();
        localStorage.removeItem("mg_user");
      }
    }

    setLoading(false);
  }, []);

  /**
   * Logs the user in with name + password.
   * On success, stores token + user in localStorage and updates state.
   * Throws on invalid credentials or network errors — caller handles UI.
   *
   * @param {string} name
   * @param {string} password
   * @returns {Promise<void>}
   */
  const login = async (name, password) => {
    const res = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    });

    if (!res.ok) {
      // 401 → invalid credentials; anything else → generic failure.
      const err = new Error(
        res.status === 401 ? "INVALID_CREDENTIALS" : "LOGIN_FAILED",
      );
      err.status = res.status;
      throw err;
    }

    const data = await res.json(); // { message, token, user }

    saveToken(data.token);
    localStorage.setItem("mg_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  /**
   * Logs the user out: clears token + user from localStorage and state.
   * Does not navigate — the caller decides where to redirect.
   */
  const logout = () => {
    clearToken();
    localStorage.removeItem("mg_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context.
 * Must be used inside <AuthProvider>, otherwise throws.
 *
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
