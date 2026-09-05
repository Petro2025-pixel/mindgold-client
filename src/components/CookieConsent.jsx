import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { initGA } from "../utils/analytics";

/**
 * Google Analytics 4 Measurement ID for the MindGold application.
 * @type {string}
 */
const GA_MEASUREMENT_ID = "G-1YK6THRJWV";

/**
 * CookieConsent Component.
 * Displays a GDPR-compliant modal dialog requesting user consent for cookie usage and GA4 analytics.
 * Synchronizes consent status with `localStorage` and initializes tracking upon approval.
 *
 * @component
 * @returns {JSX.Element} The rendered CookieConsent modal dialog.
 */
export const CookieConsent = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "accepted") {
      initGA(GA_MEASUREMENT_ID);
    } else if (!consent) {
      setIsOpen(true);
    }
  }, []);

  /**
   * Handles user consent acceptance.
   * Stores preference in localStorage, initializes GA4 analytics, and closes the modal.
   *
   * @function handleAccept
   * @returns {void}
   */
  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    initGA(GA_MEASUREMENT_ID);
    setIsOpen(false);
  };

  /**
   * Handles user consent rejection.
   * Stores preference in localStorage and closes the modal without initializing GA4.
   *
   * @function handleDecline
   * @returns {void}
   */
  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} showCloseButton={false}>
      <div className="cookie-consent-content">
        <h3 className="cookie-consent-title">
          {t("cookie.title", "🍪 Cookie & Analytics")}
        </h3>
        <p className="cookie-consent-text">
          {t(
            "cookie.text",
            "We use cookies and Google Analytics to improve your user experience and game performance."
          )}
        </p>

        <div className="modal-actions">
          <button className="btn-modal btn-modal-success" onClick={handleAccept}>
            {t("cookie.accept", "Accept")}
          </button>
          <button className="btn-modal btn-modal-cancel" onClick={handleDecline}>
            {t("cookie.decline", "Decline")}
          </button>
        </div>
      </div>
    </Modal>
  );
};