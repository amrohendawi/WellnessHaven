import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section 
      id="home" 
      className="relative h-[95vh] bg-cover bg-center flex items-center overflow-hidden dubai-pattern" 
      style={{
        backgroundImage: "linear-gradient(rgba(164, 120, 125, 0.95), rgba(141, 91, 108, 0.9)), url('https://images.unsplash.com/photo-1582654697936-a635e306ba31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')",
        backgroundColor: "#8D5B6C" /* Fallback color in case image fails to load */
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-gold opacity-30 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pink opacity-20 blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-white opacity-30 blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>
      
      {/* Golden Border Frame with animated corners */}
      <div className="absolute top-8 left-8 right-8 bottom-8 border border-white opacity-40 pointer-events-none">
        {/* Top left corner */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold"></div>
        {/* Top right corner */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold"></div>
        {/* Bottom left corner */}
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold"></div>
        {/* Bottom right corner */}
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg gold-shine">
            <span className="block text-gold fade-in">Dubai</span> 
            <span className="text-pink fade-in animation-delay-500">Rose</span>
          </h1>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8 text-white fade-in animation-delay-700">
            {t('heroTitle')}
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 text-gray-100 font-light fade-in animation-delay-1000 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          
          {/* Enhanced fancy divider */}
          <div className="fancy-divider mb-10 fade-in animation-delay-1200">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
            <i className="fas fa-spa fancy-divider-icon text-gold mx-4 text-xl"></i>
            <div className="w-12 h-1 bg-gradient-to-r from-gold via-transparent to-transparent mx-auto"></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-6 fade-in animation-delay-1500">
            <a 
              href="#booking" 
              className="btn-royal px-10 py-4 rounded-md font-medium text-lg hover-lift shadow-lg"
            >
              {t('bookNow')}
            </a>
            <a 
              href="#services" 
              className="bg-transparent border-2 border-gold text-white hover:bg-white/20 hover:border-gold hover:text-white px-10 py-4 rounded-md transition-all duration-300 font-medium text-lg hover-lift shadow-md"
            >
              {t('menuServices')}
            </a>
          </div>
          
          <div className="mt-16 flex items-center justify-center fade-in animation-delay-2000">
            <div className="px-8 py-3 bg-white/60 backdrop-blur-md rounded-full flex items-center border-2 border-gold shadow-xl">
              <i className={`fas fa-female ${dir === 'ltr' ? 'mr-3' : 'ml-3'} text-pink-dark text-xl`}></i>
              <span className="font-medium text-gray-900 text-lg">نسواني فقط</span>
              <span className="mx-3 text-gold">|</span>
              <span className="font-medium text-gray-900 text-lg">{t('womenOnly')}</span>
            </div>
          </div>
          
          {/* Removed scroll indicator */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
