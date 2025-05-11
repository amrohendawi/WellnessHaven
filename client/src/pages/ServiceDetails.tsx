import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { servicesList } from '@/data/services'; // Keep as fallback for related services
import { useLanguage } from '@/context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { ServiceDisplay } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { getServiceBySlug } from '@/lib/api';

const ServiceDetails = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/services/:slug');
  const { t } = useTranslation();
  const { language, dir } = useLanguage();
  
  // Fetch service data from API
  const { data: service, isLoading, error } = useQuery<ServiceDisplay>({
    queryKey: ['/api/services', params?.slug],
    queryFn: () => params?.slug ? getServiceBySlug(params.slug) : Promise.reject('No slug provided'),
    enabled: !!params?.slug,
  });

  useEffect(() => {
    if (service) {
      document.title = `${service.name[language] || service.name.en} - Dubai Rose`;
    }
  }, [service, language]);

  // Get related services from local data as fallback
  // In production, this would be fetched from the API
  const relatedServices = service ? 
    servicesList
      .filter(s => s.category === service.category && s.id !== service.id)
      .slice(0, 3) : 
    [];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4">
            <div className="h-[40vh] rounded-lg bg-gray-200 mb-8">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-8" />
              </div>
              <div>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('serviceNotFound')}</h2>
            <Button onClick={() => setLocation('/')}>
              {t('backToHome')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Banner */}
        <div 
          className="h-[40vh] bg-cover bg-center flex items-end"
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${service.imageLarge || service.imageUrl})` }}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg max-w-2xl">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-gray-800">
                {service.name[language as keyof typeof service.name] || service.name.en}
              </h1>
              <p className="text-lg text-gray-700">
                {/* Use description if shortDescription is not available */}
                {service.description[language as keyof typeof service.description] || service.description.en}
              </p>
            </div>
          </div>
        </div>
        
        {/* Service Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl font-bold mb-4">{t('aboutThisService')}</h2>
              <div className="prose max-w-none">
                <p className="mb-4">{service.description[language as keyof typeof service.description] || service.description.en}</p>
                {service.longDescription && (
                  <p className="mb-4">{service.longDescription[language as keyof typeof service.longDescription] || service.longDescription.en}</p>
                )}
                
                {service.benefits && (
                  <>
                    <h3 className="text-xl font-semibold mt-6 mb-3">{t('benefits')}</h3>
                    <ul className="list-disc ml-5 mb-6">
                      {service.benefits.map((benefit: Record<string, string>, index: number) => (
                        <li key={index} className="mb-2">
                          {benefit[language as keyof typeof benefit] || benefit.en}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">{t('pricingAndDuration')}</h3>
                <div className="bg-beige-light p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{t('sessionDuration')}:</span>
                    <span>{service.duration} {t('minutes')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{t('price')}:</span>
                    <span>{service.price} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('vipPrice')}:</span>
                    <span className="text-gold-dark font-semibold">
                      {/* Calculate VIP price based on regular price */}
                      {`${service.price * 0.6} € (40% ${t('off')})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 sticky top-24">
                <h3 className="text-xl font-semibold mb-4">{t('bookThisService')}</h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">{t('includes')}</h4>
                  <ul className="space-y-2">
                    {service.includes?.map((item: Record<string, string>, index: number) => (
                      <li key={index} className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                        <i className={`fas fa-check text-gold-dark mt-1 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}></i>
                        <span>{item[language as keyof typeof item] || item.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full bg-gold-dark hover:bg-gold text-white mb-3 hover-lift"
                  onClick={() => {
                    setLocation('/#booking');
                    setTimeout(() => {
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  {t('bookNow')}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full hover-lift"
                  onClick={() => window.location.href = "https://wa.me/971501234567?text=Hello,%20I'm%20interested%20in%20your%20" + service.name.en + "%20service"}
                >
                  <i className="fab fa-whatsapp mr-2"></i> {t('inquireViaWhatsApp')}
                </Button>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">{t('relatedServices')}</h4>
                  <ul className="space-y-2">
                    {relatedServices.map(s => (
                        <li key={s.id}>
                          <a 
                            href={`/services/${s.slug}`}
                            className="text-gold-dark hover:text-gold hover:underline"
                          >
                            {s.name[language as keyof typeof s.name] || s.name.en}
                          </a>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetails;
