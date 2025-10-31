import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './locales/ja.json';
import en from './locales/en.json';

// Initialize i18next once at app startup
export function initializeI18n() {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: {
          ja: { translation: ja },
          en: { translation: en },
        },
        lng: (() => {
          try {
            const locales = (Localization as any).getLocales?.() ?? [];
            const tag = locales[0]?.languageTag || (Localization as any).locale || 'en-US';
            return String(tag).toLowerCase().startsWith('ja') ? 'ja' : 'en';
          } catch {
            return 'en';
          }
        })(),
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      })
      .catch(() => {
        // no-op: avoid crashing on init errors
      });
  }
}

export default i18n;


