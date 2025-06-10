import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';

const ContactSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section id="contact" className="py-16 bg-beige-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="royal-heading text-3xl md:text-4xl mb-8">{t('contactTitle')}</h2>
          <div className="fancy-divider mb-4">
            <i className="fas fa-envelope fancy-divider-icon text-gold mx-2" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Map */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 h-64 md:h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.754375842194!2d13.43261131581464!3d52.48446647980757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84e3b4e0b1a1b%3A0x6e6f5b6e9b2e5a5f!2sKarl-Marx-Stra%C3%9Fe%2045%2C%2012043%20Berlin%2C%20Germany!5e0!3m2!1sen!2sde!4v1715443380000!5m2!1sen!2sde"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dubai Rose Location"
            />
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
            <div
              className={`grid md:grid-cols-3 gap-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            >
              {/* Address */}
              <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`text-gold-dark ${dir === 'ltr' ? 'mr-4' : 'ml-4'} mt-1`}>
                  <i className="fas fa-map-marker-alt text-2xl" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-lg">{t('address')}</h5>
                  <p className="text-gray-600">{t('contactAddress')}</p>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`text-gold-dark ${dir === 'ltr' ? 'mr-4' : 'ml-4'} mt-1`}>
                  <i className="fas fa-phone-alt text-2xl" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-lg">{t('phone')}</h5>
                  <p className="text-gray-600 mb-3">{t('contactPhone')}</p>
                  <div className="flex flex-col space-y-2">
                    <a
                      href="tel:+491784423645"
                      className="bg-pink-light hover:bg-pink text-gray-800 px-4 py-2 rounded-full text-sm transition-colors inline-flex items-center justify-center"
                    >
                      <i className="fas fa-phone-alt mr-2 rtl:ml-2 rtl:mr-0" /> {t('call')}
                    </a>
                    <a
                      href="https://wa.me/491784423645"
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-full text-sm transition-colors inline-flex items-center justify-center"
                    >
                      <i className="fab fa-whatsapp mr-2 rtl:ml-2 rtl:mr-0" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`text-gold-dark ${dir === 'ltr' ? 'mr-4' : 'ml-4'} mt-1`}>
                  <i className="fas fa-clock text-2xl" />
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-lg">{t('hours')}</h5>
                  <p className="text-gray-600">{t('contactHours')}</p>
                  <p className="text-gray-600">{t('closedFriday')}</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-lg font-medium mb-4">{t('connectSocial')}</p>
              <div className="flex justify-center space-x-6 rtl:space-x-reverse">
                <a
                  href="https://instagram.com"
                  className="text-gray-400 hover:text-gold-dark transition-colors"
                >
                  <i className="fab fa-instagram text-2xl" />
                </a>
                <a
                  href="https://facebook.com"
                  className="text-gray-400 hover:text-gold-dark transition-colors"
                >
                  <i className="fab fa-facebook text-2xl" />
                </a>
                <a
                  href="https://snapchat.com"
                  className="text-gray-400 hover:text-gold-dark transition-colors"
                >
                  <i className="fab fa-snapchat text-2xl" />
                </a>
                <a
                  href="https://tiktok.com"
                  className="text-gray-400 hover:text-gold-dark transition-colors"
                >
                  <i className="fab fa-tiktok text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
