import { useCallback, useEffect, useRef } from 'react';

import { Label } from '@/components/atoms/label';

type NaverMap = naver.maps.Map;
type Lng = number;
type Lat = number;

function Map({
  lng,
  lat,
  category = '',
}: {
  lng: Lng;
  lat: Lat;
  category?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<NaverMap | null>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !naver) return;
    const center = new naver.maps.LatLng(lat, lng);
    mapInstance.current = new naver.maps.Map(mapRef.current, {
      center,
      zoom: 15,
    });

    new naver.maps.Marker({
      map: mapInstance.current,
      position: center,
    });
  }, [lng, lat]);

  useEffect(() => {
    if (naver && naver.maps) {
      initMap();
    }
  }, [initMap]);

  return (
    <section className="w-full flex flex-col gap-1 items-center">
      <Label
        className={`font-semibold text-center pb-3.5 ${category === 'preview' ? 'hidden' : ''}`}
      >
        지도
      </Label>
      <div ref={mapRef} className="rounded-lg w-full h-64.5"></div>
    </section>
  );
}
export default Map;
