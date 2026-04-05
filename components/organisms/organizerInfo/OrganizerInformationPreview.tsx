import { Image } from '@/components/atoms/image';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';
import { isValidUrl } from '@/shared/utils/media/isValidUrl';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  blockInfo: EditorBlock<'organizerInformation'>;
  className: string;
  titleClassName?: string;
}

export const OrganizerInformationPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { title, organizer, url, messageHtml, messageJson, image, hasUrl } =
    blockInfo.props;
  const html = messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);

  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );

  const handleClick = () => {
    if (hasUrl && url && isValidUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (hasUrl && url && !isValidUrl(url)) {
      alert('유효하지 않은 URL입니다.');
    }
  };
  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="ORGANIZER INFORMATION"
      koTitle={title}
      titleClassName={titleClassName}
      childClassName="gap-6"
      {...rest}
    >
      {preview && (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'w-83.75 h-83.75 overflow-hidden rounded-3xl',
            hasUrl &&
              url &&
              'cursor-pointer hover:opacity-80 transition-opacity'
          )}
          aria-label={url && `${organizer} 홈페이지로 이동`}
          title={url && `${organizer} 홈페이지로 이동`}
        >
          <Image
            src={preview}
            alt="주최사 이미지"
            fill
            className="object-cover"
          />
        </button>
      )}
      <p className="text-center text-[16px] font-semibold">{organizer}</p>
      <div
        className="text-sm text-center select-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </MiddlePreviewWrapper>
  );
};
