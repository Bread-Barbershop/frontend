import { dashboardCarouselLayout } from '../carouselLayout';

import VisibilityToggle from './VisibilityToggle';

type ItemHeaderProps = {
  createdTime?: string;
  isPublished: boolean;
  disabled?: boolean;
  isBusy?: boolean;
  hasError?: boolean;
  onToggle?: () => void;
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

function ItemHeader({
  createdTime,
  isPublished,
  disabled = false,
  isBusy = false,
  hasError = false,
  onToggle,
}: ItemHeaderProps) {
  return (
    <div
      className="flex items-center justify-between rounded-t-lg bg-white px-3"
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.headerHeight,
      }}
    >
      <p className="font-pretendard text-[13px] font-semibold leading-[18px] text-text-plain">
        {formatCreatedDate(createdTime)}
      </p>
      <VisibilityToggle
        isPublished={isPublished}
        disabled={disabled}
        isBusy={isBusy}
        hasError={hasError}
        onToggle={onToggle}
      />
    </div>
  );
}

export default ItemHeader;
