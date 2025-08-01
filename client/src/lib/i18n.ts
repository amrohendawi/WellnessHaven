import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import arTranslation from '../data/translations/ar.json';
import deTranslation from '../data/translations/de.json';
import enTranslation from '../data/translations/en.json';
import trTranslation from '../data/translations/tr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
      de: {
        translation: deTranslation,
      },
      tr: {
        translation: trTranslation,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'de', 'tr'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
