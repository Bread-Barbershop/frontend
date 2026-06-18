import PreviewIcon from '@/shared/assets/icons/preview.svg';

import { dashboardCarouselLayout } from '../../carouselLayout';

function PreviewButton() {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-white transition-colors hover:bg-[#E5E7EB]"
      style={{
        width: dashboardCarouselLayout.sideActionSize,
        height: dashboardCarouselLayout.sideActionSize,
        boxShadow: dashboardCarouselLayout.sideActionShadow,
      }}
    >
      <PreviewIcon
        width={dashboardCarouselLayout.sideActionIconSize}
        height={dashboardCarouselLayout.sideActionIconSize}
        aria-hidden="true"
      />
    </div>
  );
}

export default PreviewButton;
