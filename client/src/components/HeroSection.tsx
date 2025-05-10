import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section 
      id="home" 
      className="relative h-[80vh] bg-cover bg-center flex items-center" 
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')"
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-gray-800">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-700">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a 
              href="#booking" 
              className="bg-gold-dark hover:bg-gold text-white px-8 py-3 rounded-md transition-colors font-medium text-lg shadow-lg"
            >
              {t('bookNow')}
            </a>
            <a 
              href="#services" 
              className="bg-transparent border-2 border-gold-dark text-gold-dark hover:bg-gold-light hover:text-gold-dark px-8 py-3 rounded-md transition-colors font-medium text-lg"
            >
              {t('menuServices')}
            </a>
          </div>
          
          <div className="mt-12 flex items-center justify-center">
            <div className="px-4 py-2 bg-pink bg-opacity-40 rounded-full flex items-center">
              <i className={`fas fa-female ${dir === 'ltr' ? 'mr-2' : 'ml-2'} text-pink-dark`}></i>
              <span className="font-medium">نسواني فقط</span>
              <span className="mx-2">|</span>
              <span className="font-medium">{t('womenOnly')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
