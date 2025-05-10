import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

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
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-display text-2xl md:text-3xl font-bold text-gold-dark">
                Dubai <span className="text-pink-dark">Rose</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <a href="#home" className="font-medium hover:text-gold-dark transition-colors">
              {t('menuHome')}
            </a>
            <a href="#services" className="font-medium hover:text-gold-dark transition-colors">
              {t('menuServices')}
            </a>
            <a href="#membership" className="font-medium hover:text-gold-dark transition-colors">
              {t('menuMembership')}
            </a>
            <a href="#contact" className="font-medium hover:text-gold-dark transition-colors">
              {t('menuContact')}
            </a>
            
            <div className="border-l border-gray-300 h-6 mx-2 rtl:border-r rtl:border-l-0"></div>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            <a 
              href="#booking" 
              className="bg-pink bg-opacity-90 hover:bg-pink-dark text-gray-800 px-4 py-2 rounded-md transition-colors font-medium ms-2"
            >
              {t('bookNow')}
            </a>
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gold-dark"
              aria-label="Toggle mobile menu"
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
          <a href="#home" onClick={closeMobileMenu} className="block py-2 px-4 text-sm hover:bg-pink-light rounded">
            {t('menuHome')}
          </a>
          <a href="#services" onClick={closeMobileMenu} className="block py-2 px-4 text-sm hover:bg-pink-light rounded">
            {t('menuServices')}
          </a>
          <a href="#membership" onClick={closeMobileMenu} className="block py-2 px-4 text-sm hover:bg-pink-light rounded">
            {t('menuMembership')}
          </a>
          <a href="#contact" onClick={closeMobileMenu} className="block py-2 px-4 text-sm hover:bg-pink-light rounded">
            {t('menuContact')}
          </a>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          {/* Language Switcher Mobile */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse px-4 py-2">
            <LanguageSwitcher />
          </div>
          
          <a 
            href="#booking" 
            onClick={closeMobileMenu}
            className="block mx-4 mt-2 text-center bg-pink bg-opacity-90 hover:bg-pink-dark text-gray-800 px-4 py-2 rounded-md transition-colors font-medium"
          >
            {t('bookNow')}
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
