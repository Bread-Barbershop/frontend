'use client';

import Image from 'next/image';

import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';

interface Props {
  blockInfo: EditorBlock<'kakaotalkUrl'>;
  className?: string;
  titleClassName?: string;
  onClick?: () => void;
}

/**
 * 카카오톡 채팅방 내에서 보이는 링크 미리보기(말풍선)를 시뮬레이션하는 Preview 컴포넌트입니다.
 */
export const KakaotalkUrlPreview = ({
  blockInfo,
  className,
  onClick,
}: Props) => {
  const { title, description, images, showShareButton } = blockInfo.props;

  const thumbnailSrc = useResolvedImageSource(
    images && images.length > 0 ? images[0] : undefined
  );

  const displayTitle = title || '초대장 제목이 여기에 표시됩니다.';
  const displayDescription =
    description || '초대장 설명 문구가 여기에 표시됩니다.';

  return (
    <div className={className} onClick={onClick}>
      <div className="max-w-[300px] mx-auto bg-[#FAE100] p-4 rounded-xl font-sans text-[#3C1E1E]">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          {/* 이미지 영역 */}
          <div className="relative aspect-[1.91/1] bg-gray-100 flex items-center justify-center overflow-hidden">
            {thumbnailSrc ? (
              <Image
                src={thumbnailSrc}
                alt="Thumbnail"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="text-gray-400 text-xs text-center p-4">
                이미지 미리보기
                <br />
                (1.91:1 비율 권장)
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="p-3 bg-white">
            <h3 className="text-[15px] font-bold leading-tight mb-1 truncate">
              {displayTitle}
            </h3>
            <p className="text-[13px] text-gray-600 leading-snug line-clamp-2 h-[2.6em]">
              {displayDescription}
            </p>
          </div>

          {/* 하단 버튼 영역 */}
          {showShareButton && (
            <div className="border-t border-gray-100 p-2 bg-white">
              <div className="w-full py-2 bg-gray-50 rounded text-center text-[12px] font-medium text-gray-700">
                초대장 보기
              </div>
            </div>
          )}
        </div>

        {/* 카카오톡 로고 */}
        <div className="mt-2 flex items-center gap-1 opacity-60">
          <div className="w-3 h-3 bg-[#3C1E1E] rounded-full flex items-center justify-center p-[2px]">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12,2C6.48,2,2,5.48,2,9.75c0,2.6,1.7,4.88,4.28,6.23c-0.12,0.44-0.44,1.61-0.5,1.85c-0.08,0.31,0.1,0.31,0.22,0.24 c0.12-0.07,1.96-1.33,2.75-1.89c0.41,0.06,0.83,0.09,1.25,0.09c5.52,0,10-3.48,10-7.75S17.52,2,12,2z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium">카카오톡</span>
        </div>
      </div>
    </div>
  );
};
