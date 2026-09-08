import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SystemCheck from '../SystemCheck/SystemCheck';
import { Modal } from '../Modal/Modal';
import './SystemDiagnostics.css';

/**
 * SystemDiagnostics Component.
 * View wrapper displaying top brand header, test modal trigger, 
 * and rendering the dedicated SystemCheck diagnostic module.
 *
 * @component
 * @returns {React.ReactElement} System diagnostics page layout.
 */
export const SystemDiagnostics = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  return (
    <div className="diagnostics-page-container">
      <div className="diagnostics-content">
        {/* Brand identity */}
        <h1 className="brand-title">{t('hero.title', 'MINDGOLD')}</h1>
        <p className="brand-tagline">
          {t('hero.tagline', 'INTERACTIVE KNOWLEDGE QUIZ ENGINE')}
        </p>

        {/* Test Modal Trigger */}
        <div className="test-modal-trigger-wrapper">
          <button
            className="btn-open-test-modal"
            onClick={() => setIsTestModalOpen(true)}
          >
            {t('testModal.openBtn', 'Open Test Modal')}
          </button>
        </div>

        {/* Embedded SystemCheck Module */}
        <div className="system-check-wrapper">
          <SystemCheck />
        </div>
      </div>

      {/* Interactive UI Testing Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={t('testModal.title', 'Test Modal Window')}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px', color: '#e0e0e0' }}>
            {t(
              'testModal.description',
              'Verification of component layout, interactive elements, and UI styling!'
            )}
          </p>

          <div className="modal-actions">
            <button
              className="btn-modal btn-modal-success"
              onClick={() => setIsTestModalOpen(false)}
            >
              {t('testModal.actionSuccess', 'Success Action')}
            </button>
            <button
              className="btn-modal btn-modal-cancel"
              onClick={() => setIsTestModalOpen(false)}
            >
              {t('testModal.actionCancel', 'Cancel Action')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};