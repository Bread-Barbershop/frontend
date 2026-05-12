import { dashboardCarouselLayout } from '../../carouselLayout';

type PublishButtonProps = {
  isPublished: boolean;
  isPublishing: boolean;
  isReadinessPolling: boolean;
  isReadyPending: boolean;
  onPublish: () => void;
};

function PublishButton({
  isPublished,
  isPublishing,
  isReadinessPolling,
  isReadyPending,
  onPublish,
}: PublishButtonProps) {
  const isBusy = isPublishing || isReadinessPolling;
  const label = isPublishing
    ? '발행 중...'
    : isReadinessPolling
      ? '반영 확인 중...'
      : isReadyPending
        ? '반영 지연 중'
        : isPublished
          ? '재발행하기'
          : 'URL 발행하기';

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={event => {
        event.stopPropagation();
        if (isBusy) return;
        onPublish();
      }}
      className={`flex select-none items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-primary transition-colors hover:bg-[#E5E7EB] ${
        isBusy ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
      }`}
      style={{
        flex: '0 0 auto',
        width: dashboardCarouselLayout.primaryActionWidth,
        minWidth: dashboardCarouselLayout.primaryActionWidth,
        maxWidth: dashboardCarouselLayout.primaryActionWidth,
        height: dashboardCarouselLayout.primaryActionHeight,
      }}
    >
      {label}
    </button>
  );
}

export default PublishButton;
