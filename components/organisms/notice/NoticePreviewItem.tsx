import { Image } from '@/components/atoms/image';
import { previewTextClassName } from '@/components/molecules/text-editor/utils/previewTextClassName';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { cn } from '@/shared/utils/cn';

import type { NoticeListItem } from './noticeList';
import type { StaticImageData } from 'next/image';

export const NoticePreviewItem = ({
  notice,
  defaultImage,
  className,
}: {
  notice: NoticeListItem;
  defaultImage?: StaticImageData;
  className?: string;
}) => {
  const html =
    notice.content.messageHtml ??
    tiptapJsonToHtmlUniversal(notice.content.messageJson);
  const customPreview = useResolvedImageSource(notice.image?.[0]);
  const preview = customPreview ?? defaultImage;

  return (
    <div className={cn('flex flex-col gap-6 overflow-hidden', className)}>
      {preview && (
        <div className="relative h-25 w-full overflow-hidden rounded-3xl">
          <Image
            src={preview}
            alt="공지사항 이미지"
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-6">
        <p className="text-sm text-center font-semibold select-none">
          {notice.notice}
        </p>
        <div
          className={`text-sm text-center select-none ${previewTextClassName}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};
