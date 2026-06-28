'use client';
import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { useShallow } from 'zustand/shallow';

import { Divider } from '@/components/atoms/divider';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Selector } from '@/components/molecules/selector';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import {
  formatPhoneNumber,
  normalizePhoneNumber,
} from '@/shared/utils/phoneNumber';
import {
  getDefaultPlaceTitle,
  isDefaultPlaceTitle,
} from '@/shared/utils/placeTitle';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

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
    subTitle,
    placeName,
    placeDetail,
    placeAddress,
    placeTel,
    checkedSubTitle,
    openMap,
    openNavi,
    mapLocked,
    lng,
    lat,
    country,
  } = blockInfo.props;
  const defaultTitle = getDefaultPlaceTitle(blockInfo.type);

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
      <LeftEditorWrapper ariaLabel={defaultTitle}>
        <div className="flex flex-col gap-1 w-full">
          <NavigationBar>{defaultTitle} 편집 페이지</NavigationBar>
          <TextField
            label="제목"
            inputProps={{
              placeholder: defaultTitle,
              onChange: e =>
                handleUpdateBlock('title', e.target.value || defaultTitle),
              value: isDefaultPlaceTitle(title, blockInfo.type) ? '' : title,
            }}
            className="w-full py-1.5 text-center"
          />
        </div>
        {checkedSubTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: 'LOCATION',
              value: subTitle === 'LOCATION' ? '' : subTitle,
              onChange: e =>
                handleUpdateBlock(
                  'subTitle',
                  sanitizeEnglishTitleInput(e.target) || 'LOCATION'
                ),
            }}
            className="w-full py-1.5 text-center"
          />
        )}
        <Divider className="w-full" />
        <section className="flex flex-row gap-2 w-full py-1.5">
          <Label
            htmlFor="address"
            className="font-semibold shrink-0 text-center"
          >
            주소
          </Label>
          <Selector
            type="normal"
            className="w-[63px]"
            optionContainerClassName="scrollbar-hide"
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
          className="w-full py-1.5 text-center"
        />
        <TextField
          label="층과 홀"
          inputProps={{
            placeholder: '층과 웨딩홀 이름 입력',
            onChange: e => handleUpdateBlock('placeDetail', e.target.value),
            value: placeDetail,
          }}
          className="w-full py-1.5 text-center"
        />
        <TextField
          label="연락처"
          inputProps={{
            placeholder: '예식장 연락처, ex.02-000-000',
            type: 'tel',
            inputMode: 'numeric',
            onChange: e =>
              handleUpdateBlock(
                'placeTel',
                normalizePhoneNumber(e.target.value)
              ),
            value: formatPhoneNumber(placeTel),
          }}
          className="w-full py-1.5 text-center"
        />
        <section className="flex flex-row gap-2 items-center w-full py-1.5">
          <Label className="font-semibold">추가기능</Label>
          <div>
            <div className="flex flex-row gap-2 items-center">
              <Checkbox
                onChange={e =>
                  handleUpdateBlock('checkedSubTitle', e.target.checked)
                }
                checked={checkedSubTitle}
              >
                <span className="text-[13px]">영문 제목 추가</span>
              </Checkbox>
              <Checkbox
                direction="right"
                onChange={() => handleUpdateBlock('openMap', !openMap)}
                checked={openMap}
              >
                <span className="text-[13px]">지도</span>
              </Checkbox>
            </div>
          </div>
        </section>
        {openMap && (
          <div className="flex w-full flex-col gap-1">
            {isScriptLoaded && Number.isFinite(lng) && Number.isFinite(lat) && (
              <PlaceMap lng={lng} lat={lat} locked={Boolean(mapLocked)} />
            )}
            <section className="flex flex-row gap-2 items-center w-full py-1.5">
              <Label className="font-semibold">추가기능</Label>
              <div>
                <Checkbox
                  direction="right"
                  onChange={() => handleUpdateBlock('openNavi', !openNavi)}
                  checked={openNavi}
                >
                  <span className="text-[13px]">
                    내비 앱 바로가기 버튼(카카오, 티맵, 네이버)
                  </span>
                </Checkbox>
                <Checkbox
                  direction="right"
                  onChange={() => handleUpdateBlock('mapLocked', !mapLocked)}
                  checked={Boolean(mapLocked)}
                >
                  <span className="text-[13px]">
                    위치 고정(지도가 움직이지 않아요.)
                  </span>
                </Checkbox>
              </div>
            </section>
          </div>
        )}
      </LeftEditorWrapper>
    </>
  );
}
