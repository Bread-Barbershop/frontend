import { JSONContent } from '@tiptap/react';

import { Image } from '@/components/atoms/image';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

export const InformationPreview = ({
  speaker,
}: {
  speaker: {
    id: string;
    name: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
}) => {
  const html =
    speaker.messageHtml ?? tiptapJsonToHtmlUniversal(speaker.messageJson);
  const preview = useResolvedImageSource(
    speaker.image && speaker.image.length > 0 ? speaker.image[0] : null
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
      <p className="text-center text-[16px] font-semibold">{speaker.name}</p>
      <div
        className="text-sm text-center select-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
