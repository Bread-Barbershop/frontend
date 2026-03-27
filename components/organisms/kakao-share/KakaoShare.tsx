import { ChangeEvent } from 'react';
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

interface Props {
  blockInfo: EditorBlock<'kakaoShare'>;
  id: string;
}

function KakaoShare({ blockInfo, id }: Props) {
  const { block, updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placeBlock = block.find((b: any) => b.component === 'place') as any;
  const hasValidLocation = Boolean(
    placeBlock &&
      placeBlock.props.lat !== undefined &&
      placeBlock.props.lng !== undefined &&
      placeBlock.props.placeName
  );

  const handleTitleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: value });
  };

  const handleDescriptionChange = ({
    target: { value },
  }: ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(id, { description: value });
  };

  const handlePictureChange = (file: (File | string)[]) => {
    const currentBlock = block as EditorBlock<'kakaoShare'>[];
    const existingImages = currentBlock.find(b => b.id === id)?.props.images;
    updateBlock(id, { images: [...(existingImages ?? []), ...file] });
    updateImage(id, [...(existingImages ?? []), ...file]);
  };

  const handleLocationButtonChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!hasValidLocation) return;
    updateBlock(id, { showLocationButton: e.target.checked });
  };

  const handleShareButtonChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { showShareButton: e.target.checked });
  };

  return (
    <LeftEditorWrapper ariaLabel="카카오 초대장 썸네일">
      <NavigationBar>카카오 초대장 썸네일</NavigationBar>
      <div className="w-full flex flex-col gap-1">
        <Picture
          label="사진"
          className="py-1"
          multiple={false}
          value={blockInfo.props.images}
          onChange={handlePictureChange}
        />
        <TextField
          label="제목"
          className="py-1.5"
          inputProps={{
            placeholder: '제목을 입력해 주세요.',
            onChange: handleTitleChange,
            value: blockInfo.props.title,
          }}
        />
        <div className="flex flex-col gap-1.5 py-1.5">
          <Label className="font-semibold text-center">내용</Label>
          <MultiRowInput
            size="full"
            placeholder="내용을 입력해 주세요."
            onChange={handleDescriptionChange}
            value={blockInfo.props.description}
          />
        </div>
        <div className="flex gap-2 py-2">
          <Label className="font-semibold shrink-0">추가기능</Label>
          <div className="flex flex-col gap-1">
            <Checkbox
              onChange={handleLocationButtonChange}
              checked={hasValidLocation && blockInfo.props.showLocationButton}
              disabled={!hasValidLocation}
            >
              <p className="font-normal text-text-secondary text-[13px]">
                위치보기 버튼 (오시는 길 컴포넌트 연동)
              </p>
            </Checkbox>
            {!hasValidLocation && (
              <p className="text-xs text-red-500 mt-1 ml-6 break-keep">
                * 오시는 길 블록의 예식장명과 주소가 모두 설정되어야 켤 수 있습니다.
              </p>
            )}
            <Checkbox
              onChange={handleShareButtonChange}
              checked={blockInfo.props.showShareButton}
            >
              <p className="font-normal text-text-secondary text-[13px]">
                청첩장 내 카카오톡 공유하기 버튼 노출
              </p>
            </Checkbox>
          </div>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}

export default KakaoShare;
