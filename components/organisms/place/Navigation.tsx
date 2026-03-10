import {
  openKakaoMap,
  openNaverMap,
  openTMap,
} from '@/app/api/place/navigation';
import { Button } from '@/components/atoms/button';
import MapIcon from '@/shared/assets/icons/map.svg';

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export function Navigation({ lat, lng, name }: Props) {
  const handleNavigation = (type: 'naver' | 'kakao' | 'tmap') => {
    if (
      // 추후 수정되거나 삭제될 부분
      confirm('편집 내역이 저장되지 않았습니다. 길안내를 시작하시겠습니까?')
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
          className="w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('naver')}
        >
          <MapIcon />
          <p className="text-sm text-text-tertiary">네이버지도</p>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('kakao')}
        >
          <MapIcon />
          <p className="text-sm text-text-tertiary">카카오맵</p>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          className="w-26.5 shadow-btn-drop-black"
          onClick={() => handleNavigation('tmap')}
        >
          <MapIcon />
          <p className="text-sm text-text-tertiary">티맵</p>
        </Button>
      </div>
    </div>
  );
}
