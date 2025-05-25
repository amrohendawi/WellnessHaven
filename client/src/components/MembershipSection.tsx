import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';

const MembershipSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  return (
    <section
      id="membership"
      className="section-modern bg-gradient-to-br from-white to-beige-light overflow-hidden"
    >
      <div className="container-modern">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="royal-heading text-heading mb-8">{t('membershipTitle')}</h2>
          <div className="fancy-divider-modern mb-4">
            <i className="fas fa-crown fancy-divider-icon-modern text-gold mx-2 animate-float"></i>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('membershipSubtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 mt-8 will-change-transform">
          {/* Golden Card */}
          <div className="w-full lg:w-96 animate-fadeInUp animation-delay-700 relative z-10 gpu-accelerated">
            <div className="vip-card-modern relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-gold-light via-gold to-gold-dark shadow-xl animate-glow">
              <div className="rounded-3xl p-6 lg:p-8 h-full relative overflow-hidden border border-gold/30">
                {/* Enhanced gold background with layered gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f9f1c2] via-[#f5e08a] to-[#d4af37] opacity-100 z-0"></div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-light/30 rounded-full blur-xl z-0 animate-shimmer"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/30 rounded-full blur-xl z-0"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gold/20 rounded-full blur-xl animate-float z-0"></div>
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/50 rounded-full z-0 animate-float animation-delay-700"></div>
                <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-gold/50 rounded-full z-0 animate-float animation-delay-1000"></div>
                <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-white/60 rounded-full z-0 animate-float animation-delay-500"></div>

                {/* Header section with improved spacing */}
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="max-w-[65%]">
                    <h3 className="font-display text-3xl font-bold mb-3 flex items-center text-black-gold">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 shadow-lg">
                        <i className="fas fa-crown text-black text-xl"></i>
                      </div>
                      <span>{t('goldCard')}</span>
                    </h3>
                    <div className="backdrop-blur-sm rounded-full px-4 py-1.5 inline-block border border-gold-dark/30 bg-black/5 shadow-sm">
                      <span className="text-sm font-bold text-black-gold">Premium VIP</span>
                    </div>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center ml-2 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold to-gold-dark opacity-20 rounded-full animate-pulse"></div>
                    <div className="text-5xl text-gold-dark z-10 animate-float">
                      <i className="fas fa-gem"></i>
                    </div>
                  </div>
                </div>

                {/* Discount section with enhanced styling */}
                <div className="backdrop-blur-sm border border-gold-dark/30 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-md z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent z-0"></div>
                  {/* Rotating corner decoration */}
                  <div
                    className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-gold-light to-gold-dark rounded-full opacity-30"
                    style={{ animation: 'rotate 8s linear infinite' }}
                  ></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-black-gold mb-2 animate-slideInLeft">
                      {t('goldDiscount')}
                    </div>
                    <div className="text-base font-medium text-black-gold/80 animate-slideInRight animation-delay-500">
                      {t('goldCost')}
                    </div>
                  </div>
                </div>

                {/* Benefits list with hover effects */}
                <div className="space-y-5 mb-8 z-10 relative">
                  {[
                    { icon: 'check', text: t('goldEligibility') },
                    { icon: 'check', text: t('priorityBooking') },
                    { icon: 'check', text: t('exclusiveEvents') },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''} group`}
                    >
                      <div
                        className={`${dir === 'rtl' ? 'ml-4' : 'mr-4'} mt-1 bg-gradient-to-br from-gold to-gold-dark rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <i className={`fas fa-${benefit.icon} text-black text-sm`}></i>
                      </div>
                      <span className="font-medium text-black-gold">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Footer with updated styling */}
                <div className="pt-4 border-t border-gold-dark/30 z-10 relative">
                  <div className="text-center">
                    <div className="backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-gold-dark/30 bg-white/10">
                      <span className="font-medium text-sm text-black-gold/80">
                        {t('byInvitationOnly')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Silver Card */}
          <div className="w-full lg:w-96 animate-fadeInUp animation-delay-1000 relative z-10 gpu-accelerated">
            <div className="vip-card-modern relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-xl animate-glow">
              <div className="rounded-3xl p-6 lg:p-8 h-full relative overflow-hidden border border-gray-300/30">
                {/* Enhanced silver background with layered gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8f8f8] via-[#e0e0e0] to-[#c0c0c0] opacity-100 z-0"></div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300/30 rounded-full blur-xl z-0 animate-shimmer"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/30 rounded-full blur-xl z-0"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-400/20 rounded-full blur-xl animate-float animation-delay-700 z-0"></div>
                <div className="absolute top-1/4 right-1/4 w-5 h-5 bg-white/40 rounded-full z-0 animate-float animation-delay-500"></div>
                <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-gray-300/40 rounded-full z-0 animate-float animation-delay-1200"></div>
                <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-white/50 rounded-full z-0 animate-float animation-delay-1500"></div>

                {/* Header section with improved spacing */}
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="max-w-[65%]">
                    <h3 className="font-display text-3xl font-bold mb-3 flex items-center text-gray-800">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 shadow-lg">
                        <i className="fas fa-award text-white text-xl"></i>
                      </div>
                      <span>{t('silverCard')}</span>
                    </h3>
                    <div className="backdrop-blur-sm rounded-full px-4 py-1.5 inline-block border border-gray-400/30 bg-black/5 shadow-sm">
                      <span className="text-sm font-bold text-gray-700">
                        {t('preferredMember')}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center ml-2 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 opacity-20 rounded-full animate-pulse"></div>
                    <div className="text-5xl text-gray-500 z-10 animate-float animation-delay-500">
                      <i className="fas fa-medal"></i>
                    </div>
                  </div>
                </div>

                {/* Discount section with enhanced styling */}
                <div className="backdrop-blur-sm border border-gray-400/30 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-md z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300/10 to-transparent z-0"></div>
                  {/* Rotating corner decoration */}
                  <div
                    className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full opacity-30"
                    style={{ animation: 'rotate 10s linear infinite' }}
                  ></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-gray-700 mb-2 animate-slideInLeft animation-delay-700">
                      {t('silverDiscount')}
                    </div>
                    <div className="text-base font-medium text-gray-600/80 animate-slideInRight animation-delay-1000">
                      {t('silverCost')}
                    </div>
                  </div>
                </div>

                {/* Benefits list with hover effects */}
                <div className="space-y-5 mb-8 z-10 relative">
                  {[
                    { icon: 'check', text: t('silverEligibility') },
                    { icon: 'check', text: t('specialOffers') },
                    { icon: 'check', text: t('prioritySupport') },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''} group`}
                    >
                      <div
                        className={`${dir === 'rtl' ? 'ml-4' : 'mr-4'} mt-1 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                      >
                        <i className={`fas fa-${benefit.icon} text-white text-sm`}></i>
                      </div>
                      <span className="font-medium text-gray-700">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                {/* Footer with updated styling */}
                <div className="pt-4 border-t border-gray-400/30 z-10 relative">
                  <div className="text-center">
                    <div className="backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-gray-400/30 bg-white/10">
                      <span className="font-medium text-sm text-gray-600/80">
                        {t('byInvitationOnly')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern CTA section */}
        <div className="text-center mt-16 animate-fadeInUp animation-delay-1200">
          <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto border border-gold/20 shadow-lg">
            <h3 className="text-heading font-bold text-black-gold mb-4">
              {t('interestedInMembership', 'Interested in Membership?')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t(
                'contactUsForDetails',
                'Contact us for more details about our exclusive membership programs.'
              )}
            </p>
            <a
              href="#contact"
              className="btn-modern inline-flex items-center group hover-lift-modern"
            >
              <span>{t('contactUs', 'Contact Us')}</span>
              <i
                className={`fas fa-arrow-${dir === 'rtl' ? 'left' : 'right'} ml-3 rtl:mr-3 rtl:ml-0 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1`}
              ></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
