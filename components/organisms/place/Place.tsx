'use client';
import Script from 'next/script';
import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { Selector } from '@/components/molecules/selector';
import { TextField } from '@/components/molecules/text-field';

import Map from './Map';
import Navigation from './Navigation';

function Place() {
  const [country, setCountry] = useState<{ label: string; value: string }>();
  const [openMap, setOpenMap] = useState(false);
  const [address, setAddress] = useState('');
  const [openAddress, setOpenAddress] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [dlng, setDLng] = useState<number>();
  const [dlat, setDLat] = useState<number>();
  const [slng, setSLng] = useState<number>();
  const [slat, setSLat] = useState<number>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dname, setDname] = useState('');

  // 현재 위치를 가져올지 아니면 장소까지만 뜨게해서 길찾기를 누르게 할지?

  const searchAddress = (query: string) => {
    naver.maps.Service.geocode({ query }, function (status, response) {
      if (status === naver.maps.Service.Status.ERROR) {
        return alert('주소를 찾을 수 없습니다.');
      }
      if (status === naver.maps.Service.Status.OK) {
        // console.log({ response });
        const { x, y } = response.v2.addresses[0];
        if (x === undefined || y === undefined) return;
        setDLng(Number(x));
        setDLat(Number(y));
      }
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setSLng(longitude);
        setSLat(latitude);
      });
    }
    naver.maps.Service.reverseGeocode(
      {
        coords: new naver.maps.LatLng(slat ?? 0, slng ?? 0),
      },
      function (status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
          console.log('주소를 찾을 수 없습니다.');
        }
        if (status === naver.maps.Service.Status.OK) {
          const { address } = response.v2;
          console.log(address);
          // setDname(address);
        }
      }
    );
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_MAP_KEY}&submodules=geocoder`}
        onReady={() => {
          setIsScriptLoaded(true);
        }}
      />
      <div className="flex flex-col justify-center items-center gap-1 w-93.75 h-fit">
        <TextField label="제목" inputProps={{ placeholder: '오시는 길' }} />
        <section className="flex flex-row gap-1">
          <Label htmlFor="address" className="font-semibold">
            주소
          </Label>
          <Selector
            placeholder="국내"
            options={[
              { value: '국내', label: '국내' },
              { value: '국외', label: '국외' },
            ]}
            onSelect={value => setCountry(value)}
            selected={country ?? null}
          />
          {openAddress && (
            <div className="absolute flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 w-96 shadow-lg relative">
                <button
                  className="absolute top-3 right-3 text-gray-500"
                  onClick={() => setOpenAddress(false)}
                >
                  ✕
                </button>
                <DaumPostcode
                  onComplete={data => {
                    setAddress(data.address);
                    searchAddress(data.address);
                  }}
                  autoClose={false}
                />
              </div>
            </div>
          )}
          <Input
            placeholder="주소 검색"
            id="address"
            onClick={e => {
              e.preventDefault();
              setOpenAddress(prev => !prev);
            }}
            value={address}
          />
        </section>
        <TextField
          label="예식장명"
          inputProps={{ placeholder: '예식장 이름 입력' }}
        />
        <TextField
          label="층과 홀"
          inputProps={{ placeholder: '층과 웨딩홀 입력' }}
        />
        <TextField
          label="연락처"
          inputProps={{ placeholder: '예식장 연락처, ex.02-000-000' }}
        />
        <section className="flex flex-row gap-1 items-center">
          <Label className="font-semibold">추가 기능</Label>
          <div>
            <div>
              <Checkbox
                direction="right"
                onClick={() => setOpenMap(prev => !prev)}
              >
                지도
              </Checkbox>
              <Checkbox direction="right">약도</Checkbox>
            </div>
            <Checkbox direction="right" onClick={getCurrentLocation}>
              내비 앱 바로가기 버튼(카카오, 티맵, 네이버)
            </Checkbox>
            {/* 썸네일로 분리 필요 */}
            <Navigation
              slat={slat ?? 0}
              slng={slng ?? 0}
              sname={address}
              dlat={dlat ?? 0}
              dlng={dlng ?? 0}
              dname={dname}
            />
          </div>
        </section>
        {openMap && isScriptLoaded && dlng && dlat && (
          <Map lng={dlng} lat={dlat} />
        )}
      </div>
    </>
  );
}
export default Place;
