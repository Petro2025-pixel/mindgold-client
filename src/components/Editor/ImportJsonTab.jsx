import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/client";
import { LoginModal } from "../Login/LoginModal";
import { CategoryInput } from "./CategoryInput";
import { TestModeModal } from "./TestModeModal";
import { PROMPTS } from "./prompts";

/* ─────────────────────────────────────────────────────────────────── */
/*  Constants                                                        */
/* ─────────────────────────────────────────────────────────────────── */

/** Language options for the prompt dropdown. "auto" = current UI language. */
const PROMPT_LANGUAGES = [
  { value: "auto", label: "Auto (= UI)", flag: "⚙️" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "uk", label: "Українська", flag: "🇺🇦" },
];

/** Level options for the prompt dropdown. */
const LEVEL_OPTIONS = ["basic", "intermediate", "advanced"];

/** Min / max / default for the "Questions" number input. */
const COUNT_MIN = 1;
const COUNT_MAX = 70;
const COUNT_DEFAULT = 10;

/** Human-readable language names used inside the prompt. */
const LANG_LABELS = {
  en: "English",
  de: "Deutsch",
  uk: "Українська",
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Helpers                                                          */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * Extracts the first JSON object from a string.
 * Handles:
 *   - Pure JSON
 *   - Markdown fences: ```json\n{...}\n```
 *   - Leading commentary: "Sure! Here is the JSON: {...}"
 *   - Wrapped single-element array: [{"quizTitle": ...}]
 *
 * @param {string} text - Raw text from the user.
 * @returns {{ ok: true, data: any } | { ok: false, error: string }}
 */
function extractJson(text) {
  if (!text || !text.trim()) return { ok: false, error: "Empty input" };

  let s = text.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const firstBrace = s.search(/[[{]/);
  const lastBrace = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (firstBrace === -1 || lastBrace === -1) {
    return { ok: false, error: "No JSON object or array found" };
  }
  s = s.slice(firstBrace, lastBrace + 1);

  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${e.message}` };
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 1) parsed = parsed[0];
    else
      return { ok: false, error: "Expected a single quiz object, got array" };
  }

  return { ok: true, data: parsed };
}

/**
 * Local validation of a parsed quiz object (subset of the backend schema).
 * The backend will still run full AJV validation.
 *
 * @param {any} data
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
function validateQuiz(data) {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Root is not an object" };
  }
  if (!data.quizTitle || typeof data.quizTitle !== "string") {
    return { ok: false, error: "quizTitle is required (string)" };
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    return { ok: false, error: "questions must be a non-empty array" };
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    const label = `Q${i + 1}`;

    if (!q || typeof q !== "object") {
      return { ok: false, error: `${label}: not an object` };
    }
    if (!q.id || typeof q.id !== "string") {
      return { ok: false, error: `${label}: id is required (string)` };
    }
    if (
      !q.question ||
      typeof q.question !== "string" ||
      q.question.length < 2
    ) {
      return { ok: false, error: `${label}: question too short` };
    }
    if (
      !Array.isArray(q.answers) ||
      q.answers.length < 2 ||
      q.answers.length > 4
    ) {
      return { ok: false, error: `${label}: answers must contain 2–4 items` };
    }
    if (q.answers.some((a) => typeof a !== "string" || !a.trim())) {
      return {
        ok: false,
        error: `${label}: all answers must be non-empty strings`,
      };
    }
    if (
      typeof q.correct !== "number" ||
      q.correct < 0 ||
      q.correct >= q.answers.length
    ) {
      return {
        ok: false,
        error: `${label}: "correct" must be a number 0–${q.answers.length - 1}`,
      };
    }
  }
  return { ok: true };
}

/**
 * Replaces {{PLACEHOLDER}} tokens in a prompt with the given values.
 * Called before copying the prompt, so the AI receives a fully filled task.
 *
 * @param {string} raw - Raw prompt with placeholders.
 * @param {object} values - { TOPIC, COUNT, PREFIX, LANGUAGE, LEVEL }
 * @returns {string}
 */
function fillPrompt(raw, values) {
  return raw
    .replace(/\{\{TOPIC\}\}/g, values.TOPIC)
    .replace(/\{\{COUNT\}\}/g, values.COUNT)
    .replace(/\{\{PREFIX\}\}/g, values.PREFIX)
    .replace(/\{\{LANGUAGE\}\}/g, values.LANGUAGE)
    .replace(/\{\{LEVEL\}\}/g, values.LEVEL);
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Component                                                        */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * ImportJsonTab — paste a quiz JSON produced by external AI.
 *
 * Sub-tabs:
 *   - text:       user provides a topic → AI generates from scratch
 *   - screenshot: user provides an image → vision AI extracts + generates
 *
 * Flow:
 *   1. Fill in Topic, Question count, ID prefix, Level, Quiz language.
 *   2. Copy the fully populated prompt (placeholders replaced).
 *   3. Paste into ChatGPT / Claude / Gemini, get JSON back.
 *   4. Paste the JSON into the textarea below.
 *   5. Validate locally.
 *   6. Select a category.
 *   7. Upload → POST /api/v1/quizzes.
 *
 * @component
 * @returns {JSX.Element}
 */
export function ImportJsonTab() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ── Sub-tab + prompt language ────────────────────────────────────
  const [source, setSource] = useState("text"); // "text" | "screenshot"
  const [langChoice, setLangChoice] = useState("auto"); // "auto" | "en" | "de" | "uk"

  // ── Prompt parameters ────────────────────────────────────────────
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(String(COUNT_DEFAULT));
  const [prefix, setPrefix] = useState("QUIZ");
  const [level, setLevel] = useState("intermediate");

  // ── JSON + category ──────────────────────────────────────────────
  const [jsonText, setJsonText] = useState("");
  const [category, setCategory] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Validation / submission ──────────────────────────────────────
  const [validation, setValidation] = useState(null);
  const [errors, setErrors] = useState([]);
  const [globalError, setGlobalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  // ── Effective prompt language ────────────────────────────────────
  const effectiveLang = useMemo(() => {
    if (langChoice !== "auto") return langChoice;
    return i18n.resolvedLanguage || i18n.language || "en";
  }, [langChoice, i18n.resolvedLanguage, i18n.language]);

  const currentPrompt = PROMPTS[source]?.[effectiveLang] || PROMPTS[source]?.en;

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleCopyPrompt = async () => {
    const filled = fillPrompt(currentPrompt, {
      TOPIC: topic.trim() || "General knowledge",
      COUNT: count,
      PREFIX: (prefix.trim().toUpperCase() || "QUIZ").slice(0, 4),
      LANGUAGE: LANG_LABELS[effectiveLang] || "English",
      LEVEL: level,
    });

    try {
      await navigator.clipboard.writeText(filled);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setGlobalError(
        t("editor.import.copyFailed", "Copy failed — select manually"),
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target.result || "");
      setValidation(null);
      setErrors([]);
      setGlobalError(null);
    };
    reader.readAsText(file);
  };

  const handleValidate = () => {
    setErrors([]);
    setGlobalError(null);

    const extracted = extractJson(jsonText);
    if (!extracted.ok) {
      setValidation({ ok: false, error: extracted.error });
      return;
    }
    const check = validateQuiz(extracted.data);
    if (!check.ok) {
      setValidation({ ok: false, error: check.error });
      return;
    }
    setValidation({ ok: true, data: extracted.data });
  };
  /**
   * Clears the JSON textarea, file input, and all validation/error state.
   * Lets the user quickly discard a bad JSON paste and try again.
   */
  const handleClear = () => {
    setJsonText("");
    setValidation(null);
    setErrors([]);
    setGlobalError(null);
    // Reset file input so the same file can be re-selected
    const fileInput = document.querySelector(".import-file-input");
    if (fileInput) fileInput.value = "";
  };

  const handleUpload = async () => {
    if (!validation?.ok) {
      setGlobalError(t("editor.import.validateFirst", "Please validate first"));
      return;
    }
    if (!category.trim()) {
      setGlobalError(
        t("editor.import.selectCategory", "Please select a category"),
      );
      return;
    }

    setSubmitting(true);
    setErrors([]);
    setGlobalError(null);

    const { quizTitle, questions, tags } = validation.data;
    const payload = {
      quizTitle: String(quizTitle).trim(),
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [],
      questions,
    };

    try {
      const res = await apiFetch("/quizzes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const data = await res.json();
        navigate(`/game/category/${data.quiz?.category || payload.category}`);
        return;
      }
      if (res.status === 400) {
        const data = await res.json();
        setErrors(data.details || []);
        setSubmitting(false);
        return;
      }
      if (res.status === 401) {
        logout();
        setLoginOpen(true);
        setSubmitting(false);
        return;
      }
      if (res.status === 409) {
        setGlobalError(
          t(
            "editor.errors.duplicate",
            "A quiz with this title already exists. Please use a different title.",
          ),
        );
        setSubmitting(false);
        return;
      }
      if (res.status === 429) {
        const data = await res.json();
        setRetryAfter(data.retryAfter || 86400);
        setLimitOpen(true);
        setSubmitting(false);
        return;
      }
      setGlobalError(
        t("editor.errors.server", "Server error. Please try again."),
      );
      setSubmitting(false);
    } catch {
      setGlobalError(
        t("editor.errors.network", "Network error. Check your connection."),
      );
      setSubmitting(false);
    }
  };

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="import-tab">
      {/* ── Sub-tabs (source) ────────────────────────────────── */}
      <div className="editor-subtabs">
        <button
          type="button"
          className={`editor-subtab ${source === "text" ? "active" : ""}`}
          onClick={() => setSource("text")}
        >
          📝 {t("editor.import.tabText", "Text / Topic")}
        </button>
        <button
          type="button"
          className={`editor-subtab ${source === "screenshot" ? "active" : ""}`}
          onClick={() => setSource("screenshot")}
        >
          🖼️ {t("editor.import.tabScreenshot", "From screenshot")}
        </button>
      </div>

      {/* ── Step 1: Prompt ───────────────────────────────────── */}
      <section className="import-step">
        <h3 className="editor-section-title">
          {t("editor.import.step1", "Step 1 — Copy the prompt")}
        </h3>

        {source === "screenshot" && (
          <p className="editor-hint-text">
            {t(
              "editor.import.visionHint",
              "Use a vision-capable model: ChatGPT-4o, Gemini, or Claude 3.5+.",
            )}
          </p>
        )}

        <div className="import-prompt-grid">
          <label className="editor-label">
            {t("editor.import.promptLanguage", "Quiz language")}
            <select
              className="editor-input"
              value={langChoice}
              onChange={(e) => setLangChoice(e.target.value)}
            >
              {PROMPT_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </label>

          {/* Topic + Count + Level — only for text source */}
          {source === "text" && (
            <>
              <label className="editor-label">
                {t("editor.import.topic", "Topic")}
                <input
                  type="text"
                  className="editor-input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t(
                    "editor.import.topicPlaceholder",
                    "e.g. C# GUI basics",
                  )}
                  maxLength={160}
                />
              </label>

              <label className="editor-label">
                {t("editor.import.questionCount", "Questions")}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="editor-input"
                  maxLength={2}
                  value={count}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setCount(raw);
                  }}
                  onBlur={() => {
                    const n = Number(count);
                    if (!n || n < COUNT_MIN) setCount(String(COUNT_DEFAULT));
                    else if (n > COUNT_MAX) setCount(String(COUNT_MAX));
                  }}
                />
                <span className="editor-hint-text">
                  {t("editor.import.rangeHint", "1–70")}
                </span>
              </label>

              <label className="editor-label">
                {t("editor.import.level", "Level")}
                <select
                  className="editor-input"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {t(`editor.import.level_${l}`, l)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* ID prefix — always visible */}
          <label className="editor-label">
            {t("editor.import.prefix", "ID prefix")}
            <input
              type="text"
              className="editor-input"
              value={prefix}
              onChange={(e) =>
                setPrefix(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 4),
                )
              }
              placeholder="QUIZ"
              maxLength={4}
            />
          </label>
        </div>

        {/* Warning for large quizzes */}
        {source === "text" && Number(count) >= 40 && (
          <p className="import-warning">
            ⚠️{" "}
            {t(
              "editor.import.largeQuizWarning",
              "Large quizzes (40+) may be cut off by AI. If so, generate in chunks of 20 and merge.",
            )}
          </p>
        )}

        <button
          type="button"
          className="editor-add-btn"
          onClick={handleCopyPrompt}
        >
          📋{" "}
          {copied
            ? t("editor.import.copied", "Copied!")
            : t("editor.import.copyPrompt", "Copy prompt")}
        </button>
      </section>

      {/* ── Step 2: Paste JSON ───────────────────────────────── */}
      <section className="import-step">
        <h3 className="editor-section-title">
          {t("editor.import.step2", "Step 2 — Paste the JSON")}
        </h3>

        <input
          type="file"
          accept=".json,.txt,application/json,text/plain"
          onChange={handleFileChange}
          className="import-file-input"
        />

        <textarea
          className="editor-textarea import-json-textarea"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setValidation(null);
            setErrors([]);
            setGlobalError(null);
          }}
          placeholder={t(
            "editor.import.jsonPlaceholder",
            'Paste the quiz JSON here, e.g. { "quizTitle": "...", "questions": [...] }',
          )}
          rows={14}
          spellCheck={false}
        />

        <div className="import-json-actions">
          <button
            type="button"
            className="editor-add-btn"
            onClick={handleValidate}
          >
            ✓ {t("editor.import.validate", "Validate")}
          </button>

          <button
            type="button"
            className="editor-clear-btn"
            onClick={handleClear}
          >
            🗑 {t("editor.import.clear", "Clear")}
          </button>
        </div>

        {validation && (
          <div
            className={`import-validation ${validation.ok ? "ok" : "error"}`}
          >
            {validation.ok
              ? `✓ ${t("editor.import.validOk", "Valid")}: "${validation.data.quizTitle}" (${validation.data.questions.length})`
              : `✗ ${validation.error}`}
          </div>
        )}
      </section>

      {/* ── Step 3: Category + Upload ────────────────────────── */}
      <section className="import-step">
        <h3 className="editor-section-title">
          {t("editor.import.step3", "Step 3 — Category & upload")}
        </h3>

        <CategoryInput value={category} onChange={setCategory} required />

        <button
          type="button"
          className="btn-hex-game"
          onClick={handleUpload}
          disabled={submitting || !validation?.ok}
        >
          {submitting
            ? t("editor.saving", "Saving…")
            : t("editor.import.upload", "Upload to server")}
        </button>
      </section>

      {/* ── Errors ────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="editor-errors">
          <h3>{t("editor.errors.validationTitle", "Validation errors")}</h3>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {globalError && <p className="editor-error-line">{globalError}</p>}

      {/* ── Modals ────────────────────────────────────────────── */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <TestModeModal
        isOpen={limitOpen}
        onClose={() => setLimitOpen(false)}
        retryAfter={retryAfter}
      />
    </div>
  );
}
