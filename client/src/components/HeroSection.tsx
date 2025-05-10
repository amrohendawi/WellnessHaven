import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section 
      id="home" 
      className="relative h-[90vh] bg-cover bg-center flex items-center overflow-hidden" 
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1582654697936-a635e306ba31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')"
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold opacity-10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-pink opacity-10 blur-3xl"></div>
      </div>
      
      {/* Golden Border Frame */}
      <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-gold opacity-30 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            <span className="block text-gold">Dubai</span> 
            <span className="text-pink">Rose</span>
          </h1>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 text-white">
            {t('heroTitle')}
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 text-white font-light">
            {t('heroSubtitle')}
          </p>
          
          {/* Fancy divider */}
          <div className="fancy-divider mb-10">
            <i className="fas fa-spa fancy-divider-icon text-gold mx-2"></i>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <a 
              href="#booking" 
              className="btn-royal px-10 py-4 rounded-md font-medium text-lg"
            >
              {t('bookNow')}
            </a>
            <a 
              href="#services" 
              className="bg-transparent border-2 border-gold text-white hover:bg-gold-dark hover:border-gold-dark hover:text-white px-10 py-4 rounded-md transition-all duration-300 font-medium text-lg"
            >
              {t('menuServices')}
            </a>
          </div>
          
          <div className="mt-16 flex items-center justify-center">
            <div className="px-6 py-3 bg-black bg-opacity-50 backdrop-blur-sm rounded-full flex items-center border border-gold-light">
              <i className={`fas fa-female ${dir === 'ltr' ? 'mr-3' : 'ml-3'} text-pink`}></i>
              <span className="font-medium text-white text-lg">نسواني فقط</span>
              <span className="mx-3 text-gold">|</span>
              <span className="font-medium text-white text-lg">{t('womenOnly')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
