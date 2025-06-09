'use client';

import { Button } from '@/components/ui/button';
import { Crown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              <Crown className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            </div>
            <div>
              <div className="font-display text-lg md:text-xl font-semibold">
                <span className="text-gold">Dubai</span> <span className="text-pink">Rose</span>
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 hidden md:block">
                Luxury Beauty Center
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a
              href="#home"
              className="text-gray-800 hover:text-gold transition-colors duration-200 font-medium"
            >
              {t('menuHome')}
            </a>
            <a
              href="#services"
              className="text-gray-800 hover:text-gold transition-colors duration-200 font-medium"
            >
              {t('menuServices')}
            </a>
            <a
              href="#membership"
              className="text-gray-800 hover:text-gold transition-colors duration-200 font-medium"
            >
              {t('menuMembership')}
            </a>
            <a
              href="#contact"
              className="text-gray-800 hover:text-gold transition-colors duration-200 font-medium"
            >
              {t('menuContact')}
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Book Now Button */}
            <a
              href="#booking"
              className="hidden md:inline-flex btn-royal px-4 py-2 rounded-md font-medium text-sm text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('bookNow')}
            </a>

            {/* Admin Button */}
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center border-gray-300 hover:border-gold hover:text-gold transition-colors duration-200"
              >
                <Crown className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-700 hover:text-gold transition-colors duration-200 p-1"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-3 pt-2 pb-4">
            <a
              href="#home"
              onClick={closeMobileMenu}
              className="px-4 py-2 text-gray-800 hover:text-gold hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {t('menuHome')}
            </a>
            <a
              href="#services"
              onClick={closeMobileMenu}
              className="px-4 py-2 text-gray-800 hover:text-gold hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {t('menuServices')}
            </a>
            <a
              href="#membership"
              onClick={closeMobileMenu}
              className="px-4 py-2 text-gray-800 hover:text-gold hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {t('menuMembership')}
            </a>
            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="px-4 py-2 text-gray-800 hover:text-gold hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {t('menuContact')}
            </a>

            <div className="pt-2 border-t border-gray-100">
              <div className="px-4 py-2">
                <LanguageSwitcher />
              </div>
            </div>

            <div className="flex flex-col space-y-2 px-4 pt-2">
              <a
                href="#booking"
                onClick={closeMobileMenu}
                className="btn-royal px-4 py-2 rounded-md font-medium text-center text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t('bookNow')}
              </a>

              <Link to="/admin" onClick={closeMobileMenu} className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:border-gold hover:text-gold transition-colors duration-200"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
