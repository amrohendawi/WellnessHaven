import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import type { ServiceDisplay, ServiceGroupDisplay } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ServicesSection = () => {
  const { t } = useTranslation();
  const { dir, language } = useLanguage();
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);

  // Fetch services and service groups in parallel
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useQuery({
    queryKey: ['/api/services'],
  });

  const {
    data: serviceGroupsData,
    isLoading: isLoadingGroups,
    error: groupsError,
  } = useQuery({
    queryKey: ['/api/service-groups'],
  });

  // Use all services for the slideshow
  const allServices = useMemo(() => {
    return servicesData ? (servicesData as ServiceDisplay[]) : [];
  }, [servicesData]);

  const serviceGroups = useMemo(() => {
    return serviceGroupsData ? (serviceGroupsData as ServiceGroupDisplay[]) : [];
  }, [serviceGroupsData]);

  // Loading and error states
  const isLoading = isLoadingServices || isLoadingGroups;
  const error = servicesError || groupsError;

  // Map service groups to categories format
  const categories = useMemo(() => {
    if (!serviceGroups.length) return [];

    return serviceGroups.map(group => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
    }));
  }, [serviceGroups]);

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter services by selected category
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return allServices;

    // Find the selected group to get both ID and slug for matching
    const selectedGroup = serviceGroups.find(group => group.id.toString() === selectedCategory);
    if (!selectedGroup) return allServices;

    return allServices.filter(
      service => service.groupId === selectedGroup.id || service.category === selectedGroup.slug
    );
  }, [allServices, selectedCategory, serviceGroups]);

  // Auto-scroll effect
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;
    const scrollSpeed = 0.2; // pixels per millisecond - slightly slower for better UX

    const autoScroll = (timestamp: number) => {
      if (!slideContainerRef.current || autoScrollPaused || isDragging) {
        animationId = requestAnimationFrame(autoScroll);
        return;
      }

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
        animationId = requestAnimationFrame(autoScroll);
        return;
      }

      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const container = slideContainerRef.current;
      const scrollAmount = scrollSpeed * elapsed * (dir === 'rtl' ? -1 : 1);

      // Get the total width of all cards
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      // Update position
      let newPosition = (currentPosition + scrollAmount) % scrollWidth;

      // If we've scrolled to the end, loop back to beginning
      if (newPosition > scrollWidth - clientWidth) {
        // Seamless loop back to the beginning
        newPosition = 0;
        lastTimestamp = timestamp; // Reset timestamp to avoid jump
      } else if (newPosition < 0) {
        // For RTL support - loop to the end
        newPosition = scrollWidth - clientWidth;
        lastTimestamp = timestamp; // Reset timestamp to avoid jump
      }

      setCurrentPosition(newPosition);
      container.scrollLeft = newPosition;

      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentPosition, autoScrollPaused, isDragging, dir]);

  // Handle mouse/touch interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!slideContainerRef.current) return;
    setIsDragging(true);
    setStartPosition(e.clientX);
    setAutoScrollPaused(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!slideContainerRef.current) return;
    setIsDragging(true);
    setStartPosition(e.touches[0].clientX);
    setAutoScrollPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !slideContainerRef.current) return;
    const diff = dir === 'rtl' ? e.clientX - startPosition : startPosition - e.clientX;
    slideContainerRef.current.scrollLeft += diff;
    setStartPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !slideContainerRef.current) return;
    const diff =
      dir === 'rtl' ? e.touches[0].clientX - startPosition : startPosition - e.touches[0].clientX;
    slideContainerRef.current.scrollLeft += diff;
    setStartPosition(e.touches[0].clientX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setAutoScrollPaused(false);
    if (slideContainerRef.current) {
      setCurrentPosition(slideContainerRef.current.scrollLeft);
    }
  };

  // Generate duplicated services for seamless infinite scrolling
  const serviceCards = (services: ServiceDisplay[]) => {
    return services.map((service: ServiceDisplay) => (
      <div
        key={service.id}
        className="service-card flex-shrink-0 bg-white/95 rounded-lg overflow-hidden shadow-lg gold-shadow group mx-1 my-1 w-[260px]"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="relative overflow-hidden">
          <img
            src={service.imageUrl}
            alt={service.name[language] || service.name.en}
            className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute bottom-2 right-2 bg-gold/90 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
            {service.price} €
          </div>
        </div>

        <div className="p-4 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-gold rounded-full"></div>

          <h3
            className={`text-lg font-semibold mb-2 ${language === 'ar' ? 'font-arabic' : 'font-display'} text-black-gold`}
          >
            {service.name[language] || service.name.en}
          </h3>
          <p className="text-gray-600 text-xs mb-3 min-h-[2.5rem] line-clamp-3">
            {service.description[language] || service.description.en}
          </p>
          <Link
            to={`/services/${service.slug}`}
            className={`inline-flex items-center px-3 py-1.5 rounded-md border border-gold bg-transparent hover:bg-gold hover:text-white transition-colors duration-300 text-gold font-medium text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
          >
            <span>{t('bookNow')}</span>
            <i
              className={`fas fa-chevron-${dir === 'rtl' ? 'left mr-auto' : 'right ml-1'} text-xs`}
            ></i>
          </Link>
        </div>
      </div>
    ));
  };

  return (
    <section id="services" className="py-8 bg-beige-light overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="royal-heading text-2xl md:text-3xl mb-4">{t('servicesTitle')}</h2>
          <div className="fancy-divider mb-2">
            <i className="fas fa-star fancy-divider-icon text-gold mx-2"></i>
          </div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">{t('servicesSubtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 && !isLoading ? (
          <div className="text-center p-8">
            <p className="text-gray-600">{t('noServiceCategories')}</p>
          </div>
        ) : null}

        {error && (
          <div className="text-center p-8">
            <div className="text-red-500 mb-4">
              <i className="fas fa-exclamation-circle text-3xl"></i>
            </div>
            <p className="text-lg text-gray-600">
              {t('errorLoadingServices', 'Error loading services')}
            </p>
            <p className="text-sm text-gray-500 mt-2">{t('errorPleaseRefresh')}</p>
          </div>
        )}

        {/* Category filters */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <Button
              variant={!selectedCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full px-3 py-1 text-sm"
            >
              {t('all')}
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id.toString())}
                className="rounded-full px-3 py-1 text-sm"
              >
                {typeof category.name === 'string'
                  ? category.name
                  : category.name[language as keyof typeof category.name] || category.name.en}
              </Button>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredServices.length > 0 && (
          <div className="relative">
            {/* Navigation buttons */}
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg text-gold hover:bg-gold hover:text-white transition-colors duration-200 focus:outline-none"
              onClick={() => {
                if (slideContainerRef.current) {
                  const delta = dir === 'rtl' ? 280 : -280;
                  const newPosition = currentPosition + delta;
                  setCurrentPosition(newPosition);
                  slideContainerRef.current.scrollTo({
                    left: newPosition,
                    behavior: 'smooth',
                  });
                }
              }}
              onMouseEnter={() => setAutoScrollPaused(true)}
              onMouseLeave={() => setAutoScrollPaused(false)}
            >
              <i className={`fas fa-chevron-${dir === 'rtl' ? 'right' : 'left'}`}></i>
            </button>

            {/* Services slider container */}
            <div
              ref={slideContainerRef}
              dir={dir}
              className={`overflow-x-scroll scrollbar-none relative flex snap-x snap-mandatory py-2 px-1 -mx-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
              style={{
                scrollBehavior: isDragging ? 'auto' : 'smooth',
                WebkitOverflowScrolling: 'touch',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleDragEnd}
            >
              {/* Render service cards just once - no duplication */}
              {serviceCards(filteredServices)}
            </div>

            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-lg text-gold hover:bg-gold hover:text-white transition-colors duration-200 focus:outline-none"
              onClick={() => {
                if (slideContainerRef.current) {
                  const delta = dir === 'rtl' ? -280 : 280;
                  const newPosition = currentPosition + delta;
                  setCurrentPosition(newPosition);
                  slideContainerRef.current.scrollTo({
                    left: newPosition,
                    behavior: 'smooth',
                  });
                }
              }}
              onMouseEnter={() => setAutoScrollPaused(true)}
              onMouseLeave={() => setAutoScrollPaused(false)}
            >
              <i className={`fas fa-chevron-${dir === 'rtl' ? 'left' : 'right'}`}></i>
            </button>
          </div>
        )}

        {/* View all services link */}
        <div className="text-center mt-6">
          <Link
            to="/services"
            className={`inline-flex items-center btn-royal px-5 py-2.5 rounded-md font-medium text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
          >
            <span>{t('exploreMore')}</span>
            <i
              className={`fas fa-chevron-${dir === 'rtl' ? 'left mr-2' : 'right ml-2'} text-xs`}
            ></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function ServicesCarousel() {
  return (
    <>
      {/* Inject CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Hide scrollbar for Chrome, Safari and Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }

          /* Hide scrollbar for IE, Edge and Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }

          /* Text truncation utility */
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
        }}
      />
      <ServicesSection />
    </>
  );
}
