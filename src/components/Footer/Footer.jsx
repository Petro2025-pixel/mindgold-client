import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

/**
 * Footer Component.
 * Renders localized copyright info, background switcher, and system diagnostics shortcut.
 *
 * @component
 * @returns {React.ReactElement} The application footer element.
 */
export const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTheme, setActiveTheme] = useState("dots");

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
        </div>
      </div>
    </footer>
  );
};
