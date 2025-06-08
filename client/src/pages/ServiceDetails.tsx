import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { servicesList } from '@/data/services'; // Keep as fallback for related services
import { getServices } from '@/lib/api';
import { ServiceDisplay } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ServiceDetails = () => {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, dir } = useLanguage();

  // Fetch service data from API
  const {
    data: service,
    isLoading,
    error,
  } = useQuery<ServiceDisplay>({
    queryKey: ['service', params?.slug],
    queryFn: async () => {
      if (!params?.slug) return Promise.reject('No slug provided');
      try {
        // Directly query the services data to find by slug
        const allServices = await getServices();
        const foundService = allServices.find(s => s.slug === params.slug);

        if (!foundService) {
          return Promise.reject(`Service with slug ${params.slug} not found`);
        }

        return foundService;
      } catch (err) {
        return Promise.reject(err);
      }
    },
    enabled: !!params?.slug,
    retry: 1, // Don't retry too many times if service isn't found
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (service && service.name) {
      const serviceName =
        service.name[language as keyof typeof service.name] || service.name.en || t('service');
      document.title = `${serviceName} - Dubai Rose`;
    } else {
      document.title = `${t('service')} - Dubai Rose`;
    }
  }, [service, language, t]);

  // Get related services from local data as fallback
  // In production, this would be fetched from the API
  const relatedServices = service
    ? servicesList.filter(s => s.category === service.category && s.id !== service.id).slice(0, 3)
    : [];

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
            <Button onClick={() => navigate('/')}>{t('backToHome')}</Button>
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
          className="h-[40vh] bg-cover bg-center flex items-end relative overflow-hidden"
          style={{
            backgroundImage:
              (service?.imageLarge || service?.imageUrl) &&
              typeof (service?.imageLarge || service?.imageUrl) === 'string'
                ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${service?.imageLarge || service?.imageUrl})`
                : 'linear-gradient(to right, #e83e8c, #fd7e14)',
          }}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg max-w-2xl shadow-lg border border-gray-100">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-gray-800">
                {service?.name
                  ? service.name[language as keyof typeof service.name] || service.name.en
                  : t('loading')}
              </h1>
              <p className="text-lg text-gray-700">
                {/* Use description if shortDescription is not available */}
                {service?.description
                  ? service.description[language as keyof typeof service.description] ||
                    service.description.en
                  : t('serviceDescription')}
              </p>
              {service?.price && (
                <div className="mt-3 inline-block bg-pink-light/70 px-4 py-1 rounded-full text-pink-dark font-medium text-sm">
                  {service.price} € | {service.duration} {t('minutes')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl font-bold mb-4">{t('aboutThisService')}</h2>
              <div className="prose max-w-none">
                {service?.description && (
                  <p className="mb-4">
                    {service.description[language as keyof typeof service.description] ||
                      service.description.en}
                  </p>
                )}
                {service?.longDescription && (
                  <p className="mb-4">
                    {service.longDescription[language as keyof typeof service.longDescription] ||
                      service.longDescription.en}
                  </p>
                )}

                {Array.isArray(service?.benefits) && service.benefits.length > 0 && (
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
                <div className="bg-beige-light p-5 rounded-lg border border-gold/20 shadow-md">
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">{t('sessionDuration')}:</span>
                    <span className="text-right">
                      {service?.duration || 0} {t('minutes')}
                    </span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">{t('price')}:</span>
                    <span className="text-right font-bold">{service?.price || 0} €</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center italic">
                    Prices include VAT
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white shadow-xl rounded-lg p-6 border border-pink/10 sticky top-24 gold-shadow">
                <h3 className="text-xl font-semibold mb-4 text-center text-pink-dark pb-2 border-b border-gold/20">
                  {t('bookThisService')}
                </h3>

                <div className="mb-6">
                  <h4 className="font-medium text-sm text-gray-600 mb-3 flex items-center">
                    <i className="fas fa-list-check text-gold mr-2"></i>
                    {t('includes')}
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {Array.isArray(service?.includes) && service?.includes.length > 0 ? (
                      service.includes.map((item: Record<string, string>, index: number) => (
                        <li
                          key={index}
                          className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <i
                            className={`fas fa-check text-gold-dark mt-1 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}
                          ></i>
                          <span>{item[language as keyof typeof item] || item.en}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li
                          className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <i
                            className={`fas fa-check text-gold-dark mt-1 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}
                          ></i>
                          <span>Professional service</span>
                        </li>
                        <li
                          className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <i
                            className={`fas fa-check text-gold-dark mt-1 ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}
                          ></i>
                          <span>Aftercare advice</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  className="w-full bg-white border border-gold hover:bg-gold/10 mb-3 rounded-md py-3 px-4 font-medium shadow-md flex items-center justify-center transition-colors duration-200"
                  style={{ color: '#333' }}
                  onClick={() => {
                    // Include the service slug in the URL
                    navigate(`/#booking?service=${service.slug}`);
                    setTimeout(() => {
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  <i className="fas fa-calendar-check mr-2"></i>
                  <span className="text-black font-bold">Book Now</span>
                </button>

                <button
                  className="w-full bg-white border border-gray-300 hover:bg-gray-100 rounded-md py-3 px-4 font-medium flex items-center justify-center transition-colors duration-200"
                  style={{ color: '#075e54' }} /* WhatsApp green */
                  onClick={() =>
                    (window.location.href =
                      "https://wa.me/971501234567?text=Hello,%20I'm%20interested%20in%20your%20" +
                      (service?.name?.en || 'spa') +
                      '%20service')
                  }
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  <span className="font-bold">Inquire via WhatsApp</span>
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-sm text-gray-600 mb-3 flex items-center">
                    <i className="fas fa-spa text-gold mr-2"></i>
                    {t('relatedServices')}
                  </h4>
                  <ul className="space-y-2.5">
                    {relatedServices.length > 0 ? (
                      relatedServices.map(s => (
                        <li key={s.id} className="group">
                          <Link
                            to={`/services/${s.slug}`}
                            className="text-gray-700 hover:text-pink-dark group-hover:underline flex items-center"
                          >
                            <i className="fas fa-angle-right text-gold mr-2 group-hover:translate-x-1 transition-transform"></i>
                            {s.name[language as keyof typeof s.name] || s.name.en}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">
                        No related services available
                      </li>
                    )}
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
