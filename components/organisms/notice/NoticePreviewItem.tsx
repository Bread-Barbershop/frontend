import { Image } from '@/components/atoms/image';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

import type { JSONContent } from '@tiptap/react';

export const NoticePreviewItem = ({
  item,
  images,
  index,
}: {
  item: {
    id: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
  images?: (File | string)[];
  index: number;
}) => {
  const html = item.messageHtml ?? tiptapJsonToHtmlUniversal(item.messageJson);
  const preview = useResolvedImageSource(
    (images && images[index]) ||
      (item.image && item.image.length > 0 ? item.image[0] : null)
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
      <div
        className="text-sm text-center select-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
