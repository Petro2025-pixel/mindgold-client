import React, { useEffect } from "react";
import "./Modal.css";

/**
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal dialog.
 * @property {() => void} [onClose] - Callback function triggered when closing the modal.
 * @property {string} [title] - Optional title text displayed at the top of the modal.
 * @property {React.ReactNode} children - Content elements to be rendered inside the modal body.
 * @property {boolean} [showCloseButton=true] - Flag to toggle the display of the close icon.
 */

/**
 * Reusable modal dialog component styled following the MindGold theme layout.
 * Includes Escape key listeners, backdrop scroll blocking, and overlay click dismissals.
 *
 * @param {ModalProps} props - Component props.
 * @returns {JSX.Element | null} The rendered Modal component, or null if `isOpen` is false.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    /**
     * Handles keyboard events to close the modal on 'Escape'.
     * @param {KeyboardEvent} event - The keyboard event object.
     */
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {showCloseButton && onClose && (
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            ✕
          </button>
        )}

        {title && <h2 className="modal-title">{title}</h2>}

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};