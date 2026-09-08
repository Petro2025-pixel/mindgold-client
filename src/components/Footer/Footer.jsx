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
      new CustomEvent("toggle-bg-theme", { detail: { theme: nextTheme } })
    );
  };

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-left">
          <span>
            {t(
              "footer.copyright",
              "MindGold Engine © 2026. All rights reserved."
            )}
          </span>
        </div>

        <div className="footer-right">
          <button className="btn-circuit-switch" onClick={handleToggleBg}>
            {activeTheme === "dots" ? "🕸️ " : "🔮 "}
            {activeTheme === "dots"
              ? t("footer.switchToCircuit", "Switch to Circuit")
              : t("footer.switchToDots", "Switch to Dots")}
          </button>

          <button
            className="btn-diagnostics"
            onClick={() => navigate("/diagnostics")}
          >
            ⚡ {t("footer.diagnostics", "System Diagnostics")}
          </button>
        </div>
      </div>
    </footer>
  );
};