import { useLanguage } from '@/context/LanguageContext';

interface LanguageOption {
  code: string;
  label: string;
}

const languages: LanguageOption[] = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'عربي' },
  { code: 'de', label: 'DE' },
  { code: 'tr', label: 'TR' }
];

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer';
}

const LanguageSwitcher = ({ variant = 'header' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  
  const getButtonClass = (langCode: string) => {
    if (variant === 'header') {
      return `text-sm hover:text-gold-dark transition-colors ${
        language === langCode ? 'text-gold-dark font-semibold' : 'text-gray-600'
      }`;
    } else {
      return `text-xs hover:text-pink transition-colors uppercase ${
        language === langCode ? 'text-pink font-semibold' : 'text-gray-500'
      }`;
    }
  };
  
  return (
    <div className={`flex items-center ${variant === 'header' ? 'space-x-3 rtl:space-x-reverse' : 'space-x-2 rtl:space-x-reverse'}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={getButtonClass(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
