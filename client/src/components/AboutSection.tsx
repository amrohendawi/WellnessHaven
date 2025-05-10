import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

const AboutSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Dubai Rose Interior" 
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          
          <div className="md:w-1/2">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              {t('aboutUs')}
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('aboutText')}
            </p>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('aboutTextAdditional')}
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-full bg-pink-light flex items-center justify-center ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}>
                  <i className="fas fa-certificate text-gold-dark text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium">{t('certifiedExperts')}</h4>
                </div>
              </div>
              
              <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-full bg-pink-light flex items-center justify-center ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}>
                  <i className="fas fa-star text-gold-dark text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium">{t('premiumService')}</h4>
                </div>
              </div>
              
              <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-full bg-pink-light flex items-center justify-center ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}>
                  <i className="fas fa-female text-gold-dark text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium">{t('womenOnly')}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
