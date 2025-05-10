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
            <div key={service.id} className="service-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <img 
                src={service.imageUrl} 
                alt={service.name[language] || service.name.en} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className={`text-xl font-semibold mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {service.name[language] || service.name.en}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {service.description[language] || service.description.en}
                </p>
                <Link 
                  to={`/services/${service.slug}`} 
                  className={`text-gold-dark hover:text-gold flex items-center font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                >
                  <span>{t('bookNow')}</span>
                  <i className={`fas fa-chevron-${dir === 'rtl' ? 'left mr-auto' : 'right ml-2'} text-xs`}></i>
                </Link>
              </div>
            </div>
          ))}
          
          {/* View All Services Button */}
          <div className="service-card bg-pink-light rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow flex items-center justify-center">
            <div className="p-6 text-center">
              <i className="fas fa-plus-circle text-4xl text-pink-dark mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">{t('viewAllServices')}</h3>
              <p className="text-gray-600 text-sm mb-4">{t('exploreServiceRange')}</p>
              <Link 
                to="/services" 
                className={`text-gold-dark hover:text-gold flex items-center justify-center font-medium ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
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
