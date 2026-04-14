import { dashboardCarouselLayout } from '../../carouselLayout';

type PublishButtonProps = {
  isPublished: boolean;
  isPublishing: boolean;
  onPublish: () => void;
};

function PublishButton({
  isPublished,
  isPublishing,
  onPublish,
}: PublishButtonProps) {
  return (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation();
        onPublish();
      }}
      className="flex cursor-pointer select-none items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-primary transition-colors hover:bg-[#E5E7EB]"
      style={{
        flex: '0 0 auto',
        width: dashboardCarouselLayout.primaryActionWidth,
        minWidth: dashboardCarouselLayout.primaryActionWidth,
        maxWidth: dashboardCarouselLayout.primaryActionWidth,
        height: dashboardCarouselLayout.primaryActionHeight,
      }}
    >
      {isPublishing
        ? '발행 중...'
        : isPublished
          ? '재발행하기'
          : 'URL 발행하기'}
    </button>
  );
}

export default PublishButton;
