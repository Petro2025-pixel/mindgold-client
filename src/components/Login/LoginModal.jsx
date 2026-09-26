import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../Modal/Modal";
import "./LoginModal.css";

/**
 * Login modal dialog.
 *
 * Presents a two-field form (name + password) and calls `login()` from
 * AuthContext. On success, closes itself via `onClose`. On failure, shows
 * an inline error message and stays open.
 *
 * Wrapped in the shared <Modal> component so it inherits the MindGold
 * dark theme, Esc handler, backdrop dismiss, and scroll lock.
 *
 * @component
 * @param {{ isOpen: boolean, onClose: () => void }} props
 * @returns {JSX.Element | null}
 */
export function LoginModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Resets form state — called on successful submit or when modal closes.
   */
  const resetForm = () => {
    setName("");
    setPassword("");
    setError(null);
    setSubmitting(false);
  };

  /**
   * Handles form submission.
   * Distinguishes between 401 (wrong credentials) and other errors.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(name.trim(), password);
      resetForm();
      onClose();
    } catch (err) {
      if (err.message === "INVALID_CREDENTIALS") {
        setError(t("auth.invalidCredentials"));
      } else {
        setError(t("auth.networkError"));
      }
      setSubmitting(false);
    }
  };

  /**
   * Wrapper around onClose that also clears form fields.
   * Ensures we don't leave stale password in memory between opens.
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("auth.loginTitle")}>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="login-input"
          placeholder={t("auth.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
          autoFocus
          required
        />

        <input
          type="password"
          className="login-input"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="login-error">{error}</p>}

        <div className="modal-actions">
          <button
            type="submit"
            className="btn-modal btn-modal-success"
            disabled={submitting}
          >
            {submitting ? "..." : t("auth.submit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
