import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../Modal/Modal";

/**
 * Logout confirmation modal.
 *
 * Asks the user to confirm signing out. On confirm, clears the auth state
 * via `logout()` from AuthContext and redirects to the home page.
 *
 * Wrapped in the shared <Modal> component so it inherits the MindGold
 * dark theme, Esc handler, backdrop dismiss, and scroll lock.
 *
 * @component
 * @param {{ isOpen: boolean, onClose: () => void }} props
 * @returns {JSX.Element | null}
 */
export function LogoutModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Confirms logout: clears auth state, closes modal, redirects home.
   */
  const handleConfirm = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("logout.title")}>
      <p className="modal-text-primary">
        {t("logout.player", { name: user?.name || "?" })}
      </p>

      <p className="modal-text-muted">{t("logout.hint")}</p>

      <div className="modal-actions">
        <button
          type="button"
          className="btn-modal btn-modal-success"
          onClick={handleConfirm}
        >
          {t("logout.confirm")}
        </button>

        <button
          type="button"
          className="btn-modal btn-modal-cancel"
          onClick={onClose}
        >
          {t("logout.cancel")}
        </button>
      </div>
    </Modal>
  );
}
