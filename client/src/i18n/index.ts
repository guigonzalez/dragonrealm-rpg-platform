import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en.json';
import ptBRTranslation from './locales/pt-BR.json';

const resources = {
  en: {
    translation: enTranslation
  },
  'pt-BR': {
    translation: ptBRTranslation
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dragonRealm_language',
      caches: ['localStorage']
    }
  });

export default i18n;

// Helper for language selector
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt-BR', name: 'Português (BR)' }
];

// Helper to change language
export const changeLanguage = (langCode: string) => {
  i18n.changeLanguage(langCode);
  localStorage.setItem('dragonRealm_language', langCode);
};