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
  const [openNavi, setOpenNavi] = useState(false);
  const [address, setAddress] = useState('');
  const [openAddress, setOpenAddress] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [lng, setLng] = useState<number>();
  const [lat, setLat] = useState<number>();
  const [name, setName] = useState('');

  const searchAddress = (query: string) => {
    naver.maps.Service.geocode({ query }, function (status, response) {
      if (status === naver.maps.Service.Status.ERROR) {
        return alert('주소를 찾을 수 없습니다.');
      }
      if (status === naver.maps.Service.Status.OK) {
        const { x, y } = response.v2.addresses[0];
        if (x === undefined || y === undefined) return;
        setName(response.v2.addresses[0].roadAddress);
        setLng(Number(x));
        setLat(Number(y));
      }
    });
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
      <div className="flex flex-col justify-center items-center gap-2 w-93.75 h-fit">
        <TextField
          label="제목"
          inputProps={{ placeholder: '오시는 길' }}
          className="w-full text-center"
        />
        <section className="flex flex-row gap-2 w-full">
          <Label
            htmlFor="address"
            className="font-semibold shrink-0 text-center"
          >
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
            readOnly
            className="cursor-pointer"
          />
        </section>
        <TextField
          label="예식장명"
          inputProps={{ placeholder: '예식장 이름 입력' }}
          className="w-full text-center"
        />
        <TextField
          label="층과 홀"
          inputProps={{ placeholder: '층과 웨딩홀 이름 입력' }}
          className="w-full text-center"
        />
        <TextField
          label="연락처"
          inputProps={{ placeholder: '예식장 연락처, ex.02-000-000' }}
          className="w-full text-center"
        />
        <section className="flex flex-row gap-1 items-center w-full">
          <Label className="font-semibold">추가 기능</Label>
          <div>
            <div>
              <Checkbox
                direction="right"
                onChange={() => setOpenMap(prev => !prev)}
                checked={openMap}
              >
                지도
              </Checkbox>
            </div>
            <Checkbox
              direction="right"
              onChange={() => setOpenNavi(prev => !prev)}
              checked={openNavi}
            >
              내비 앱 바로가기 버튼(카카오, 티맵, 네이버)
            </Checkbox>
          </div>
        </section>
        {openMap && isScriptLoaded && lng && lat && <Map lng={lng} lat={lat} />}
        {openNavi && <Navigation lat={lat ?? 0} lng={lng ?? 0} name={name} />}
      </div>
    </>
  );
}
export default Place;
