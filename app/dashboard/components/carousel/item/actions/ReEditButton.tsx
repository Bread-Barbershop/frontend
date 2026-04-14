import { dashboardCarouselLayout } from '../../carouselLayout';

function ReEditButton() {
  return (
    <div
      className="flex select-none items-center justify-center rounded-lg bg-white text-[13px] font-semibold transition-colors hover:bg-[#E5E7EB]"
      style={{
        flex: '0 0 auto',
        width: dashboardCarouselLayout.primaryActionWidth,
        minWidth: dashboardCarouselLayout.primaryActionWidth,
        maxWidth: dashboardCarouselLayout.primaryActionWidth,
        height: dashboardCarouselLayout.primaryActionHeight,
      }}
    >
      재편집하기
    </div>
  );
}

export default ReEditButton;
