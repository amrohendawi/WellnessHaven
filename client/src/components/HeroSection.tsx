import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section
      id="home"
      className="relative min-h-screen pt-16 md:pt-18 bg-cover bg-center flex items-center overflow-hidden dubai-pattern"
      style={{
        backgroundImage:
          "linear-gradient(rgba(164, 120, 125, 0.95), rgba(141, 91, 108, 0.9)), url('https://images.unsplash.com/photo-1582654697936-a635e306ba31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')",
        backgroundColor: '#8D5B6C' /* Fallback color in case image fails to load */,
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-10 w-48 md:w-96 h-48 md:h-96 rounded-full bg-gold opacity-30 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-48 md:w-96 h-48 md:h-96 rounded-full bg-pink opacity-20 blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-36 md:w-64 h-36 md:h-64 rounded-full bg-white opacity-30 blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      {/* Golden Border Frame with animated corners */}
      <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 bottom-4 sm:bottom-6 md:bottom-8 border border-white opacity-40 pointer-events-none">
        {/* Top left corner */}
        <div className="absolute top-0 left-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-t-2 border-l-2 border-gold" />
        {/* Top right corner */}
        <div className="absolute top-0 right-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-t-2 border-r-2 border-gold" />
        {/* Bottom left corner */}
        <div className="absolute bottom-0 left-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-b-2 border-l-2 border-gold" />
        {/* Bottom right corner */}
        <div className="absolute bottom-0 right-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-b-2 border-r-2 border-gold" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 text-white drop-shadow-lg gold-shine">
            <span className="block text-gold fade-in">Dubai</span>
            <span className="text-pink fade-in animation-delay-500">Rose</span>
          </h1>

          <h2 className="font-display text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 text-white fade-in animation-delay-700">
            {t('heroTitle')}
          </h2>

          <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-gray-100 font-light fade-in animation-delay-1000 max-w-2xl mx-auto px-3">
            {t('heroSubtitle')}
          </p>

          {/* Enhanced fancy divider */}
          <div className="fancy-divider mb-4 sm:mb-6 md:mb-8 lg:mb-10 fade-in animation-delay-1200">
            <div className="w-6 sm:w-8 md:w-12 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
            <i className="fas fa-spa fancy-divider-icon text-gold mx-2 sm:mx-3 md:mx-4 text-sm sm:text-base md:text-lg lg:text-xl" />
            <div className="w-6 sm:w-8 md:w-12 h-0.5 md:h-1 bg-gradient-to-r from-gold via-transparent to-transparent mx-auto" />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 fade-in animation-delay-1500">
            <a
              href="#booking"
              className="btn-royal px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-md font-medium text-sm sm:text-base md:text-lg hover-lift shadow-lg"
            >
              {t('bookNow')}
            </a>
            <a
              href="#services"
              className="bg-transparent border-2 border-gold text-white hover:bg-white/20 hover:border-gold hover:text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-md transition-all duration-300 font-medium text-sm sm:text-base md:text-lg hover-lift shadow-md"
            >
              {t('menuServices')}
            </a>
          </div>

          <div className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 flex items-center justify-center fade-in animation-delay-2000">
            <div className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white/60 backdrop-blur-md rounded-full flex items-center border-2 border-gold shadow-xl">
              <i
                className={`fas fa-female ${dir === 'ltr' ? 'mr-2 sm:mr-2.5 md:mr-3' : 'ml-2 sm:ml-2.5 md:ml-3'} text-pink-dark text-sm sm:text-base md:text-lg lg:text-xl`}
              />
              <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base lg:text-lg">
                نسواني فقط
              </span>
              <span className="mx-2 sm:mx-2.5 md:mx-3 text-gold">|</span>
              <span className="font-medium text-gray-900 text-xs sm:text-sm md:text-base lg:text-lg">
                {t('womenOnly')}
              </span>
            </div>
          </div>

          {/* Removed scroll indicator */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
