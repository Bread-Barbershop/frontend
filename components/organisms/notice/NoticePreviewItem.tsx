import { Image } from '@/components/atoms/image';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

import type { JSONContent } from '@tiptap/react';

export const NoticePreviewItem = ({
  notice,
  images,
  index,
}: {
  notice: {
    id: string;
    notice: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
  images?: (File | string)[];
  index: number;
}) => {
  const html =
    notice.messageHtml ?? tiptapJsonToHtmlUniversal(notice.messageJson);
  const preview = useResolvedImageSource(
    (images && images[index]) ||
      (notice.image && notice.image.length > 0 ? notice.image[0] : null)
  );

  return (
    <div className="w-65 flex flex-col gap-4 overflow-hidden">
      {!preview && (
        <div className="h-25 overflow-hidden rounded-3xl flex flex-col justify-center items-center bg-border-neutral">
          <p className="text-sm text-center select-none">
            사진을 추가해 주세요.
          </p>
        </div>
      )}
      {preview && (
        <div className="h-25 overflow-hidden rounded-3xl">
          <Image
            src={preview}
            alt="공지사항 이미지"
            width={260}
            height={100}
            className="object-cover"
          />
        </div>
      )}
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
