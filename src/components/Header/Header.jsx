import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

// Retrieve API URL from environment variables, fallback to relative path if undefined
const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Header Component
 * Sticky top navigation bar containing return button, language switcher, and live API status indicator.
 *
 * @component
 * @returns {React.ReactElement} The rendered Header navigation bar.
 */
export const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // API status state: 'ok' | 'error' | 'checking'
  const [apiStatus, setApiStatus] = useState("checking");

  // Check if current route is NOT the home page
  const showReturnButton = location.pathname !== "/";

  /**
   * Fetches backend health check endpoint to update status indicator.
   */
  const checkHealth = async () => {
    setApiStatus("checking");
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        setApiStatus("ok");
      } else {
        setApiStatus("error");
      }
    } catch (error) {
      setApiStatus("error");
    }
  };
  window.triggerHeaderCheck = checkHealth;

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Periodic ping every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left section: Navigation back button & Language switcher group */}
        <div className="header-left">
          {showReturnButton && (
            <button className="btn-return-now" onClick={() => navigate("/")}>
              <span className="card-arrow return-arrow">➔</span>
              <span className="btn-text">
                {t("notFound.returnNow", "Return Now")}
              </span>
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
          <div className={`live-status status-${apiStatus}`}>
            <span className="status-dot"></span>
            <span>
              {apiStatus === "checking" &&
                t("header.statusChecking", "API CHECKING...")}
              {apiStatus === "ok" && t("header.statusOk", "API OK")}
              {apiStatus === "error" && t("header.statusError", "API OFFLINE")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
