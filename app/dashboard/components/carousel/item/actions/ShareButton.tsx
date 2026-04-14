import KakaoIcon from '@/shared/assets/icons/kakao2.svg';

import { dashboardCarouselLayout } from '../../carouselLayout';

function ShareButton() {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-[#FEE500] transition-colors hover:bg-[#e0ca00]"
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
