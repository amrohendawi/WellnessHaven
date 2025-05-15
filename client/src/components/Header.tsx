import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gold/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-display text-2xl md:text-3xl font-bold">
                <span className="text-gold">Dubai</span> <span className="text-pink">Rose</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a
              href="#home"
              className="font-medium text-black-gold hover:text-gold transition-all duration-300 relative group"
            >
              {t('menuHome')}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#services"
              className="font-medium text-black-gold hover:text-gold transition-all duration-300 relative group"
            >
              {t('menuServices')}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#membership"
              className="font-medium text-black-gold hover:text-gold transition-all duration-300 relative group"
            >
              {t('menuMembership')}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a
              href="#contact"
              className="font-medium text-black-gold hover:text-gold transition-all duration-300 relative group"
            >
              {t('menuContact')}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>

            <div className="relative h-6 mx-6">
              <div className="absolute inset-0 border-l border-gold/30 rtl:border-r rtl:border-l-0"></div>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            <a href="#booking" className="btn-royal px-6 py-2 rounded-md font-medium shadow-lg">
              {t('bookNow')}
            </a>

            {/* Admin Login */}
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gold"
              aria-label="Toggle mobile menu"
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
          <a
            href="#home"
            onClick={closeMobileMenu}
            className="block py-3 px-4 text-sm hover:bg-gold-light/30 hover:text-gold transition-all border-b border-gold/10"
          >
            {t('menuHome')}
          </a>
          <a
            href="#services"
            onClick={closeMobileMenu}
            className="block py-3 px-4 text-sm hover:bg-gold-light/30 hover:text-gold transition-all border-b border-gold/10"
          >
            {t('menuServices')}
          </a>
          <a
            href="#membership"
            onClick={closeMobileMenu}
            className="block py-3 px-4 text-sm hover:bg-gold-light/30 hover:text-gold transition-all border-b border-gold/10"
          >
            {t('menuMembership')}
          </a>
          <a
            href="#contact"
            onClick={closeMobileMenu}
            className="block py-3 px-4 text-sm hover:bg-gold-light/30 hover:text-gold transition-all border-b border-gold/10"
          >
            {t('menuContact')}
          </a>

          <div className="border-t border-gold/20 my-3"></div>

          {/* Language Switcher Mobile */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse px-4 py-2">
            <LanguageSwitcher />
          </div>

          <a
            href="#booking"
            onClick={closeMobileMenu}
            className="block mx-4 mt-4 mb-2 text-center btn-royal px-4 py-3 rounded-md font-medium"
          >
            {t('bookNow')}
          </a>

          {/* Admin Login */}
          <Link href="/admin" onClick={closeMobileMenu} className="block mx-4 mb-2 text-center">
            <Button variant="outline" size="sm" className="w-full">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
