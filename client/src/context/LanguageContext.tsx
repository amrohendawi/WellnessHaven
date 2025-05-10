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
  fontClass: 'font-body'
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language || 'en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [fontClass, setFontClass] = useState('font-body');

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem('i18nextLng', lang);
  };

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
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, fontClass }}>
      {children}
    </LanguageContext.Provider>
  );
};
