import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

/**
 * Header Component
 * Sticky top navigation bar containing return button, language switcher, and API status indicator.
 *
 * @component
 * @returns {React.ReactElement} The rendered Header navigation bar.
 */
export const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is NOT the home page
  const showReturnButton = location.pathname !== "/";

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left section: Navigation back button & Language switcher group */}
        <div className="header-left">
          {showReturnButton && (
            <button className="btn-return-now" onClick={() => navigate("/")}>
              ← {t("notFound.returnNow", "Return Now")}
            </button>
          )}

          {/* Language selector controls */}
          <div className="lang-switcher-group">
            <button
              className={`lang-btn ${i18n.language === "en" ? "active" : ""}`}
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>
            <button
              className={`lang-btn ${i18n.language === "de" ? "active" : ""}`}
              onClick={() => i18n.changeLanguage("de")}
            >
              DE
            </button>
            <button
              className={`lang-btn ${i18n.language === "uk" ? "active" : ""}`}
              onClick={() => i18n.changeLanguage("uk")}
            >
              UK
            </button>
          </div>
        </div>

        {/* Right section: System operational status indicator */}
        <div className="header-right">
          <div className="live-status">
            <span className="status-dot"></span>
            <span>API OK</span>
          </div>
        </div>
      </div>
    </header>
  );
};
