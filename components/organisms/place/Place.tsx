'use client';
import { useEffect, useRef, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
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
  getPlaceFieldCopy,
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
  const [addressQuery, setAddressQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const geocodeRequest = useRef(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    return () => {
      geocodeRequest.current += 1;
    };
  }, []);

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
    checkedPlaceTel = false,
    openMap,
    openNavi,
    mapLocked,
    lng,
    lat,
    country,
  } = blockInfo.props;
  const defaultTitle = getDefaultPlaceTitle(blockInfo.type);
  const fieldCopy = getPlaceFieldCopy(blockInfo.type);

  const closeAddressSearch = () => {
    geocodeRequest.current += 1;
    setSubmittedQuery(null);
  };

  const searchAddress = (query: string) => {
    if (!isScriptLoaded || !window.naver) {
      alert('지도를 불러오는 중입니다. 잠시후 다시 시도해주세요.');
      return;
    }
    const request = ++geocodeRequest.current;
    naver.maps.Service.geocode({ query }, (status, response) => {
      if (request !== geocodeRequest.current) return;
      const addr = response?.v2?.addresses[0];
      if (status !== naver.maps.Service.Status.OK || !addr) {
        return alert('주소를 찾을 수 없습니다.');
      }
      const { x, y } = addr;
      if (x === undefined || y === undefined) return;

      updateBlock(id, {
        placeAddress: addr.roadAddress || addr.jibunAddress,
        lng: Number(x),
        lat: Number(y),
      });
      setAddressQuery('');
      closeAddressSearch();
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
                handleUpdateBlock('title', e.target.value),
              value: title ?? '',
            }}
            className="w-full py-1.5 text-center"
          />
        </div>
        {checkedSubTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: 'LOCATION',
              value: subTitle ?? '',
              onChange: e =>
                handleUpdateBlock('subTitle', sanitizeEnglishTitleInput(e.target)),
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
            className="w-[72px]"
            ariaLabel="국내·국외 주소"
            placeholder="국내"
            options={[
              { value: '국내', label: '국내' },
              { value: '국외', label: '국외' },
            ]}
            onSelect={val => handleUpdateBlock('country', val.value)}
            selected={country ? { label: country, value: country } : null}
          />
          <form
            className="flex min-w-0 flex-1 items-center gap-1"
            onSubmit={event => {
              event.preventDefault();
              setSubmittedQuery(addressQuery.trim());
            }}
          >
            <Input
              id="address"
              placeholder="도로명 또는 건물명"
              enterKeyHint="search"
              value={addressQuery}
              onChange={event => setAddressQuery(event.target.value)}
              onKeyDown={event => {
                if (
                  event.key === 'Enter' &&
                  (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
                ) {
                  event.preventDefault();
                }
              }}
              className="min-w-0 text-left"
            />
            <UtilityButton type="submit" className="shrink-0" aria-label="주소 검색">
              검색
            </UtilityButton>
          </form>
          {submittedQuery !== null && (
            <Popup
              onClose={closeAddressSearch}
              popupTitle="주소 검색"
              wrapperClassName="max-w-[480px] h-[640px]"
            >
              <DaumPostcode
                defaultQuery={submittedQuery}
                onComplete={data => {
                  searchAddress(data.address);
                }}
                autoClose={false}
                style={{ height: '560px' }}
              />
            </Popup>
          )}
        </section>
        {placeAddress && (
          <p className="w-full break-words text-xs text-text-secondary">
            선택한 주소 · {placeAddress}
          </p>
        )}
        <TextField
          label={fieldCopy.placeNameLabel}
          inputProps={{
            placeholder: fieldCopy.placeNamePlaceholder,
            onChange: e => handleUpdateBlock('placeName', e.target.value),
            value: placeName,
          }}
          className="w-full py-1.5 text-center"
        />
        <TextField
          label={fieldCopy.placeDetailLabel}
          inputProps={{
            placeholder: fieldCopy.placeDetailPlaceholder,
            onChange: e => handleUpdateBlock('placeDetail', e.target.value),
            value: placeDetail,
          }}
          className="w-full py-1.5 text-center"
        />
        {checkedPlaceTel && (
          <TextField
            label="연락처"
            inputProps={{
              placeholder: fieldCopy.placeTelPlaceholder,
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
        )}
        <section className="flex flex-row gap-2 items-start w-full py-1.5">
          <Label className="font-semibold shrink-0 pt-0.5">추가기능</Label>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-row flex-wrap gap-2 items-center">
              <Checkbox
                onChange={e =>
                  handleUpdateBlock('checkedSubTitle', e.target.checked)
                }
                checked={checkedSubTitle}
              >
                <span className="text-[13px]">영문 제목 추가</span>
              </Checkbox>
              <Checkbox
                onChange={e =>
                  handleUpdateBlock('checkedPlaceTel', e.target.checked)
                }
                checked={checkedPlaceTel}
              >
                <span className="text-[13px]">연락처 추가</span>
              </Checkbox>
              <Checkbox
                direction="right"
                onChange={() => handleUpdateBlock('openMap', !openMap)}
                checked={openMap}
              >
                <span className="text-[13px]">지도</span>
              </Checkbox>
            </div>
            {openMap && (
              <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-gray-200">
                <Checkbox
                  direction="right"
                  onChange={() => handleUpdateBlock('mapLocked', !mapLocked)}
                  checked={Boolean(mapLocked)}
                >
                  <span className="text-[13px]">
                    지도 고정 (지도가 움직이지 않아요.)
                  </span>
                </Checkbox>
                <Checkbox
                  direction="right"
                  onChange={() => handleUpdateBlock('openNavi', !openNavi)}
                  checked={openNavi}
                >
                  <span className="text-[13px]">
                    내비 앱 바로가기 버튼(카카오, 티맵, 네이버)
                  </span>
                </Checkbox>
              </div>
            )}
          </div>
        </section>
        {openMap && (
          <div className="flex w-full flex-col gap-1">
            {isScriptLoaded && Number.isFinite(lng) && Number.isFinite(lat) && (
              <PlaceMap lng={lng} lat={lat} locked={Boolean(mapLocked)} />
            )}
          </div>
        )}
      </LeftEditorWrapper>
    </>
  );
}
