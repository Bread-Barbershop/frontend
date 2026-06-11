/* eslint-disable @next/next/no-img-element -- Tiny bundled app icons render faster without Next image optimization. */
import {
  openKakaoMap,
  openNaverMap,
  openTMap,
} from '@/app/api/place/navigation';
import { Button } from '@/components/atoms/button';
import kakaoMapIcon from '@/shared/assets/icons/kakao-map.png';
import naverMapIcon from '@/shared/assets/icons/naver-map.png';
import tmapIcon from '@/shared/assets/icons/tmap.png';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useConfirm } from '@/shared/hooks/useConfirm';

const NAVIGATION_ICON_CLASS =
  'block size-3.5 shrink-0 self-center object-contain align-middle';
const NAVIGATION_LABEL_CLASS = 'relative top-px text-sm text-text-tertiary';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export function Navigation({ lat, lng, name }: Props) {
  const { confirm } = useConfirm();
  const { fontFamily, color } = useBodyFontInfo();
  const handleNavigation = async (type: 'naver' | 'kakao' | 'tmap') => {
    const isConfirm = await confirm({
      message: '편집 내역이 저장되지 않았습니다.\n길안내를 시작하시겠습니까?',
      variant: 'white',
      xPosition: 'center',
      yPosition: 'center',
    });

    if (
      // 추후 수정되거나 삭제될 부분
      isConfirm
    ) {
      switch (type) {
        case 'naver':
          openNaverMap(lat, lng, name);
          break;
        case 'kakao':
          openKakaoMap(lat, lng, name);
          break;
        case 'tmap':
          openTMap(lat, lng, name);
          break;
      }
    }
  };

  return (
    <div className="space-y-1">
      <p className="font-bold text-center text-text-tertiary">길 안내</p>
      <div className="flex flex-row items-center justify-center gap-2">
        <Button
          variant="bordered"
          size="sm"
          className="h-[38px] w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('naver')}
        >
          <img
            src={naverMapIcon.src}
            alt=""
            width={14}
            height={14}
            decoding="async"
            className={NAVIGATION_ICON_CLASS}
          />
          <p className={NAVIGATION_LABEL_CLASS} style={{ fontFamily, color }}>
            네이버지도
          </p>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="h-[38px] w-26.5 gap-[6px] shadow-btn-drop-black"
          onClick={() => handleNavigation('kakao')}
        >
          <img
            src={kakaoMapIcon.src}
            alt=""
            width={14}
            height={14}
            decoding="async"
            className={NAVIGATION_ICON_CLASS}
          />
          <p className={NAVIGATION_LABEL_CLASS} style={{ fontFamily, color }}>
            카카오맵
          </p>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="h-[38px] w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('tmap')}
        >
          <img
            src={tmapIcon.src}
            alt=""
            width={14}
            height={14}
            decoding="async"
            className={NAVIGATION_ICON_CLASS}
          />
          <p className={NAVIGATION_LABEL_CLASS} style={{ fontFamily, color }}>
            티맵
          </p>
        </Button>
      </div>
    </div>
  );
}
