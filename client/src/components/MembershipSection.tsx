import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { MembershipCard } from './MembershipCard';

const MembershipSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  const goldBenefits = [
    { icon: 'check', text: t('goldEligibility') },
    { icon: 'check', text: t('priorityBooking') },
    { icon: 'check', text: t('exclusiveEvents') },
  ];

  const silverBenefits = [
    { icon: 'check', text: t('silverEligibility') },
    { icon: 'check', text: t('specialOffers') },
    { icon: 'check', text: t('prioritySupport') },
  ];

  return (
    <section
      id="membership"
      className="section-modern bg-gradient-to-br from-white to-beige-light overflow-hidden"
    >
      <div className="container-modern">
        <div className="text-center mb-4 mt-8 animate-fadeInUp">
          <h2 className="royal-heading text-heading mb-8">{t('membershipTitle')}</h2>
          <div className="fancy-divider-modern mb-4">
            <i className="fas fa-crown fancy-divider-icon-modern text-gold mx-2 animate-float" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8 mt-8 will-change-transform">
          {/* Gold Card */}
          <MembershipCard
            type="gold"
            title={t('goldCard')}
            subtitle={t('membershipPremiumVIP')}
            discount={t('goldDiscount')}
            cost={t('goldCost')}
            benefits={goldBenefits}
            byInvitationText={t('byInvitationOnly')}
            dir={dir}
            animationDelay="animation-delay-700"
          />

          {/* Silver Card */}
          <MembershipCard
            type="silver"
            title={t('silverCard')}
            subtitle={t('preferredMember')}
            discount={t('silverDiscount')}
            cost={t('silverCost')}
            benefits={silverBenefits}
            byInvitationText={t('byInvitationOnly')}
            dir={dir}
            animationDelay="animation-delay-1000"
          />
        </div>

        {/* Modern CTA section */}
        <div className="text-center mt-8 mb-8 animate-fadeInUp animation-delay-1200">
          <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto border border-gold/20 shadow-lg">
            <h3 className="text-2xl font-bold text-black-gold mb-4">
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
