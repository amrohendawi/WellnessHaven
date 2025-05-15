import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

const AboutSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      {/* Royal background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="royal-heading text-3xl md:text-4xl mb-8">{t('aboutUs')}</h2>
          <div className="fancy-divider mb-4">
            <i className="fas fa-gem fancy-divider-icon text-gold mx-2"></i>
          </div>
        </div>

        <div
          className={`flex flex-col ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}
        >
          <div className="md:w-1/2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Dubai Rose Interior"
                className="rounded-xl w-full h-auto z-10 relative gold-shadow"
              />
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 bottom-3 left-3 bg-gold/10 rounded-xl -z-10"></div>
              <div className="absolute -bottom-3 -left-3 top-3 right-3 border border-gold/30 rounded-xl -z-10"></div>
            </div>
          </div>

          <div className="md:w-1/2">
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">{t('aboutText')}</p>

            <p className="text-gray-600 mb-8 leading-relaxed text-lg">{t('aboutTextAdditional')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div
                className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''} p-4 rounded-lg gold-shadow border border-gold/20 bg-white`}
              >
                <div
                  className={`w-14 h-14 rounded-full bg-gold-light/30 flex items-center justify-center ${dir === 'ltr' ? 'mr-4' : 'ml-4'}`}
                >
                  <i className="fas fa-certificate text-gold text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-lg">{t('certifiedExperts')}</h4>
                </div>
              </div>

              <div
                className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''} p-4 rounded-lg gold-shadow border border-gold/20 bg-white`}
              >
                <div
                  className={`w-14 h-14 rounded-full bg-gold-light/30 flex items-center justify-center ${dir === 'ltr' ? 'mr-4' : 'ml-4'}`}
                >
                  <i className="fas fa-star text-gold text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-lg">{t('premiumService')}</h4>
                </div>
              </div>

              <div
                className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''} p-4 rounded-lg gold-shadow border border-gold/20 bg-white md:col-span-2`}
              >
                <div
                  className={`w-14 h-14 rounded-full bg-gold-light/30 flex items-center justify-center ${dir === 'ltr' ? 'mr-4' : 'ml-4'}`}
                >
                  <i className="fas fa-female text-gold text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium text-lg">{t('womenOnly')}</h4>
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
