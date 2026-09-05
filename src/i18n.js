import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';
import uk from './locales/uk.json';

/**
 * Internationalization (i18n) Configuration.
 * Initializes i18next with language detection, fallback options, and translation resources.
 * Supports English (en), German (de), and Ukrainian (uk).
 *
 * @module i18n
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      uk: { translation: uk },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
  });

export default i18n;