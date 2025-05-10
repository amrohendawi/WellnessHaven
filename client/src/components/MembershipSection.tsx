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
          <div className="vip-card w-full md:w-96 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#f0c75e] to-[#e2b93b] text-white p-6 md:p-8 transform transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-2xl font-bold mb-1">{t('goldCard')}</h3>
                <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">
                  <span className="text-sm font-medium">Premium VIP</span>
                </div>
              </div>
              <div className="text-4xl"><i className="fas fa-crown"></i></div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
              <div className="text-3xl font-bold mb-1">{t('goldDiscount')}</div>
              <div className="text-sm text-white text-opacity-80">{t('goldCost')}</div>
            </div>
            
            <div className="mb-6">
              <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                <span>{t('goldEligibility')}</span>
              </div>
              <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                <span>{t('priorityBooking')}</span>
              </div>
              <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                <span>{t('exclusiveEvents')}</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="font-medium text-sm text-white text-opacity-80 text-center">
                {t('byInvitationOnly')}
              </div>
            </div>
          </div>
          
          {/* Silver Card */}
          <div className="vip-card w-full md:w-96 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#e0e0e0] to-[#b8b8b8] text-gray-800 p-6 md:p-8 transform transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-2xl font-bold mb-1">{t('silverCard')}</h3>
                <div className="bg-white bg-opacity-30 rounded-full px-3 py-1 inline-block">
                  <span className="text-sm font-medium">{t('preferredMember')}</span>
                </div>
              </div>
              <div className="text-4xl"><i className="fas fa-award"></i></div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
              <div className="text-3xl font-bold mb-1">{t('silverDiscount')}</div>
              <div className="text-sm text-gray-800 text-opacity-80">{t('silverCost')}</div>
            </div>
            
            <div className="mb-6">
              <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                <span>{t('silverEligibility')}</span>
              </div>
              <div className={`flex items-center mb-3 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                <span>{t('specialOffers')}</span>
              </div>
              <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <i className={`fas fa-check-circle ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}></i>
                <span>{t('prioritySupport')}</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="font-medium text-sm text-gray-800 text-opacity-80 text-center">
                {t('byInvitationOnly')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
