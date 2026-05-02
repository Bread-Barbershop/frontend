import { Image } from '@/components/atoms/image';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import noticeFallbackImage from '@/shared/assets/images/fallback/notice-fallback.png';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

import type { JSONContent } from '@tiptap/react';

export const NoticePreviewItem = ({
  notice,
  images,
  index,
}: {
  notice: {
    noticeId: string;
    notice: string;
    content: {
      messageJson: JSONContent | null;
      messageHtml: string | null;
    };
    image: (File | string)[];
  };
  images?: (File | string)[];
  index: number;
}) => {
  const html =
    notice.content.messageHtml ??
    tiptapJsonToHtmlUniversal(notice.content.messageJson);
  const preview = useResolvedImageSource(
    (images && images[index]) ||
      (notice.image && notice.image.length > 0 ? notice.image[0] : null)
  );
  const imageSrc = preview || noticeFallbackImage;

  return (
    <div className="w-65 flex flex-col gap-4 overflow-hidden">
      <div className="relative h-25 overflow-hidden rounded-3xl">
        <Image
          src={imageSrc}
          alt="공지사항 이미지"
          fill
          sizes="260px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-center font-semibold select-none">
          {notice.notice}
        </p>
        <div
          className="text-sm text-center select-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};
