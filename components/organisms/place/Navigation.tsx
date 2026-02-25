import {
  openKakaoMap,
  openNaverMap,
  openTMap,
} from '@/app/api/place/navigation';
import { Button } from '@/components/atoms/button';

function Navigation({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const handleNavigation = (type: 'naver' | 'kakao' | 'tmap') => {
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
  };

  return (
    <div className="flex flex-row gap-1">
      <Button onClick={() => handleNavigation('kakao')}>카카오맵</Button>
      <Button onClick={() => handleNavigation('tmap')}>티맵</Button>
      <Button onClick={() => handleNavigation('naver')}>네이버맵</Button>
    </div>
  );
}
export default Navigation;
