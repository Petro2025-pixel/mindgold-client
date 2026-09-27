import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

/**
 * Determines whether the current route is a "focus mode" —
 * i.e. the user is actively engaged in a game, editor, or study session.
 *
 * In focus mode, all action buttons (About, Diagnostics, Theme toggle)
 * are hidden to avoid interrupting the user's flow.
 *
 * Focus mode routes:
 *   - /game/:slug         → active quiz (questions + timer)
 *   - /editor             → quiz creation
 *   - /cheatsheet/*       → study mode (planned)
 *
 * @param {string} pathname - Current location pathname.
 * @returns {boolean} True if the user is in focus mode.
 */
const isFocusMode = (pathname) => {
  // Active game: /game/some-slug, but NOT /game or /game/category/xyz
  const isActiveGame =
    /^\/game\/[^/]+$/.test(pathname) && !pathname.startsWith("/game/category/");

  return (
    isActiveGame ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/cheatsheet")
  );
};

/**
 * Footer Component.
 * Renders localized copyright info, About link, background switcher,
 * and system diagnostics shortcut.
 *
 * Action buttons are hidden during focus mode (game / editor / study)
 * so the user isn't distracted from the current task.
 *
 * @component
 * @returns {React.ReactElement} The application footer element.
 */
export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [activeTheme, setActiveTheme] = useState("dots");

  const focusMode = isFocusMode(location.pathname);

  /**
   * Toggles the background theme between "dots" and "circuit".
   * Dispatches a global CustomEvent consumed by Background component.
   */
  const handleToggleBg = () => {
    const nextTheme = activeTheme === "dots" ? "circuit" : "dots";
    setActiveTheme(nextTheme);

    window.dispatchEvent(
      new CustomEvent("toggle-bg-theme", { detail: { theme: nextTheme } }),
    );
  };

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-left">
          <span className="footer-copyright">
            {t("footer.copyrightLine1", "MindGold Engine © 2026.")}{" "}
            <br className="mobile-break" />
            {t("footer.copyrightLine2", "All rights reserved.")}
          </span>
        </div>

        <div className="footer-right">
          {!focusMode && (
            <>
              {/* About — hidden during focus mode */}
              <button
                className="btn-footer-action"
                onClick={() => navigate("/about")}
                title={t("footer.about", "About")}
              >
                <span className="footer-btn-icon">ℹ️</span>
                <span className="footer-btn-text">
                  {t("footer.about", "About")}
                </span>
              </button>

              {/* Diagnostics — hidden during focus mode */}
              <button
                className="btn-footer-action"
                onClick={() => navigate("/diagnostics")}
                title={t("footer.diagnostics", "System Diagnostics")}
              >
                <span className="footer-btn-icon">⚡</span>
                <span className="footer-btn-text">
                  {t("footer.diagnostics", "System Diagnostics")}
                </span>
              </button>

              {/* Theme toggle — hidden during focus mode */}
              <button
                className="btn-footer-action"
                onClick={handleToggleBg}
                title={
                  activeTheme === "dots"
                    ? t("footer.switchToCircuit", "Switch to Circuit")
                    : t("footer.switchToDots", "Switch to Dots")
                }
              >
                <span className="footer-btn-icon">
                  {activeTheme === "dots" ? "🕸️" : "🔮"}
                </span>
                <span className="footer-btn-text">
                  {activeTheme === "dots"
                    ? t("footer.switchToCircuit", "Switch to Circuit")
                    : t("footer.switchToDots", "Switch to Dots")}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
