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

  return isoDate.replace(/-/g, '.');
}

function ItemHeader({ createdTime, isPublished }: ItemHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-2 rounded-t-lg"
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.headerHeight,
        backgroundColor: '#FFFFFF',
      }}
    >
      <p>{formatCreatedDate(createdTime)}</p>
      <p style={{ color: isPublished ? '#1F72EF' : '#EB4335' }}>
        {isPublished ? 'URL 발행됨' : 'URL 발행 안됨'}
      </p>
    </div>
  );
}

export default ItemHeader;
