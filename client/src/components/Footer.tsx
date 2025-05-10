import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'} justify-between`}>
          <div className="mb-8 md:mb-0">
            <div className="font-display text-2xl font-bold text-gold mb-4">
              Dubai <span className="text-pink">Rose</span>
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              {t('footerTagline')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <i className="fab fa-snapchat"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-medium mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-pink transition-colors">{t('menuHome')}</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-pink transition-colors">{t('menuServices')}</a></li>
                <li><a href="#membership" className="text-gray-400 hover:text-pink transition-colors">{t('menuMembership')}</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-pink transition-colors">{t('aboutUs')}</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-pink transition-colors">{t('menuContact')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">{t('menuServices')}</h4>
              <ul className="space-y-2">
                <li><Link href="/services/laser-hair-removal" className="text-gray-400 hover:text-pink transition-colors">{t('laserHairRemoval')}</Link></li>
                <li><Link href="/services/skin-tightening" className="text-gray-400 hover:text-pink transition-colors">{t('skinTightening')}</Link></li>
                <li><Link href="/services/facial-treatments" className="text-gray-400 hover:text-pink transition-colors">{t('facialTreatments')}</Link></li>
                <li><Link href="/services/hair-services" className="text-gray-400 hover:text-pink transition-colors">{t('hairServices')}</Link></li>
                <li><Link href="/services" className="text-gray-400 hover:text-pink transition-colors">{t('viewAll')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">{t('menuContact')}</h4>
              <ul className="space-y-2">
                <li className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                  <i className={`fas fa-map-marker-alt text-pink ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}></i>
                  <span className="text-gray-400">{t('footerAddress')}</span>
                </li>
                <li className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                  <i className={`fas fa-phone-alt text-pink ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}></i>
                  <span className="text-gray-400">{t('contactPhone')}</span>
                </li>
                <li className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                  <i className={`far fa-envelope text-pink ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}></i>
                  <span className="text-gray-400">info@dubairose.ae</span>
                </li>
                <li className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse justify-end' : ''}`}>
                  <i className={`fas fa-clock text-pink ${dir === 'ltr' ? 'mr-2' : 'ml-2'}`}></i>
                  <span className="text-gray-400">{t('footerHours')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className={`border-t border-gray-800 mt-12 pt-6 flex flex-col ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'} justify-between items-center`}>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Dubai Rose. <span>{t('footerRights')}</span>.
          </p>
          
          <div className={`flex items-center mt-4 md:mt-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <div className={`text-sm text-gray-500 ${dir === 'ltr' ? 'mr-4' : 'ml-4'}`}>
              <span>نسواني فقط</span> | <span>{t('womenOnly')}</span>
            </div>
            
            <div className="flex space-x-2 rtl:space-x-reverse">
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
