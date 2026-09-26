import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Modal } from "../Modal/Modal";

/**
 * Exit-game confirmation modal.
 *
 * Shown when the user tries to leave an in-progress quiz via the header
 * return button. Confirming discards the current progress and navigates
 * to the category list (/game). Cancelling closes the modal and the game
 * continues from where it was paused.
 *
 * Wrapped in the shared <Modal> component so it inherits the MindGold
 * dark theme, Esc handler, backdrop dismiss, and scroll lock.
 *
 * @component
 * @param {{ isOpen: boolean, onClose: () => void }} props
 * @returns {JSX.Element | null}
 */
export function ExitGameModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Confirms exit: closes the modal and navigates to the category list.
   */
  const handleConfirm = () => {
    onClose();
    navigate("/game");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("exitGame.title")}>
      <p className="modal-text-muted">{t("exitGame.hint")}</p>

      <div className="modal-actions">
        <button
          type="button"
          className="btn-modal btn-modal-success"
          onClick={handleConfirm}
        >
          {t("exitGame.confirm")}
        </button>

        <button
          type="button"
          className="btn-modal btn-modal-cancel"
          onClick={onClose}
        >
          {t("exitGame.cancel")}
        </button>
      </div>
    </Modal>
  );
}
