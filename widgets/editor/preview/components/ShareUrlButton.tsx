import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/shallow';

import CapacityIcon from '@/shared/assets/icons/capacity.svg';
import CellularConnectionIcon from '@/shared/assets/icons/cellular-connection.svg';
import PlusIcon from '@/shared/assets/icons/plus.svg';
import WifiIcon from '@/shared/assets/icons/wifi.svg';
import BackArrowIcon from '@/shared/assets/images/share-url/back-arrow.svg';
import BubbleTailIcon from '@/shared/assets/images/share-url/bubble-tail.svg';
import MicIcon from '@/shared/assets/images/share-url/mic-icon.svg';
import PlusCircleIcon from '@/shared/assets/images/share-url/plus-icon.svg';
import ProfileAvatarIcon from '@/shared/assets/images/share-url/profile-avatar.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock, ShareUrlState } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';
import {
  resolveShareDescription,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

const GLASS_SHADOW_CLASS =
  'border border-white shadow-[0px_8px_40px_0px_rgba(0,0,0,0.06),0px_2px_32px_0px_rgba(0,0,0,0.06)]';

const GLASS_BACKGROUND_STYLE = {
  backgroundImage: [
    'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.058) 100%)',
    'linear-gradient(0deg, rgba(255, 255, 255, 0.518) 0%, rgba(255, 255, 255, 0.72) 100%)',
    'linear-gradient(180deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0.13) 100%)',
    'linear-gradient(0deg, rgba(255, 255, 255, 0.014) 0%, rgba(255, 255, 255, 0.12) 100%)',
  ].join(', '),
};

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

  const { shareUrl, shareUrlTab, selectedId, selectedBlock, setIsEdit } =
    useEditorStore(
      useShallow(state => ({
        shareUrl: state.shareUrl,
        shareUrlTab: state.shareUrlTab,
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
          shareUrlTab === 'kakao' ? (
            <KakaoShareUrlView shareUrl={shareUrl} />
          ) : (
            <UrlShareUrlView shareUrl={shareUrl} />
          ),
          previewContainer
        )}
    </>
  );
};

// --- 하위 컴포넌트: URL 공유 썸네일 미리보기 UI ---
const UrlShareUrlView = ({ shareUrl }: { shareUrl: ShareUrlState }) => {
  const { urlTitle, urlDescription, urlImage = [] } = shareUrl;

  const displayTitle = resolveShareTitle(urlTitle);
  const displayDescription = resolveShareDescription(urlDescription);
  const imageUrl = useImageObjectUrl(urlImage[0]);

  return (
    <div className="absolute top-0 left-0 z-50 size-full overflow-hidden bg-[#FEFFFF]">
      {/* Status bar */}
      <div className="flex h-10 items-center justify-between px-[29px] pl-[49px]">
        <span className="text-[17px] font-semibold">9:41</span>
        <div className="flex items-center gap-[7px]">
          <CellularConnectionIcon />
          <WifiIcon />
          <CapacityIcon />
        </div>
      </div>

      {/* Back button */}
      <div
        className={cn(
          'absolute left-4 top-10 flex h-[38px] w-[78px] items-center justify-center gap-[9px] overflow-hidden rounded-[24px]',
          GLASS_SHADOW_CLASS
        )}
        style={GLASS_BACKGROUND_STYLE}
      >
        <div className="flex h-[15.5px] w-[8.5px] items-center justify-center">
          <BackArrowIcon className="h-[8.5px] w-[15.5px] rotate-90" />
        </div>
        <span className="flex h-[18px] w-8 items-center justify-center rounded-[10px] bg-[#191919] px-[5px] py-[3px] text-[11px] font-medium leading-none text-white">
          320
        </span>
      </div>

      {/* Profile avatar — Figma 54px 앵커 + negative inset으로 그림자 포함 실제 렌더 크기 맞춤 */}
      <div className="absolute left-[161px] top-10 size-[54px]">
        <div className="absolute inset-[-59.26%_-74.07%_-88.89%_-74.07%] z-1">
          <ProfileAvatarIcon className="size-full" />
        </div>
      </div>

      {/* Header title pill */}
      <div
        className={cn(
          'absolute left-[99px] top-[89px] flex h-[30px] w-[177px] items-center justify-center overflow-hidden rounded-[24px]',
          GLASS_SHADOW_CLASS
        )}
        style={GLASS_BACKGROUND_STYLE}
      >
        <span className="text-[13px] font-bold leading-[22px] text-black">
          미리보기
        </span>
      </div>

      {/* SMS metadata */}
      <div className="absolute left-[128px] top-[143px] flex w-[120px] flex-col items-center gap-1 text-center text-[11px] font-medium tracking-[0.44px] text-[#89898D]">
        <p className="leading-none">
          <span>문자 메세지</span>
          <span>ㆍ</span>
          <span>SMS</span>
        </p>
        <p className="leading-none">(오늘) 오전 9:00</p>
      </div>

      {/* Link preview card */}
      <div className="absolute left-4 top-[181px] flex w-[256px] flex-col items-center">
        <div className="h-[341px] w-[256px] shrink-0 overflow-hidden rounded-t-[16px]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="thumbnail"
              className="size-full object-cover"
            />
          ) : (
            <div className="checkerboard checker-size size-full" />
          )}
        </div>

        <div className="relative w-[256px]">
          <div className="flex w-[256px] flex-col gap-0.5 rounded-b-[16px] bg-[#AAAAAA] py-2 pl-3">
            <p className="w-full truncate text-[14px] font-semibold leading-[22px] tracking-[0.14px] text-black">
              {displayTitle}
            </p>
            <p className="w-full line-clamp-2 text-[11px] font-normal leading-[22px] text-black">
              {displayDescription}
            </p>
          </div>
          <div className="absolute left-[6px] top-[57px] flex h-[10px] w-[12.936px] -scale-y-100 rotate-180 items-center justify-center">
            <BubbleTailIcon className="size-full" />
          </div>
        </div>
      </div>

      {/* Bottom input bar */}
      <div className="absolute left-[23px] top-[750px] flex items-center gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[99px]',
            GLASS_SHADOW_CLASS
          )}
          style={GLASS_BACKGROUND_STYLE}
        >
          <PlusCircleIcon className="size-[14px]" />
        </div>
        <div
          className={cn(
            'flex h-[38px] w-[281px] items-center overflow-hidden rounded-[20px] py-[7px] pl-[14px] pr-[11px]',
            GLASS_SHADOW_CLASS
          )}
          style={GLASS_BACKGROUND_STYLE}
        >
          <span className="min-w-0 flex-1 truncate text-[16px] tracking-[0.64px] text-[#C4C4C6]">
            미리보기 예시입니다.
          </span>
          <MicIcon className="size-[17px] shrink-0" />
        </div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" />
    </div>
  );
};

// --- 하위 컴포넌트: 카카오톡 공유 썸네일 미리보기 UI ---
const KakaoShareUrlView = ({ shareUrl }: { shareUrl: ShareUrlState }) => {
  const block = useEditorStore(state => state.block);
  const placeBlock = block.find(
    (b): b is EditorBlock<'place'> => b.component === 'place'
  );
  const hasValidLocation = Boolean(
    placeBlock &&
      typeof placeBlock.props.lat === 'number' &&
      typeof placeBlock.props.lng === 'number'
  );
  const {
    title,
    description,
    images = [],
    showLocationButton = false,
  } = shareUrl;

  const displayTitle = resolveShareTitle(title);
  const displayDescription = resolveShareDescription(description);

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
            <div className="flex gap-2 px-2.5">
              <button className="bg-[#F2F2F2] rounded-[4px] py-[5px] text-[12px] leading-[18px] flex-1 text-[#1A1A1A] transition-colors hover:bg-[#E5E5E5]">
                보러가기
              </button>
              {hasValidLocation && showLocationButton && (
                <button className="bg-[#F2F2F2] rounded-[4px] py-[5px] text-[12px] leading-[18px] flex-1 text-[#1A1A1A] transition-colors hover:bg-[#E5E5E5]">
                  위치보기
                </button>
              )}
            </div>
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
