import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { MultiRowInput } from '@/components/atoms/input/MultiRowInput';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { SHARE_NOTICES } from './constants/share';

const SHARE_URL_IMAGE_ID = 'shareUrl';

function ShareUrl() {
  const [activeTab, setActiveTab] = useState<'url' | 'kakao'>('url');
  const { block, shareUrl, updateShareUrl, updateImage } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      shareUrl: state.shareUrl,
      updateShareUrl: state.updateShareUrl,
      updateImage: state.updateImage,
    }))
  );

  // 행사 장소 블록의 장소명과 주소 설정 여부 확인
  const placeBlock = block.find(
    (b): b is EditorBlock<'place'> => b.component === 'place'
  );
  const hasValidLocation = Boolean(
    placeBlock &&
    typeof placeBlock.props.lat === 'number' &&
    typeof placeBlock.props.lng === 'number'
  );

  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateShareUrl({ [name]: value } as Partial<typeof shareUrl>);
  };

  const handleCheckboxChange = ({
    target: { checked, name },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (name === 'showLocationButton') {
      if (!hasValidLocation || !placeBlock) return;
      updateShareUrl({ showLocationButton: checked });
      updateShareUrl({
        locationInfo: {
          lat: placeBlock.props.lat,
          lng: placeBlock.props.lng,
          placeName: placeBlock.props.placeName,
        },
      });
    } else if (name === 'showShareButton') {
      updateShareUrl({ showShareButton: checked });
    }
  };

  const handlePictureChange = (newFiles: (File | string)[]) => {
    const isKakaoTab = activeTab === 'kakao';

    // 각 탭의 이미지 리스트 결정 (현재 탭인 경우 새 파일 합산)
    const kakaoImages = isKakaoTab ? newFiles : (shareUrl.images ?? []);
    const urlImages = !isKakaoTab ? newFiles : (shareUrl.urlImage ?? []);

    // 1. 공유 URL 전역 상태 업데이트 (현재 탭 필드만 반영)
    updateShareUrl(
      isKakaoTab ? { images: kakaoImages } : { urlImage: urlImages }
    );

    // 2. 업로드 큐에는 양쪽 탭의 모든 File 객체를 합산해서 전달
    const allFilesToUpload = [...kakaoImages, ...urlImages].filter(
      f => f instanceof File
    ) as File[];

    updateImage(SHARE_URL_IMAGE_ID, allFilesToUpload);
  };

  return (
    <LeftEditorWrapper ariaLabel="공유 썸네일">
      <NavigationBar>공유 썸네일</NavigationBar>
      <nav className="flex justify-center items-center mb-2 cursor-pointer">
        <div
          onClick={() => setActiveTab('url')}
          className={`w-[53px] h-8 flex justify-center items-center text-center ${
            activeTab === 'url'
              ? 'border-b-2 border-black font-semibold'
              : 'text-gray-500 hover:text-black font-normal'
          }`}
        >
          URL
        </div>
        <div
          onClick={() => setActiveTab('kakao')}
          className={`w-[53px] h-8 flex justify-center items-center text-center ${
            activeTab === 'kakao'
              ? 'border-b-2 border-black font-semibold'
              : 'text-gray-500 hover:text-black font-normal'
          }`}
        >
          카카오
        </div>
      </nav>
      <div className="w-full flex flex-col gap-1 mb-2">
        <TextField
          key={`title-${activeTab}`}
          label="제목"
          className="py-1.5"
          inputProps={{
            name: activeTab === 'kakao' ? 'title' : 'urlTitle',
            placeholder: '소중한 분들을 초대합니다.',
            onChange: handleChange,
            value: activeTab === 'kakao' ? shareUrl.title : shareUrl.urlTitle,
          }}
        />
        <div className="flex flex-col gap-1.5 py-1.5">
          <Label className="font-semibold text-center">내용</Label>
          <MultiRowInput
            key={`desc-${activeTab}`}
            size="full"
            name={activeTab === 'kakao' ? 'description' : 'urlDescription'}
            placeholder="뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요."
            onChange={handleChange}
            value={
              activeTab === 'kakao'
                ? shareUrl.description
                : shareUrl.urlDescription
            }
          />
        </div>
        <Picture
          key={`pic-${activeTab}`}
          label="사진"
          className="py-1"
          multiple={false}
          value={activeTab === 'kakao' ? shareUrl.images : shareUrl.urlImage}
          onChange={handlePictureChange}
        />
        {activeTab === 'kakao' && (
          <div className="flex gap-2 py-2">
            <Label className="font-semibold shrink-0">추가기능</Label>
            <div className="flex flex-col gap-1">
              <Checkbox
                onChange={handleCheckboxChange}
                checked={hasValidLocation && shareUrl.showLocationButton}
                disabled={!hasValidLocation}
                name="showLocationButton"
              >
                <p className="font-normal text-text-secondary text-[13px]">
                  위치보기 버튼 (행사 장소 컴포넌트 연동)
                </p>
              </Checkbox>
              <Checkbox
                onChange={handleCheckboxChange}
                checked={shareUrl.showShareButton}
                name="showShareButton"
              >
                <p className="font-normal text-text-secondary text-[13px]">
                  초대장 내 카카오톡 공유하기 버튼 노출
                </p>
              </Checkbox>
            </div>
          </div>
        )}
        <EditorNoticeList notices={SHARE_NOTICES} />
      </div>
    </LeftEditorWrapper>
  );
}

export default ShareUrl;
