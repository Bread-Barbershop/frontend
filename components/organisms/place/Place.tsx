'use client';
import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { useShallow } from 'zustand/shallow';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Selector } from '@/components/molecules/selector';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { Popup } from '../popup/Popup';

import { NaverMapScript } from './NaverMapScript';
import { PlaceMap } from './PlaceMap';
interface Props {
  blockInfo: EditorBlock<'place'>;
  id: string;
}

export function Place({ blockInfo, id }: Props) {
  const [openAddress, setOpenAddress] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const { updateBlock } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
    }))
  );

  const {
    title,
    englishTitle,
    placeName,
    placeDetail,
    placeAddress,
    placeTel,
    checkedEnglishTitle,
    openMap,
    openNavi,
    lng,
    lat,
    country,
  } = blockInfo.props;

  const searchAddress = (query: string) => {
    if (!isScriptLoaded || !window.naver) {
      alert('지도를 불러오는 중입니다. 잠시후 다시 시도해주세요.');
      return;
    }
    naver.maps.Service.geocode({ query }, function (status, response) {
      if (status === naver.maps.Service.Status.ERROR) {
        return alert('주소를 찾을 수 없습니다.');
      }
      if (status === naver.maps.Service.Status.OK) {
        const addr = response.v2.addresses[0];
        const { x, y } = addr;
        if (x === undefined || y === undefined) return;

        updateBlock(id, {
          placeAddress: addr.roadAddress || addr.jibunAddress,
          lng: Number(x),
          lat: Number(y),
        });
        setOpenAddress(false);
      }
    });
  };

  const handleUpdateBlock = (key: string, value: string | number | boolean) => {
    updateBlock(id, { [key]: value });
  };

  return (
    <>
      <NaverMapScript onReady={() => setIsScriptLoaded(true)} />
      <LeftEditorWrapper className="gap-4 pb-3" ariaLabel="오시는 길">
        <div className="flex flex-col gap-1 w-full">
          <NavigationBar>오시는 길</NavigationBar>
          <TextField
            label="제목"
            inputProps={{
              placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
              onChange: e => handleUpdateBlock('title', e.target.value),
              value: title,
            }}
            className="w-full text-center"
          />
        </div>
        {checkedEnglishTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
              value: englishTitle,
              onChange: e => handleUpdateBlock('englishTitle', e.target.value),
            }}
            className="text-center w-full"
          />
        )}
        <section className="flex flex-row gap-2 w-full">
          <Label
            htmlFor="address"
            className="font-semibold shrink-0 text-center"
          >
            주소
          </Label>
          <Selector
            type="normal"
            className="w-[63px]"
            placeholder="국내"
            options={[
              { value: '국내', label: '국내' },
              { value: '국외', label: '국외' },
            ]}
            onSelect={val => handleUpdateBlock('country', val.value)}
            selected={country ? { label: country, value: country } : null}
          />
          {openAddress && (
            <Popup
              onClose={() => setOpenAddress(false)}
              popupTitle="주소 검색"
              wrapperClassName="max-w-[480px] h-[640px]"
            >
              <DaumPostcode
                onComplete={data => {
                  searchAddress(data.address);
                }}
                autoClose={false}
                style={{ height: '560px' }}
              />
            </Popup>
          )}
          <Input
            placeholder="주소 검색"
            id="address"
            onClick={e => {
              e.preventDefault();
              setOpenAddress(prev => !prev);
            }}
            value={placeAddress}
            readOnly
            className="cursor-pointer"
          />
        </section>
        <TextField
          label="예식장명"
          inputProps={{
            placeholder: '예식장 이름 입력',
            onChange: e => handleUpdateBlock('placeName', e.target.value),
            value: placeName,
          }}
          className="w-full text-center"
        />
        <TextField
          label="층과 홀"
          inputProps={{
            placeholder: '층과 웨딩홀 이름 입력',
            onChange: e => handleUpdateBlock('placeDetail', e.target.value),
            value: placeDetail,
          }}
          className="w-full text-center"
        />
        <TextField
          label="연락처"
          inputProps={{
            placeholder: '예식장 연락처, ex.02-000-000',
            onChange: e => handleUpdateBlock('placeTel', e.target.value),
            value: placeTel,
          }}
          className="w-full text-center"
        />
        <section className="flex flex-row gap-2 items-center w-full">
          <Label className="font-semibold">추가기능</Label>
          <div>
            <div className="flex flex-row gap-2 items-center">
              <Checkbox
                onChange={e =>
                  handleUpdateBlock('checkedEnglishTitle', e.target.checked)
                }
                checked={checkedEnglishTitle}
              >
                영문 제목 추가
              </Checkbox>
              <Checkbox
                direction="right"
                onChange={() => handleUpdateBlock('openMap', !openMap)}
                checked={openMap}
              >
                지도
              </Checkbox>
            </div>
            <Checkbox
              direction="right"
              onChange={() => handleUpdateBlock('openNavi', !openNavi)}
              checked={openNavi}
            >
              내비 앱 바로가기 버튼(카카오,티맵,네이버)
            </Checkbox>
          </div>
        </section>
        {openMap &&
          isScriptLoaded &&
          Number.isFinite(lng) &&
          Number.isFinite(lat) && <PlaceMap lng={lng} lat={lat} />}
      </LeftEditorWrapper>
    </>
  );
}
