import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import uz from './locales/uz.json';
import tj from './locales/tj.json';
import kz from './locales/kz.json';
import kg from './locales/kg.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ru', label: 'Русский' },
  { code: 'uz', label: "O'zbekcha" },
  { code: 'tj', label: 'Тоҷикӣ' },
  { code: 'kz', label: 'Қазақша' },
  { code: 'kg', label: 'Кыргызча' },
] as const;

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
    tj: { translation: tj },
    kz: { translation: kz },
    kg: { translation: kg },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
