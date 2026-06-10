import { dashboardCarouselLayout } from '../carouselLayout';

type ItemHeaderProps = {
  createdTime?: string;
  isPublished: boolean;
};

function formatCreatedDate(createdTime?: string) {
  if (!createdTime) return '날짜 없음';

  const isoDate = createdTime.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return '날짜 없음';
  }

  const [year, month, day] = isoDate.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function ItemHeader({ createdTime, isPublished }: ItemHeaderProps) {
  return (
    <div
      className="flex items-center justify-between rounded-t-lg bg-white px-3"
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.headerHeight,
      }}
    >
      <p className="font-pretendard text-[13px] font-semibold leading-[18px] text-[#121212]">
        {formatCreatedDate(createdTime)}
      </p>
      <div
        aria-label={isPublished ? '공개' : '비공개'}
        className={`relative h-[24px] w-[44px] rounded-full transition-colors ${
          isPublished ? 'bg-[#121212]' : 'bg-[#EAEAEA]'
        }`}
      >
        <span
          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
            isPublished ? 'translate-x-[23px]' : 'translate-x-[3px]'
          }`}
        />
      </div>
    </div>
  );
}

export default ItemHeader;
