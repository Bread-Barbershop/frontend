import { Lock, Unlock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label';

import type { MouseEvent } from 'react';

type NaverMap = naver.maps.Map;
type Lng = number;
type Lat = number;

export function PlaceMap({
  lng,
  lat,
  category = '',
  locked = false,
}: {
  lng: Lng;
  lat: Lat;
  category?: string;
  locked?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<NaverMap | null>(null);
  const [prevLocked, setPrevLocked] = useState(locked);
  const [isLocked, setIsLocked] = useState(locked);
  const isLockedRef = useRef(locked);

  if (prevLocked !== locked) {
    setPrevLocked(locked);
    setIsLocked(locked);
  }

  const applyLockOptions = useCallback((targetLocked: boolean) => {
    if (!mapInstance.current) return;
    mapInstance.current.setOptions({
      draggable: !targetLocked,
      scrollWheel: !targetLocked,
      pinchZoom: !targetLocked,
      keyboardShortcuts: !targetLocked,
      disableDoubleClickZoom: targetLocked,
      disableDoubleTapZoom: targetLocked,
      disableTwoFingerTapZoom: targetLocked,
    });
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.naver || !window.naver.maps) return;
    const center = new naver.maps.LatLng(lat, lng);
    const initialLocked = isLockedRef.current;
    mapInstance.current = new naver.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      scaleControl: false,
      draggable: !initialLocked,
      scrollWheel: !initialLocked,
      pinchZoom: !initialLocked,
      keyboardShortcuts: !initialLocked,
      disableDoubleClickZoom: initialLocked,
      disableDoubleTapZoom: initialLocked,
      disableTwoFingerTapZoom: initialLocked,
    });

    new naver.maps.Marker({
      map: mapInstance.current,
      position: center,
    });
  }, [lng, lat]);

  const validatePosition = (lngVal: Lng, latVal: Lat) => {
    if (lngVal > 180 || lngVal < -180 || latVal > 90 || latVal < -90) {
      return false;
    }
    return true;
  };

  // 좌표 변경으로 지도를 새로 만들기 전에 최신 잠금 값을 ref에 반영한다.
  useEffect(() => {
    isLockedRef.current = isLocked;
    applyLockOptions(isLocked);
  }, [isLocked, applyLockOptions]);

  useEffect(() => {
    if (window.naver && window.naver.maps && validatePosition(lng, lat)) {
      initMap();
    }
  }, [initMap, lng, lat]);

  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

  const handleToggleLock = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleLock();
  };

  return (
    <section className="w-full flex flex-col gap-1 items-center">
      <Label
        className={`font-semibold text-center pb-3.5 ${category === 'preview' ? 'hidden' : ''}`}
      >
        지도
      </Label>
      <div className="relative isolate z-0 h-64.5 w-full overflow-hidden rounded-lg">
        <div ref={mapRef} className="h-full w-full" />
        {locked && (
          <button
            type="button"
            onClick={handleToggleLock}
            data-testid="map-lock-button"
            aria-label={isLocked ? '지도 움직이기' : '지도 고정하기'}
            title={isLocked ? '지도 움직이기' : '지도 고정하기'}
            className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-md border border-black/10 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-[2px] transition-all hover:bg-white hover:text-black active:scale-95 cursor-pointer select-none"
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-gray-600" />
                <span>지도 움직이기</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-gray-600" />
                <span>지도 고정하기</span>
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
