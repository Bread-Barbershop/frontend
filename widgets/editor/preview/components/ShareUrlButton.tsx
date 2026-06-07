import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/shallow';

import CapacityIcon from '@/shared/assets/icons/capacity.svg';
import CellularConnectionIcon from '@/shared/assets/icons/cellular-connection.svg';
import PlusIcon from '@/shared/assets/icons/plus.svg';
import WifiIcon from '@/shared/assets/icons/wifi.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

const useImageObjectUrl = (image?: File | string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      // eslint-disable-next-line
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setImageUrl(typeof image === 'string' ? image : null);
  }, [image]);

  return imageUrl;
};

// --- 메인 컴포넌트: 공유 썸네일 버튼 ---
export const ShareUrlButton = () => {
  const [previewContainer, setPreviewContainer] = useState<HTMLElement | null>(
    null
  );

  const { shareUrl, selectedId, selectedBlock, setIsEdit } = useEditorStore(
    useShallow(state => ({
      shareUrl: state.shareUrl,
      selectedId: state.selectedId,
      selectedBlock: state.selectedBlock,
      setIsEdit: state.setIsEdit,
    }))
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewContainer(document.getElementById('preview-container'));
  }, []);

  const isOpen = selectedId === 'shareUrl';

  const handleToggle = () => {
    if (isOpen) {
      selectedBlock(null);
      return;
    }

    selectedBlock('shareUrl');
    setIsEdit(false);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          'w-full h-11 rounded-lg shadow-edit flex-center text-sm font-semibold transition-all duration-200 ease-out',
          isOpen
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'bg-white text-black hover:bg-gray-50'
        )}
        onClick={handleToggle}
      >
        공유 썸네일
      </button>

      {isOpen &&
        previewContainer &&
        createPortal(
          <KakaoShareUrlView shareUrl={shareUrl} />,
          previewContainer
        )}
    </>
  );
};

// --- 하위 컴포넌트: 카카오톡 공유 썸네일 미리보기 UI ---
const KakaoShareUrlView = ({
  shareUrl,
}: {
  shareUrl: {
    title: string;
    description: string;
    images: (File | string)[];
    showLocationButton: boolean;
    showShareButton: boolean;
  };
}) => {
  const {
    title,
    description,
    images = [],
    showLocationButton = false,
    showShareButton = true,
  } = shareUrl;

  const displayTitle = title || '소중한 분들을 초대합니다.';
  const displayDescription =
    description || '뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.';

  const imageUrl = useImageObjectUrl(images[0]);

  return (
    <div className="absolute top-0 left-0 w-full h-[812px] bg-[#ABC1D1] flex flex-col justify-between overflow-hidden z-50">
      {/* 상단바 */}
      <header>
        <div className="flex justify-between h-10 px-[29px] pl-[49px]">
          <div className="font-semibold text-[17px] flex items-center">
            9:41
          </div>
          <div className="gap-[7px] flex items-center">
            <CellularConnectionIcon />
            <WifiIcon />
            <CapacityIcon />
          </div>
        </div>
        <div className="h-10 w-full flex-center font-semibold text-[13px]">
          미리보기
        </div>
      </header>

      {/* 카카오톡 메시지 본문 */}
      <main className="flex flex-1 gap-2 px-2 py-8">
        <div className="size-[30px] rounded-[10px] bg-[#E2D9CE] overflow-hidden shrink-0" />
        <div className="flex-1">
          <p className="flex items-center h-6 text-[#1A1A1A] text-[13px]">
            사용자님
          </p>
          <div className="bg-white pb-2 w-[260px] rounded-lg shadow-sm">
            {/* 썸네일 이미지 영역 */}
            <div>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="thumbnail"
                  className="w-full aspect-[4/3] object-cover rounded-t-lg"
                />
              ) : (
                <div className="checkerboard checker-size aspect-[4/3] w-full rounded-t-lg" />
              )}
            </div>

            {/* 텍스트 영역 */}
            <div className="px-2.5 mt-2">
              <p className="font-semibold text-[13px] leading-[22px] mb-0.5 truncate text-[#1A1A1A]">
                {displayTitle}
              </p>
              <p className="text-[11px] leading-[16px] mb-2 line-clamp-2 text-[#666666]">
                {displayDescription}
              </p>
            </div>

            {/* 하단 버튼 영역 */}
            {(showShareButton || showLocationButton) && (
              <div className="flex gap-2 px-2.5">
                {showShareButton && (
                  <button className="bg-[#F2F2F2] rounded-[4px] py-[5px] text-[12px] leading-[18px] flex-1 text-[#1A1A1A] transition-colors hover:bg-[#E5E5E5]">
                    보러가기
                  </button>
                )}
                {showLocationButton && (
                  <button className="bg-[#F2F2F2] rounded-[4px] py-[5px] text-[12px] leading-[18px] flex-1 text-[#1A1A1A] transition-colors hover:bg-[#E5E5E5]">
                    위치보기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 하단바 (입력창) */}
      <footer className="bg-white pt-2 pb-1 px-2">
        <div className="flex items-center gap-[6px] mb-2">
          <div className="flex-center size-[28px] rounded-full bg-[#F2F2F2]">
            <PlusIcon />
          </div>
          <div className="bg-[#F2F2F2] rounded-3xl leading-[22px] py-[6px] px-3 text-[#A7A7A7] text-[13px] flex-1">
            카카오 초대장 썸네일 미리보기입니다.
          </div>
        </div>
        <div className="flex justify-center h-[34px]">
          <div className="bg-black h-[5px] mt-[21px] w-[134px] rounded-full" />
        </div>
      </footer>
    </div>
  );
};
