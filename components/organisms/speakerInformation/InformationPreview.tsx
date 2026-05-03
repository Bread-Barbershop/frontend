import { JSONContent } from '@tiptap/react';

import { Image } from '@/components/atoms/image';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

export const InformationPreview = ({
  speaker,
  images,
  index,
}: {
  speaker: {
    id: string;
    name: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
  images?: (File | string)[];
  index: number;
}) => {
  const html =
    speaker.messageHtml ?? tiptapJsonToHtmlUniversal(speaker.messageJson);
  const preview = useResolvedImageSource(
    (images && images[index]) ||
      (speaker.image && speaker.image.length > 0 ? speaker.image[0] : null)
  );
  return (
    <div className="flex flex-col items-center gap-6">
      {preview && (
        <div className="w-83.75 h-83.75 overflow-hidden rounded-3xl">
          <Image
            src={preview}
            alt="연사자 이미지"
            fill
            className="object-cover"
          />
        </div>
      )}
      {!preview && (
        <div className="w-83.75 h-83.75 overflow-hidden rounded-3xl border border-dashed border-gray-300 flex items-center justify-center">
          <p className="text-text-secondary text-sm">
            이미지를 업로드해 주세요.
          </p>
        </div>
      )}
      <p className="w-full px-5 text-center text-[16px] font-semibold">
        {speaker.name}
      </p>
      <div
        className="w-full px-5 text-sm text-center select-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
