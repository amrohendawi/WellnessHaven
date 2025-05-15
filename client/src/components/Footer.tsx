import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <footer className="relative bg-black text-white pt-16 pb-8 overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-gold/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-pink opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="font-display text-4xl font-bold text-white flex flex-col items-center mb-2">
              <span className="text-gold">Dubai</span>
              <span className="text-pink mt-1">Rose</span>
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
          </div>
        </div>

        <div
          className={`flex flex-col ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'} justify-between max-w-6xl mx-auto`}
        >
          <div className="mb-10 md:mb-0 md:w-1/3">
            <p className="text-gray-300 max-w-md mb-6 leading-relaxed">{t('footerTagline')}</p>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <i className="fab fa-instagram text-gold"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <i className="fab fa-facebook text-gold"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <i className="fab fa-snapchat text-gold"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <i className="fab fa-tiktok text-gold"></i>
              </a>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-10 md:w-2/3 ${dir === 'rtl' ? 'md:pl-0 md:pr-16' : 'md:pl-16 md:pr-0'}`}
          >
            <div>
              <h4 className="text-lg font-display font-medium mb-5 text-gold">{t('quickLinks')}</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#home"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('menuHome')}
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('menuServices')}
                  </a>
                </li>
                <li>
                  <a
                    href="#membership"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('menuMembership')}
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('aboutUs')}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('menuContact')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-display font-medium mb-5 text-gold">
                {t('menuServices')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/services/laser-hair-removal"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('laserHairRemoval')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/skin-tightening"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('skinTightening')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/facial-treatments"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('facialTreatments')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/hair-services"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('hairServices')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-gray-300 hover:text-gold transition-colors inline-block"
                  >
                    {t('viewAll')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-display font-medium mb-5 text-gold">
                {t('menuContact')}
              </h4>
              <ul className="space-y-4">
                <li
                  className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div
                    className={`w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}
                  >
                    <i className="fas fa-map-marker-alt text-gold text-sm"></i>
                  </div>
                  <span className="text-gray-300">{t('contactAddress')}</span>
                </li>
                <li
                  className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div
                    className={`w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}
                  >
                    <i className="fas fa-phone-alt text-gold text-sm"></i>
                  </div>
                  <span className="text-gray-300">{t('contactPhone')}</span>
                </li>
                <li
                  className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div
                    className={`w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}
                  >
                    <i className="far fa-envelope text-gold text-sm"></i>
                  </div>
                  <span className="text-gray-300">info@dubairose.ae</span>
                </li>
                <li
                  className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div
                    className={`w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${dir === 'ltr' ? 'mr-3' : 'ml-3'}`}
                  >
                    <i className="fas fa-clock text-gold text-sm"></i>
                  </div>
                  <span className="text-gray-300">{t('footerHours')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="fancy-divider mt-16 mb-8">
          <i className="fas fa-rose fancy-divider-icon text-gold mx-2"></i>
        </div>

        <div
          className={`flex flex-col ${dir === 'rtl' ? 'md:flex-row-reverse' : 'md:flex-row'} justify-between items-center text-center md:text-left`}
        >
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Dubai Rose. <span>{t('footerRights')}</span>.
          </p>

          <div
            className={`flex items-center mt-4 md:mt-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`text-sm text-gold/80 px-4 py-2 border border-gold/20 rounded-full ${dir === 'ltr' ? 'mr-4' : 'ml-4'}`}
            >
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
