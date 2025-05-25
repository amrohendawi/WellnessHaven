interface MembershipCardProps {
  type: 'gold' | 'silver';
  title: string;
  subtitle: string;
  discount: string;
  cost: string;
  benefits: Array<{ icon: string; text: string }>;
  byInvitationText: string;
  dir: 'ltr' | 'rtl';
  animationDelay?: string;
}

export const MembershipCard = ({
  type,
  title,
  subtitle,
  discount,
  cost,
  benefits,
  byInvitationText,
  dir,
  animationDelay = '',
}: MembershipCardProps) => {
  const isGold = type === 'gold';
  const gradient = isGold
    ? 'bg-gradient-to-br from-gold-light via-gold to-gold-dark'
    : 'bg-gradient-to-br from-gray-300 to-gray-500';
  const borderColor = isGold ? 'border-gold/30' : 'border-gray-300/30';
  const bgGradient = isGold
    ? 'from-[#f9f1c2] via-[#f5e08a] to-[#d4af37]'
    : 'from-[#f8f8f8] via-[#e0e0e0] to-[#c0c0c0]';
  const textColor = isGold ? 'text-black-gold' : 'text-gray-700';
  const textMutedColor = isGold ? 'text-black-gold/80' : 'text-gray-600/80';
  const iconColor = isGold ? 'text-black' : 'text-gray-700';
  const shimmerColor = isGold ? 'bg-gold-light/30' : 'bg-gray-300/30';
  const floatColor = isGold ? 'bg-gold/50' : 'bg-gray-300/40';
  const floatColorSecondary = isGold ? 'bg-white/50' : 'bg-white/40';

  return (
    <div
      className={`w-full lg:w-96 animate-fadeInUp ${animationDelay} relative z-10 gpu-accelerated`}
    >
      <div
        className={`vip-card-modern relative overflow-hidden rounded-3xl p-1 ${gradient} shadow-xl ${
          isGold ? 'animate-glow' : ''
        }`}
      >
        <div
          className={`rounded-3xl p-6 lg:p-8 h-full relative overflow-hidden border ${borderColor}`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-100 z-0`}></div>

          {/* Decorative elements */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 ${shimmerColor} rounded-full blur-xl z-0 animate-shimmer`}
          ></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/30 rounded-full blur-xl z-0"></div>
          <div
            className={`absolute -bottom-8 -right-8 w-16 h-16 ${shimmerColor} rounded-full z-0`}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/50 rounded-full z-0 animate-float animation-delay-700"></div>
          <div
            className={`absolute bottom-1/3 right-1/4 w-6 h-6 ${floatColor} rounded-full z-0 animate-float animation-delay-1000`}
          ></div>
          <div
            className={`absolute top-1/2 left-3/4 w-3 h-3 ${floatColorSecondary} rounded-full z-0 animate-float animation-delay-500`}
          ></div>

          {/* Header section */}
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="max-w-[65%]">
              <h3 className="font-display text-3xl font-bold mb-3 flex items-center">
                <div
                  className={`w-12 h-12 ${isGold ? 'bg-gradient-to-br from-gold to-gold-dark' : 'bg-gradient-to-br from-gray-300 to-gray-400'} rounded-full flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 shadow-lg`}
                >
                  <i className={`fas fa-${isGold ? 'crown' : 'star'} ${iconColor} text-xl`}></i>
                </div>
                <span className={textColor}>{title}</span>
              </h3>
              <div
                className={`backdrop-blur-sm rounded-full px-4 py-1.5 inline-block border ${borderColor} bg-black/5 shadow-sm`}
              >
                <span className={`text-sm font-bold ${textColor}`}>{subtitle}</span>
              </div>
            </div>
            <div className="relative w-20 h-20 flex items-center justify-center ml-2 flex-shrink-0">
              <div
                className={`absolute inset-0 ${isGold ? 'bg-gradient-to-br from-gold to-gold-dark' : 'bg-gradient-to-br from-gray-300 to-gray-400'} opacity-20 rounded-full animate-pulse`}
              ></div>
              <div
                className={`relative z-10 w-16 h-16 rounded-full ${isGold ? 'bg-gold' : 'bg-gray-300'} flex items-center justify-center shadow-inner`}
              >
                <i className={`fas fa-${isGold ? 'crown' : 'star'} ${iconColor} text-2xl`}></i>
              </div>
            </div>
          </div>

          {/* Price section */}
          <div
            className={`backdrop-blur-sm border ${borderColor} rounded-2xl p-6 mb-8 relative overflow-hidden shadow-md z-10`}
          >
            <div
              className={`absolute -top-8 -right-8 w-16 h-16 ${gradient} rounded-full opacity-30`}
              style={{ animation: 'rotate 8s linear infinite' }}
            ></div>
            <div className="relative z-10">
              <div className={`text-4xl font-bold ${textColor} mb-2 animate-slideInLeft`}>
                {discount}
              </div>
              <div
                className={`text-base font-medium ${textMutedColor} animate-slideInRight animation-delay-500`}
              >
                {cost}
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div className="mb-8 relative z-10">
            <h4 className="font-medium text-lg mb-4 text-gray-700">Benefits include:</h4>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index}>
                  <div
                    className={`group flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''} hover:bg-white/20 p-2 rounded-lg transition-colors`}
                  >
                    <div
                      className={`${dir === 'rtl' ? 'ml-4' : 'mr-4'} mt-1 ${gradient} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform ${dir === 'rtl' ? 'order-2' : ''}`}
                    >
                      <i className={`fas fa-${benefit.icon} ${iconColor} text-sm`}></i>
                    </div>
                    <span className={`font-medium ${textColor}`}>{benefit.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className={`pt-4 border-t ${borderColor} z-10 relative`}>
            <div className="text-center">
              <div
                className={`backdrop-blur-sm px-4 py-2 rounded-full inline-block border ${borderColor} bg-white/10`}
              >
                <span className={`font-medium text-sm ${textMutedColor}`}>{byInvitationText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
