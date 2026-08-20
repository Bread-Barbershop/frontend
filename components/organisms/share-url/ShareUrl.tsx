import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { MultiRowInput } from '@/components/atoms/input/MultiRowInput';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
import { DEFAULT_TITLE } from '@/shared/utils/shareUrlDefaults';

import { SHARE_NOTICES } from './constants/share';

const SHARE_URL_IMAGE_ID = 'shareUrl';

function ShareUrl() {
  const {
    block,
    shareUrl,
    shareUrlTab,
    setShareUrlTab,
    updateShareUrl,
    updateImage,
  } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      shareUrl: state.shareUrl,
      shareUrlTab: state.shareUrlTab,
      setShareUrlTab: state.setShareUrlTab,
      updateShareUrl: state.updateShareUrl,
      updateImage: state.updateImage,
    }))
  );
  const { warning } = useToast();
  const [loadingTab, setLoadingTab] = useState<typeof shareUrlTab | null>(
    null
  );

  const placeBlock = block.find(
    (b): b is EditorBlock<'place'> => b.component === 'place'
  );
  const hasValidLocation = Boolean(
    placeBlock &&
    typeof placeBlock.props.lat === 'number' &&
    typeof placeBlock.props.lng === 'number'
  );

  useEffect(() => {
    if (hasValidLocation || !shareUrl.showLocationButton) return;

    updateShareUrl({ showLocationButton: false, locationInfo: undefined });
  }, [hasValidLocation, shareUrl.showLocationButton, updateShareUrl]);

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
    }
  };

  const handlePictureChange = async (newFiles: (File | string)[]) => {
    const isKakaoTab = shareUrlTab === 'kakao';
    setLoadingTab(shareUrlTab);
    try {
      const files = newFiles.filter((f): f is File => f instanceof File);
      const compressedFiles = await compressImages(files);
      const compressedNewFiles = newFiles.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );

      // 각 탭의 이미지 리스트 결정 (현재 탭인 경우 새 파일 합산)
      const kakaoImages = isKakaoTab
        ? compressedNewFiles
        : (shareUrl.images ?? []);
      const urlImages = !isKakaoTab
        ? compressedNewFiles
        : (shareUrl.urlImage ?? []);

      // 1. 공유 URL 전역 상태 업데이트 (현재 탭 필드만 반영)
      updateShareUrl(
        isKakaoTab ? { images: kakaoImages } : { urlImage: urlImages }
      );

      // 2. 업로드 큐에는 양쪽 탭의 모든 File 객체를 합산해서 전달
      const allFilesToUpload = [...kakaoImages, ...urlImages].filter(
        f => f instanceof File
      ) as File[];

      updateImage(SHARE_URL_IMAGE_ID, allFilesToUpload);
    } catch (error) {
      console.error('[ShareUrl] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoadingTab(null);
    }
  };

  return (
    <LeftEditorWrapper ariaLabel="공유 썸네일">
      <NavigationBar>공유 썸네일</NavigationBar>
      <nav className="flex justify-center items-center mb-2 cursor-pointer">
        <div
          onClick={() => setShareUrlTab('url')}
          className={`w-[53px] h-8 flex justify-center items-center text-center ${
            shareUrlTab === 'url'
              ? 'border-b-2 border-black font-semibold'
              : 'text-gray-500 hover:text-black font-normal'
          }`}
        >
          URL
        </div>
        <div
          onClick={() => setShareUrlTab('kakao')}
          className={`w-[53px] h-8 flex justify-center items-center text-center ${
            shareUrlTab === 'kakao'
              ? 'border-b-2 border-black font-semibold'
              : 'text-gray-500 hover:text-black font-normal'
          }`}
        >
          카카오
        </div>
      </nav>
      <div className="w-full flex flex-col gap-1 mb-2">
        <TextField
          key={`title-${shareUrlTab}`}
          label="제목"
          className="py-1.5"
          inputProps={{
            name: shareUrlTab === 'kakao' ? 'title' : 'urlTitle',
            placeholder: DEFAULT_TITLE,
            onChange: handleChange,
            value: shareUrlTab === 'kakao' ? shareUrl.title : shareUrl.urlTitle,
          }}
        />
        <div className="flex flex-col gap-1.5 py-1.5">
          <Label className="font-semibold text-center">내용</Label>
          <MultiRowInput
            key={`desc-${shareUrlTab}`}
            size="full"
            className="text-center pt-12.5"
            name={shareUrlTab === 'kakao' ? 'description' : 'urlDescription'}
            placeholder="내용을 입력해 주세요."
            onChange={handleChange}
            value={
              shareUrlTab === 'kakao'
                ? shareUrl.description
                : shareUrl.urlDescription
            }
          />
        </div>
        <Picture
          key={`pic-${shareUrlTab}`}
          label="사진"
          className="py-1"
          multiple={false}
          value={shareUrlTab === 'kakao' ? shareUrl.images : shareUrl.urlImage}
          onChange={handlePictureChange}
          onDelete={() => handlePictureChange([])}
          loadingCount={loadingTab === shareUrlTab ? 1 : 0}
        />
        {shareUrlTab === 'kakao' && (
          <div className="flex gap-2 py-2">
            <Label className="font-semibold shrink-0">추가기능</Label>
            <div className="flex flex-col gap-1">
              <Checkbox
                onChange={handleCheckboxChange}
                checked={hasValidLocation && shareUrl.showLocationButton}
                disabled={!hasValidLocation}
                name="showLocationButton"
              >
                <span className="text-text-secondary text-[13px]">
                  위치보기 버튼 추가
                </span>
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
