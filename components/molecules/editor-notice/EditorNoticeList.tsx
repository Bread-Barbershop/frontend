import { cn } from '@/shared/utils/cn';

export type EditorNoticeItem = {
  id: string | number;
  text: string;
  colorClass?: string;
};

type EditorNoticeListProps = {
  notices: EditorNoticeItem[];
  className?: string;
};

function EditorNoticeList({ notices, className }: EditorNoticeListProps) {
  if (notices.length === 0) return null;

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {notices.map(({ id, text, colorClass = 'text-text-secondary' }) => {
        const normalizedColorClass = colorClass.toLowerCase();
        const isBlueNotice =
          normalizedColorClass.includes('#1f72ef') ||
          normalizedColorClass.includes('blue');

        return (
          <p
            key={id}
            className={cn(
              'grid grid-cols-[auto_1fr] gap-x-2 break-keep text-[13px]',
              isBlueNotice ? 'font-medium' : 'font-normal',
              colorClass
            )}
          >
            <span aria-hidden="true">·</span>
            <span>{text}</span>
          </p>
        );
      })}
    </div>
  );
}

export default EditorNoticeList;
