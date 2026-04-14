import { dashboardCarouselLayout } from '../../carouselLayout';

type PublishedUrlActionsProps = {
  publishedUrl: string;
  onCopy: () => void;
};

function PublishedUrlActions({
  publishedUrl,
  onCopy,
}: PublishedUrlActionsProps) {
  return (
    <div
      className="flex items-center rounded-lg bg-white text-[13px] font-semibold"
      style={{
        flex: '0 0 auto',
        width: dashboardCarouselLayout.primaryActionWidth,
        minWidth: dashboardCarouselLayout.primaryActionWidth,
        maxWidth: dashboardCarouselLayout.primaryActionWidth,
        height: dashboardCarouselLayout.primaryActionHeight,
        paddingInline: dashboardCarouselLayout.primaryActionPaddingX,
      }}
    >
      <a
        href={publishedUrl}
        target="_blank"
        rel="noreferrer"
        onClick={event => {
          event.stopPropagation();
        }}
        className="min-w-0 flex-1 truncate rounded-md select-none text-[13px] text-black transition-colors hover:bg-[#E5E7EB]"
        style={{
          paddingInline: dashboardCarouselLayout.primaryActionInnerPaddingX,
        }}
      >
        {publishedUrl}
      </a>
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onCopy();
        }}
        className="shrink-0 cursor-pointer rounded-md select-none text-[13px] text-primary transition-colors hover:bg-[#E5E7EB]"
        style={{
          flex: '0 0 auto',
          paddingInline: dashboardCarouselLayout.primaryActionInnerPaddingX,
        }}
      >
        복사하기
      </button>
    </div>
  );
}

export default PublishedUrlActions;
