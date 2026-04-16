import KakaoIcon from '@/shared/assets/icons/kakao2.svg';

import { dashboardCarouselLayout } from '../../carouselLayout';

type ShareButtonProps = {
  disabled?: boolean;
};

function ShareButton({ disabled = false }: ShareButtonProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-[#FEE500] transition-colors ${
        disabled ? 'opacity-60' : 'hover:bg-[#e0ca00]'
      }`}
      style={{
        width: dashboardCarouselLayout.sideActionSize,
        height: dashboardCarouselLayout.sideActionSize,
        boxShadow: dashboardCarouselLayout.sideActionShadow,
      }}
    >
      <KakaoIcon width={18} height={18} aria-hidden="true" />
    </div>
  );
}

export default ShareButton;
