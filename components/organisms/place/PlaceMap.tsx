import { useCallback, useEffect, useRef } from 'react';

import { Label } from '@/components/atoms/label';

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

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.naver || !window.naver.maps) return;
    const center = new naver.maps.LatLng(lat, lng);
    mapInstance.current = new naver.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      scaleControl: false,
      draggable: !locked,
      scrollWheel: !locked,
      pinchZoom: !locked,
      keyboardShortcuts: !locked,
      disableDoubleClickZoom: locked,
      disableDoubleTapZoom: locked,
      disableTwoFingerTapZoom: locked,
    });

    new naver.maps.Marker({
      map: mapInstance.current,
      position: center,
    });
  }, [lng, lat, locked]);

  const validatePosition = (lng: Lng, lat: Lat) => {
    if (lng > 180 || lng < -180 || lat > 90 || lat < -90) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (window.naver && window.naver.maps && validatePosition(lng, lat)) {
      initMap();
    }
  }, [initMap, lng, lat]);

  return (
    <section className="w-full flex flex-col gap-1 items-center">
      <Label
        className={`font-semibold text-center pb-3.5 ${category === 'preview' ? 'hidden' : ''}`}
      >
        지도
      </Label>
      <div
        ref={mapRef}
        className="relative isolate z-0 h-64.5 w-full overflow-hidden rounded-lg"
      ></div>
    </section>
  );
}
