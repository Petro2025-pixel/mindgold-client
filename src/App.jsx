import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";
import SystemCheck from "./components/SystemCheck";
import NotFoundPage from "./components/NotFoundPage";
import { Modal } from "./components/Modal";
import { CookieConsent } from "./components/CookieConsent";
import "./index.css";

/**
 * GameScreen Component.
 * Temporary placeholder screen for the primary MindGold quiz gameplay.
 *
 * @component
 * @returns {JSX.Element} The rendered game screen placeholder.
 */
const GameScreen = () => {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: "center", marginTop: "5rem", color: "#ffffff" }}>
      <h2>{t("screens.game", "Game Screen")}</h2>
      <p style={{ color: "var(--text-muted, #a0a0b0)" }}>
        {t("screens.inProgress", "Development in progress...")}
      </p>
    </div>
  );
};

/**
 * EditorScreen Component.
 * Temporary placeholder screen for the custom quiz creation/editor interface.
 *
 * @component
 * @returns {JSX.Element} The rendered editor screen placeholder.
 */
const EditorScreen = () => {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: "center", marginTop: "5rem", color: "#ffffff" }}>
      <h2>{t("screens.editor", "Quiz Editor")}</h2>
      <p style={{ color: "var(--text-muted, #a0a0b0)" }}>
        {t("screens.inProgress", "Development in progress...")}
      </p>
    </div>
  );
};

/**
 * App Component.
 * Root component managing client-side routing, global language switching,
 * test modal instances, and GDPR consent prompts.
 *
 * @component
 * @returns {JSX.Element} The root application layout and routing setup.
 */
export default function App() {
  const { t, i18n } = useTranslation();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  /**
   * Switches active application language via i18next.
   *
   * @function changeLanguage
   * @param {string} lng - The target language ISO code ('en', 'de', 'uk').
   * @returns {void}
   */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="app-container">
      {/* Language Switcher Controls */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10000,
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          style={{ cursor: "pointer" }}
          onClick={() => changeLanguage("en")}
        >
          EN
        </button>
        <button
          style={{ cursor: "pointer" }}
          onClick={() => changeLanguage("de")}
        >
          DE
        </button>
        <button
          style={{ cursor: "pointer" }}
          onClick={() => changeLanguage("uk")}
        >
          UK
        </button>
      </div>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section className="hero-section">
                  <h1 className="brand-title">{t("hero.title", "MINDGOLD")}</h1>
                  <p className="brand-tagline">
                    {t("hero.tagline", "Interactive Knowledge Quiz System")}
                  </p>

                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                      onClick={() => setIsTestModalOpen(true)}
                      style={{
                        padding: "10px 24px",
                        cursor: "pointer",
                        borderRadius: "20px",
                        border: "1px solid #f1c40f",
                        background: "#2c0b3e",
                        color: "#f1c40f",
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      {t("testModal.openBtn", "Open Test Modal")}
                    </button>
                  </div>
                </section>
                <SystemCheck />
              </>
            }
          />

          <Route path="/game" element={<GameScreen />} />
          <Route path="/editor" element={<EditorScreen />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>{t("footer", "MindGold Engine © 2026. All rights reserved.")}</p>
      </footer>

      {/* Interactive Test Modal Window */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={t("testModal.title", "Test Modal Window")}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "20px", color: "#e0e0e0" }}>
            {t(
              "testModal.description",
              "Verification of component layout, interactive elements, and UI styling!",
            )}
          </p>

          <div className="modal-actions">
            <button
              className="btn-modal btn-modal-success"
              onClick={() => setIsTestModalOpen(false)}
            >
              {t("testModal.actionSuccess", "Success Action")}
            </button>
            <button
              className="btn-modal btn-modal-cancel"
              onClick={() => setIsTestModalOpen(false)}
            >
              {t("testModal.actionCancel", "Cancel Action")}
            </button>
          </div>
        </div>
      </Modal>

      <CookieConsent />
    </div>
  );
}
