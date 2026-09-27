import React from "react";
import { useTranslation } from "react-i18next";
import "./AboutPage.css";

/**
 * AboutPage — public informational page.
 *
 * Explains what MindGold is, its three learning modes (CheatSheet,
 * Game Arena, Quiz Lab), how to use them, supported languages,
 * and project status (currently in test mode).
 *
 * All user-facing strings go through i18n (`t()`), with keys under
 * the `about.*` namespace.
 *
 * Route: /about (public, no auth required).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      {/* ─── Title ─────────────────────────────────────────────── */}
      <header className="about-header">
        <h1 className="about-title">
          <span className="about-title-icon">🎓</span>{" "}
          {t("about.title", "About MindGold")}
        </h1>
        <p className="about-subtitle">
          {t("about.subtitle", "Interactive Quiz and Knowledge Engine")}
        </p>
      </header>

      {/* ─── What is MindGold? ────────────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title">
          🎯 {t("about.what.title", "What is MindGold?")}
        </h2>
        <p>{t("about.what.text")}</p>
      </section>

      {/* ─── Three Learning Modes ─────────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title">
          🎮 {t("about.modes.title", "Three Learning Modes")}
        </h2>

        <div className="about-modes">
          {/* CheatSheet */}
          <div className="about-mode-card">
            <h3>
              <span className="about-mode-icon">📖</span>{" "}
              {t("about.modes.cheatsheet.title", "CheatSheet — Learn")}
            </h3>
            <p>{t("about.modes.cheatsheet.text")}</p>
          </div>

          {/* Game Arena */}
          <div className="about-mode-card">
            <h3>
              <span className="about-mode-icon">🎮</span>{" "}
              {t("about.modes.game.title", "Game Arena — Test")}
            </h3>
            <p>{t("about.modes.game.text")}</p>
          </div>

          {/* Quiz Lab */}
          <div className="about-mode-card">
            <h3>
              <span className="about-mode-icon">🛠️</span>{" "}
              {t("about.modes.editor.title", "Quiz Lab — Create")}
            </h3>
            <p>{t("about.modes.editor.text")}</p>
          </div>
        </div>
      </section>

      {/* ─── How to Use ───────────────────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title">
          🔄 {t("about.how.title", "How to Use")}
        </h2>
        <ol className="about-steps">
          <li>{t("about.how.step1")}</li>
          <li>{t("about.how.step2")}</li>
          <li>{t("about.how.step3")}</li>
          <li>{t("about.how.step4")}</li>
        </ol>
      </section>

      {/* ─── Any Subject, Any Language ────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title">
          🌍 {t("about.languages.title", "Any Subject, Any Language")}
        </h2>

        <ul className="about-subjects">
          <li>{t("about.languages.programming")}</li>
          <li>{t("about.languages.languages")}</li>
          <li>{t("about.languages.academic")}</li>
          <li>{t("about.languages.professional")}</li>
        </ul>

        <p className="about-languages-note">{t("about.languages.note")}</p>
      </section>

      {/* ─── Why MindGold? ────────────────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title">
          ✨ {t("about.why.title", "Why MindGold?")}
        </h2>
        <ul className="about-features">
          <li>{t("about.why.feature1")}</li>
          <li>{t("about.why.feature2")}</li>
          <li>{t("about.why.feature3")}</li>
          <li>{t("about.why.feature4")}</li>
          <li>{t("about.why.feature5")}</li>
        </ul>
      </section>

      {/* ─── Test Mode (yellow warning) ───────────────────────── */}
      <section className="about-section about-test-mode">
        <h2 className="about-section-title">
          ⚠️ {t("about.testMode.title", "Test Mode")}
        </h2>
        <p>{t("about.testMode.text")}</p>
      </section>
    </div>
  );
}
