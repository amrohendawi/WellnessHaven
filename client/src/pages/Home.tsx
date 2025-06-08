import AboutSection from '@/components/AboutSection';
import BookingSection from '@/components/BookingSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MembershipSection from '@/components/MembershipSection';
import ServicesSection from '@/components/ServicesSection';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  // Handle smooth scroll for navigation
  useEffect(() => {
    const handleHashLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if the clicked element is an anchor with hash
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();

        const targetId = target.getAttribute('href');
        if (!targetId) return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - 80, // Accounting for fixed header
            behavior: 'smooth',
          });

          // Update URL hash without scrolling
          window.history.pushState(null, '', targetId);
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('click', handleHashLinkClick);

    // Clean up
    return () => {
      document.removeEventListener('click', handleHashLinkClick);
    };
  }, []);

  // Set document title
  useEffect(() => {
    document.title = `${t('siteName')} - ${t('siteTagline')}`;
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <MembershipSection />
        <BookingSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
