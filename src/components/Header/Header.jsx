import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useApiStatus } from "../../context/ApiStatusContext";
import "./Header.css";

/**
 * Supported languages shown in the dropdown.
 * @type {Array<{code: string, label: string, flag: string}>}
 */
const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "uk", label: "UK", flag: "🇺🇦" },
];

/**
 * Header Component
 * Sticky top navigation bar containing return button, language dropdown, and live API status indicator.
 *
 * @component
 * @returns {React.ReactElement} The rendered Header navigation bar.
 */
export const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { status: apiStatus } = useApiStatus();

  // Language dropdown state
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  // Check if current route is NOT the home page
  const showReturnButton = location.pathname !== "/";

  /**
   * Close language dropdown on outside click / touch / Escape.
   */
  useEffect(() => {
    if (!isLangOpen) return;

    const handleOutside = (e) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target)
      ) {
        setIsLangOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setIsLangOpen(false);
    };

    document.addEventListener("click", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLangOpen]);

  /**
   * Switch language and close dropdown.
   * @param {string} code - Language code ("en" | "de" | "uk").
   */
  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left section: Navigation back button & Language dropdown */}
        <div className="header-left">
          {showReturnButton && (
            <button
              className="btn-return-now"
              onClick={() => navigate("/")}
              title={t("notFound.returnNow", "Return Now")}
            >
              <span className="card-arrow return-arrow">➔</span>
              <span className="btn-text">
                {t("notFound.returnNow", "Return Now")}
              </span>
            </button>
          )}

          {/* Language dropdown */}
          <div className="lang-dropdown" ref={langDropdownRef}>
            <button
              className={`lang-btn lang-btn--trigger ${
                isLangOpen ? "open" : ""
              }`}
              onClick={() => setIsLangOpen((v) => !v)}
              title={t("header.changeLanguage", "Change language")}
              aria-haspopup="true"
              aria-expanded={isLangOpen}
            >
              <span className="lang-flag">
                {LANGUAGES.find((l) => l.code === i18n.language)?.flag || "🌐"}
              </span>
              <span className="lang-code">{i18n.language.toUpperCase()}</span>
              <span className="lang-caret">▼</span>
            </button>

            {isLangOpen && (
              <div className="lang-dropdown-menu" role="menu">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-dropdown-item ${
                      i18n.language === lang.code ? "active" : ""
                    }`}
                    onClick={() => handleSelectLanguage(lang.code)}
                    role="menuitem"
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-code">{lang.label}</span>
                    {i18n.language === lang.code && (
                      <span className="lang-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right section: System operational status indicator */}
        <div className="header-right">
          <div
            className={`live-status status-${apiStatus}`}
            title={
              apiStatus === "checking"
                ? t("header.statusChecking", "API CHECKING...")
                : apiStatus === "ok"
                  ? t("header.statusOk", "API OK")
                  : t("header.statusError", "API OFFLINE")
            }
          >
            <span className="status-label">API</span>
            <span className="status-text">
              {apiStatus === "checking" &&
                t("header.statusCheckingShort", "CHECKING...")}
              {apiStatus === "ok" && t("header.statusOkShort", "OK")}
              {apiStatus === "error" && t("header.statusErrorShort", "OFFLINE")}
            </span>
            <span className="status-dot"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
