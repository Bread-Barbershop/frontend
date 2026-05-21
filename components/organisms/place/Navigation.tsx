import Image from 'next/image';

import {
  openKakaoMap,
  openNaverMap,
  openTMap,
} from '@/app/api/place/navigation';
import { Button } from '@/components/atoms/button';
import kakaoMapIcon from '@/shared/assets/icons/kakao-map.png';
import naverMapIcon from '@/shared/assets/icons/naver-map.png';
import tmapIcon from '@/shared/assets/icons/tmap.png';
import { useConfirm } from '@/shared/hooks/useConfirm';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export function Navigation({ lat, lng, name }: Props) {
  const { confirm } = useConfirm();
  const handleNavigation = async(type: 'naver' | 'kakao' | 'tmap') => {
          const isConfirm = await confirm({
        message:
          '편집 내역이 저장되지 않았습니다.\n길안내를 시작하시겠습니까?',
        variant: 'white',
        xPosition : 'center',
        yPosition : 'center'
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
          className="h-auto w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('naver')}
        >
          <Image src={naverMapIcon} alt="" width={22} height={22} />
          <p className="text-sm text-text-tertiary">네이버지도</p>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="h-auto w-26.5 gap-[6px] shadow-btn-drop-black"
          onClick={() => handleNavigation('kakao')}
        >
          <Image src={kakaoMapIcon} alt="" width={22} height={22} />
          <p className="text-sm text-text-tertiary">카카오맵</p>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="h-auto w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('tmap')}
        >
          <Image src={tmapIcon} alt="" width={22} height={22} />
          <p className="text-sm text-text-tertiary">티맵</p>
        </Button>
      </div>
    </div>
  );
}
