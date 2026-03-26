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
}

const ThemeColor = 'white';

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

export const VideoPreview = ({ blockInfo, className, ...rest }: Props) => {
  const { image, videoUrl, title, ratio } = blockInfo.props;
  const [isPlaying, setIsPlaying] = useState(false);

  const preview = useResolvedImageSources(image);
  const thumbnail = preview.length > 0 ? preview[0] : null;
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <MiddlePreviewWrapper className={className} noTitle={true} {...rest}>
      <p className="text-[20px] text-[#FA7564] font-medium">{title}</p>

      <div
        className={cn(
          'relative w-full overflow-hidden group',
          ratioVariants({ ratio: ratio as RatioType })
        )}
      >
        {isPlaying && (
          <iframe
            src={embedUrl as string}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="동영상 플레이어"
          />
        )}
        {!isPlaying && (
          <button
            type="button"
            disabled={!thumbnail || !embedUrl}
            className={cn(
              'absolute inset-0 w-full h-full',
              thumbnail && embedUrl && 'cursor-pointer'
            )}
            onClick={() => thumbnail && embedUrl && setIsPlaying(true)}
            title="동영상 재생하기"
          >
            {thumbnail && embedUrl && (
              <>
                <Image
                  src={thumbnail}
                  alt="동영상 썸네일"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                  <Play size={48} color={ThemeColor} />
                </div>
              </>
            )}
            {(!thumbnail || !embedUrl) && (
              <div className="absolute inset-0 flex items-center justify-center bg-border-neutral">
                <p className="text-text-secondary">영상을 업로드해 주세요.</p>
              </div>
            )}
          </button>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
};
