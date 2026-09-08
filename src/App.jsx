import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";

import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { MainMenu } from "./components/MainMenu/MainMenu";
import { SystemDiagnostics } from "./components/SystemDiagnostics/SystemDiagnostics";
import NotFoundPage from "./components/NotFoundPage/NotFoundPage";
import { Modal } from "./components/Modal/Modal";
import { CookieConsent } from "./components/CookieConsent/CookieConsent";
import "./index.css";

/**
 * GameScreen Component.
 * Temporary placeholder screen for the primary MindGold gameplay interface.
 *
 * @component
 * @returns {React.ReactElement} The rendered game screen placeholder.
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
 * Temporary placeholder screen for the quiz creation and editor module.
 *
 * @component
 * @returns {React.ReactElement} The rendered editor screen placeholder.
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
 * Root application module managing primary routing, global UI layout,
 * modal dialog instances, and cookie compliance prompts.
 *
 * @component
 * @returns {React.ReactElement} The application root element.
 */
export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      {/* Navigation Header with Language & Status Bar */}
      <Header />

      {/* Main Content Viewport */}
      <main className="main-content flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={<MainMenu onNavigate={(route) => navigate(route)} />}
          />
          <Route path="/diagnostics" element={<SystemDiagnostics />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/editor" element={<EditorScreen />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Persistent Footer Component */}
      <Footer />

      {/* GDPR Cookie Consent Notice */}
      <CookieConsent />
    </div>
  );
}
