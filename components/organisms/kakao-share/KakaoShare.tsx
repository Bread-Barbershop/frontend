import { ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

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

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(id, { description: e.target.value });
  };

  const handlePictureChange = (file: (File | string)[]) => {
    const currentBlock = block as EditorBlock<'kakaoShare'>[];
    const existingImages = currentBlock.find(b => b.id === id)?.props.images;
    updateBlock(id, { images: [...(existingImages ?? []), ...file] });
    updateImage(id, [...(existingImages ?? []), ...file]);
  };

  const handleLocationButtonChange = (e: ChangeEvent<HTMLInputElement>) => {
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
          label="썸네일 이미지"
          className="py-1"
          multiple={false}
          value={blockInfo.props.images}
          onChange={file => handlePictureChange(file)}
        />
        <ul className="list-disc pl-5 marker:text-text-secondary py-1">
          <li className="text-text-secondary font-semibold text-[13px]">
            1.91:1 비율 이미지를 권장합니다.
          </li>
        </ul>
        <TextField
          label="제목"
          className="py-1.5"
          inputProps={{
            placeholder: '카카오톡에 표시될 제목을 입력해주세요.',
            onChange: e => handleTitleChange(e),
            value: blockInfo.props.title,
          }}
        />
        <div className="flex flex-col gap-1.5 py-1.5">
          <Label className="font-semibold">본문</Label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="카카오톡에 표시될 본문을 입력해주세요."
            rows={3}
            onChange={e => handleDescriptionChange(e)}
            value={blockInfo.props.description}
          />
        </div>
        <div className="flex gap-2 py-2">
          <Label className="font-semibold shrink-0">추가기능</Label>
          <div className="flex flex-col gap-1">
            <Checkbox
              onChange={handleLocationButtonChange}
              checked={blockInfo.props.showLocationButton}
            >
              <p className="font-normal text-text-secondary text-[13px]">
                위치보기 버튼 (오시는 길 컴포넌트 연동)
              </p>
            </Checkbox>
            <Checkbox
              onChange={handleShareButtonChange}
              checked={blockInfo.props.showShareButton}
            >
              <p className="font-normal text-text-secondary text-[13px]">
                카카오톡 공유하기 버튼 노출
              </p>
            </Checkbox>
          </div>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}

export default KakaoShare;
