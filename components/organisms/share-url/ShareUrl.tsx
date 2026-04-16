import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { MultiRowInput } from '@/components/atoms/input/MultiRowInput';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { SHARE_NOTICES } from './constants/contant';

interface Props {
  blockInfo: EditorBlock<'shareUrl'>;
  id: string;
}

function ShareUrl({ blockInfo, id }: Props) {
  const [activeTab, setActiveTab] = useState<'url' | 'kakao'>('url');
  const { block, updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );

  // 오시는 길 블록의 예식장명과 주소 설정 여부 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placeBlock = block.find((b: any) => b.component === 'place') as any;
  const hasValidLocation = Boolean(
    placeBlock &&
    placeBlock.props.lat !== undefined &&
    placeBlock.props.lng !== undefined
  );

  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateBlock(id, { [name]: value });
  };

  const handleCheckboxChange = ({
    target: { checked, name },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (name === 'showLocationButton') {
      if (!hasValidLocation) return;
      updateBlock(id, { showLocationButton: checked });
      updateBlock(id, {
        locationInfo: {
          lat: placeBlock.props.lat,
          lng: placeBlock.props.lng,
          placeName: placeBlock.props.placeName,
        },
      });
    } else if (name === 'showShareButton') {
      updateBlock(id, { showShareButton: checked });
    }
  };

  const handlePictureChange = (newFiles: (File | string)[]) => {
    const props = (block as EditorBlock<'shareUrl'>[]).find(
      b => b.id === id
    )?.props;
    const isKakaoTab = activeTab === 'kakao';

    // 각 탭의 이미지 리스트 결정 (현재 탭인 경우 새 파일 합산)
    const kakaoImages = isKakaoTab ? newFiles : (props?.images ?? []);
    const urlImages = !isKakaoTab ? newFiles : (props?.urlImage ?? []);

    // 1. 블록 데이터 업데이트 (현재 탭의 필드만 업데이트)
    updateBlock(
      id,
      isKakaoTab ? { images: kakaoImages } : { urlImage: urlImages }
    );

    // 2. 업로드 큐에는 양쪽 탭의 모든 File 객체를 합산해서 전달
    const allFilesToUpload = [...kakaoImages, ...urlImages].filter(
      f => f instanceof File
    ) as File[];

    updateImage(id, allFilesToUpload);
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
      <div className="w-full flex flex-col gap-1">
        <TextField
          key={`title-${activeTab}`}
          label="제목"
          className="py-1.5"
          inputProps={{
            name: activeTab === 'kakao' ? 'title' : 'urlTitle',
            placeholder: '제목을 입력해 주세요.',
            onChange: handleChange,
            value:
              activeTab === 'kakao'
                ? blockInfo.props.title
                : blockInfo.props.urlTitle,
          }}
        />
        <div className="flex flex-col gap-1.5 py-1.5">
          <Label className="font-semibold text-center">내용</Label>
          <MultiRowInput
            key={`desc-${activeTab}`}
            size="full"
            name={activeTab === 'kakao' ? 'description' : 'urlDescription'}
            placeholder="내용을 입력해 주세요."
            onChange={handleChange}
            value={
              activeTab === 'kakao'
                ? blockInfo.props.description
                : blockInfo.props.urlDescription
            }
          />
        </div>
        <Picture
          key={`pic-${activeTab}`}
          label="사진"
          className="py-1"
          multiple={false}
          value={
            activeTab === 'kakao'
              ? blockInfo.props.images
              : blockInfo.props.urlImage
          }
          onChange={handlePictureChange}
        />
        {activeTab === 'kakao' && (
          <div className="flex gap-2 py-2">
            <Label className="font-semibold shrink-0">추가기능</Label>
            <div className="flex flex-col gap-1">
              <Checkbox
                onChange={handleCheckboxChange}
                checked={hasValidLocation && blockInfo.props.showLocationButton}
                disabled={!hasValidLocation}
                name="showLocationButton"
              >
                <p className="font-normal text-text-secondary text-[13px]">
                  위치보기 버튼 (오시는 길 컴포넌트 연동)
                </p>
              </Checkbox>
              <Checkbox
                onChange={handleCheckboxChange}
                checked={blockInfo.props.showShareButton}
                name="showShareButton"
              >
                <p className="font-normal text-text-secondary text-[13px]">
                  초대장 내 카카오톡 공유하기 버튼 노출
                </p>
              </Checkbox>
            </div>
          </div>
        )}
        {SHARE_NOTICES.map(({ id, text, colorClass }) => (
          <p key={id} className={`text-xs ${colorClass} break-keep`}>
            {text}
          </p>
        ))}
      </div>
    </LeftEditorWrapper>
  );
}

export default ShareUrl;
