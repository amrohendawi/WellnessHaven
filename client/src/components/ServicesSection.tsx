import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { servicesList } from '@/data/services';
import { useLanguage } from '@/context/LanguageContext';

const ServicesSection = () => {
  const { t } = useTranslation();
  const { dir, language } = useLanguage();
  
  // Display only 6 services plus a "View All" card
  const displayedServices = servicesList.slice(0, 6);

  return (
    <section id="services" className="py-16 bg-beige-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="royal-heading text-3xl md:text-4xl mb-8">
            {t('servicesTitle')}
          </h2>
          <div className="fancy-divider mb-4">
            <i className="fas fa-star fancy-divider-icon text-gold mx-2"></i>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Service Cards */}
          {displayedServices.map((service) => (
            <div key={service.id} className="service-card bg-white/95 rounded-lg overflow-hidden shadow-lg gold-shadow group">
              <div className="relative overflow-hidden">
                <img 
                  src={service.imageUrl} 
                  alt={service.name[language] || service.name.en} 
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Price tag */}
                <div className="absolute bottom-3 right-3 bg-gold/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  {service.price} AED
                </div>
              </div>
              
              <div className="p-6 relative">
                {/* Decorative gold accent */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-gold rounded-full"></div>
                
                <h3 className={`text-xl font-semibold mb-3 ${language === 'ar' ? 'font-arabic' : 'font-display'} text-black-gold`}>
                  {service.name[language] || service.name.en}
                </h3>
                <p className="text-gray-600 text-sm mb-5 min-h-[3rem]">
                  {service.description[language] || service.description.en}
                </p>
                <Link 
                  to={`/services/${service.slug}`} 
                  className={`inline-flex items-center px-4 py-2 rounded-md border border-gold bg-transparent hover:bg-gold hover:text-white transition-colors duration-300 text-gold font-medium text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <span>{t('bookNow')}</span>
                  <i className={`fas fa-chevron-${dir === 'rtl' ? 'left mr-auto' : 'right ml-2'} text-xs`}></i>
                </Link>
              </div>
            </div>
          ))}
          
          {/* View All Services Button */}
          <div className="service-card bg-gradient-to-br from-pink/20 to-gold/20 rounded-lg overflow-hidden shadow-lg gold-shadow flex items-center justify-center group border border-gold/20">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/30 transition-colors duration-300">
                <i className="fas fa-spa text-2xl text-gold"></i>
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-black-gold">{t('viewAllServices')}</h3>
              <p className="text-gray-600 text-sm mb-5">{t('exploreServiceRange')}</p>
              <Link 
                to="/services" 
                className={`inline-flex items-center btn-royal px-6 py-2.5 rounded-md font-medium text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
              >
                <span>{t('exploreMore')}</span>
                <i className={`fas fa-chevron-${dir === 'rtl' ? 'left mr-2' : 'right ml-2'} text-xs`}></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
