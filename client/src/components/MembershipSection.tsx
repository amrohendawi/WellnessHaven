import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

const MembershipSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section id="membership" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="royal-heading text-3xl md:text-4xl mb-8">
            {t('membershipTitle')}
          </h2>
          <div className="fancy-divider mb-4">
            <i className="fas fa-crown fancy-divider-icon text-gold mx-2"></i>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('membershipSubtitle')}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 mt-8">
          {/* Golden Card */}
          <div className="vip-card w-full md:w-96 rounded-2xl overflow-hidden shadow-xl p-0.5 transform transition-all duration-500 bg-gradient-to-r from-gold/30 via-gold to-gold/30">
            <div className="bg-gradient-to-br from-[#f7df8e] to-[#d4af37] text-black-gold rounded-2xl p-6 md:p-8 h-full backdrop-blur-sm">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-xl"></div>
              </div>
              
              <div className="flex justify-between items-start mb-10 relative">
                <div className="max-w-[70%]">
                  <h3 className="font-display text-3xl font-bold mb-2 flex items-center">
                    <i className="fas fa-crown text-gold-dark mr-3 text-xl"></i>
                    <span>{t('goldCard')}</span>
                  </h3>
                  <div className="bg-black/10 rounded-full px-4 py-1 inline-block border border-gold-dark/20">
                    <span className="text-sm font-medium">Premium VIP</span>
                  </div>
                </div>
                <div className="relative w-20 h-20 flex items-center justify-center ml-2 flex-shrink-0">
                  <div className="absolute inset-0 bg-gold-dark opacity-20 rounded-full"></div>
                  <div className="text-5xl text-gold-dark z-10">
                    <i className="fas fa-crown"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/5 backdrop-blur-sm border border-gold-dark/20 rounded-xl p-5 mb-8">
                <div className="flex justify-between items-center text-gold-dark">
                  <span className="text-4xl font-bold">{t('goldDiscount')}</span>
                  <span className="text-base font-normal text-black-gold opacity-80 ml-2">{t('goldCost')}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className={`flex items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} mt-1 bg-gold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{t('goldEligibility')}</span>
                </div>
                <div className={`flex items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} mt-1 bg-gold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{t('priorityBooking')}</span>
                </div>
                <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} mt-1 bg-gold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{t('exclusiveEvents')}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gold-dark/20">
                <div className="font-medium text-sm text-black-gold text-opacity-80 text-center">
                  {t('byInvitationOnly')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Silver Card */}
          <div className="vip-card w-full md:w-96 rounded-2xl overflow-hidden shadow-xl p-0.5 transform transition-all duration-500 bg-gradient-to-r from-[#C0C0C0]/30 via-[#C0C0C0] to-[#C0C0C0]/30">
            <div className="bg-gradient-to-br from-[#f5f5f5] to-[#e6e6e6] text-gray-800 rounded-2xl p-6 md:p-8 h-full backdrop-blur-sm">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-xl"></div>
              </div>
              
              <div className="flex justify-between items-start mb-10 relative">
                <div className="max-w-[70%]">
                  <h3 className="font-display text-3xl font-bold mb-2 flex items-center">
                    <i className="fas fa-award text-gray-500 mr-3 text-xl"></i>
                    <span>{t('silverCard')}</span>
                  </h3>
                  <div className="bg-black/5 rounded-full px-4 py-1 inline-block border border-gray-400/20">
                    <span className="text-sm font-medium">{t('preferredMember')}</span>
                  </div>
                </div>
                <div className="relative w-20 h-20 flex items-center justify-center ml-2 flex-shrink-0">
                  <div className="absolute inset-0 bg-gray-400 opacity-20 rounded-full"></div>
                  <div className="text-5xl text-gray-500 z-10">
                    <i className="fas fa-award"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/5 backdrop-blur-sm border border-gray-400/20 rounded-xl p-5 mb-8">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-4xl font-bold">{t('silverDiscount')}</span>
                  <span className="text-base font-normal text-gray-600 opacity-80 ml-2">{t('silverCost')}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className={`flex items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} mt-1 bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{t('silverEligibility')}</span>
                </div>
                <div className={`flex items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} mt-1 bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{t('specialOffers')}</span>
                </div>
                <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${dir === 'rtl' ? 'ml-3' : 'mr-3'} mt-1 bg-gray-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{t('prioritySupport')}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-400/20">
                <div className="font-medium text-sm text-gray-600 text-opacity-80 text-center">
                  {t('byInvitationOnly')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
