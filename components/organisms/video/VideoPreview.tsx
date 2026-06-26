import { cva } from 'class-variance-authority';
import { Play } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

import { Image } from '@/components/atoms/image';
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';
import { getEmbedUrl } from '@/shared/utils/media/getEmbedUrl';

import { RatioType } from '../gallery/types/galleryType';
import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';
interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'video'>;
  className: string;
  isGuestPage?: boolean;
}

const ThemeColor = 'white';

const youtubeIframeSecurityProps = {
  allow: 'autoplay; encrypted-media; picture-in-picture',
  allowFullScreen: true,
  referrerPolicy: 'strict-origin-when-cross-origin' as const,
  sandbox: 'allow-scripts allow-same-origin allow-presentation',
};

const ratioVariants = cva('', {
  variants: {
    ratio: {
      '1:1': 'aspect-square',
      '3:4': 'aspect-3/4',
      '4:3': 'aspect-4/3',
      '9:16': 'aspect-9/16',
      '16:9': 'aspect-16/9',
    },
  },
});

export const VideoPreview = ({
  blockInfo,
  className,
  isGuestPage = false,
  ...rest
}: Props) => {
  const {
    image,
    videoUrl,
    title,
    ratio,
    checkThumbnail,
    checkedEnglishTitle,
    englishTitle,
  } = blockInfo.props;
  const [isPlaying, setIsPlaying] = useState(false);

  const preview = useResolvedImageSources(image);
  const thumbnail = preview.length > 0 ? preview[0] : null;
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <MiddlePreviewWrapper
      className={className}
      checkedSubTitle={checkedEnglishTitle}
      subTitle={englishTitle}
      subTitleDefault="VIDEO"
      mainTitle={title}
      mainTitleDefault="동영상"
      {...rest}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden group',
          ratioVariants({ ratio: ratio as RatioType })
        )}
      >
        {!embedUrl ? (
          !isGuestPage && (
            /* 1. 영상 URL이 없는 경우 */
            <div className="absolute inset-0 flex items-center justify-center bg-border-neutral">
              <p className="text-text-secondary text-sm">
                영상을 업로드해 주세요.
              </p>
            </div>
          )
        ) : !checkThumbnail ? (
          /* 2. 썸네일 사용 안 함 -> 바로 영상 노출 */
          <iframe
            src={embedUrl as string}
            className="absolute inset-0 w-full h-full border-0"
            {...youtubeIframeSecurityProps}
            title="동영상 플레이어"
          />
        ) : !thumbnail ? (
          /* 3. 썸네일 사용함 + 썸네일 이미지 없음 */
          <div className="absolute inset-0 flex items-center justify-center bg-border-neutral border border-dashed border-border-divider rounded-lg">
            <p className="text-text-secondary text-sm">
              썸네일을 업로드해 주세요.
            </p>
          </div>
        ) : isPlaying ? (
          /* 4. 썸네일 사용함 + 재생 중 */
          <iframe
            src={embedUrl as string}
            className="absolute inset-0 w-full h-full border-0"
            {...youtubeIframeSecurityProps}
            title="동영상 플레이어"
          />
        ) : (
          /* 5. 썸네일 사용함 + 재생 전 (썸네일 노출) */
          <button
            type="button"
            className="absolute inset-0 w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
            title="동영상 재생하기"
          >
            <Image
              src={thumbnail}
              alt="동영상 썸네일"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
              <Play size={48} color={ThemeColor} />
            </div>
          </button>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
};
