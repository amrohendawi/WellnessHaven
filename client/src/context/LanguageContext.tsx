import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  dir: 'ltr' | 'rtl';
  fontClass: string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  dir: 'ltr',
  fontClass: 'font-body',
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { i18n } = useTranslation();

  // Get browser language and set default language (German if no match)
  const getBrowserLanguage = (): string => {
    // Check if we have a saved language preference
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && ['en', 'de', 'ar', 'tr'].includes(savedLanguage)) {
      return savedLanguage;
    }

    // Get browser language (navigator.language returns formats like 'en-US', 'de-DE')
    const browserLang = navigator.language.split('-')[0].toLowerCase();

    // Check if browser language matches our supported languages
    if (['en', 'de', 'ar', 'tr'].includes(browserLang)) {
      return browserLang;
    }

    // Default to German if no match
    return 'de';
  };

  const [language, setLanguageState] = useState(getBrowserLanguage());
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [fontClass, setFontClass] = useState('font-body');

  const setLanguage = (lang: string) => {
    // Only change if it's one of our supported languages
    if (['en', 'de', 'ar', 'tr'].includes(lang)) {
      i18n.changeLanguage(lang);
      setLanguageState(lang);
      localStorage.setItem('i18nextLng', lang);
    }
  };

  // Initialize i18n with the detected/default language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, []);

  useEffect(() => {
    // Update direction and font based on language
    setDir(language === 'ar' ? 'rtl' : 'ltr');
    setFontClass(language === 'ar' ? 'font-arabic' : 'font-body');

    // Set HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Remove previous font class and add new one
    document.body.classList.remove('font-body', 'font-arabic');
    document.body.classList.add(language === 'ar' ? 'font-arabic' : 'font-body');

    // Log language selection for debugging
    console.log(`Language set to: ${language} (Browser language: ${navigator.language})`);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, fontClass }}>
      {children}
    </LanguageContext.Provider>
  );
};
