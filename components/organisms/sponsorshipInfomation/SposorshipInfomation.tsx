import React, { ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

interface Props {
  blockInfo: EditorBlock<'sponsorshipInfomation'>;
  id: string;
}

function SponsorshipInfomation({ blockInfo, id }: Props) {
  const { block, updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const handlePictureDelete = (files?: (File | string)[]) => {
    if (!files) {
      updateBlock(id, { images: [] });
      updateImage(id, []);
      return;
    }
    updateBlock(id, { images: files });
    updateImage(id, files);
  };
  const handlePictureChange = (file: (File | string)[]) => {
    const currentBlock = block as EditorBlock<'sponsorshipInfomation'>[];
    const image = currentBlock.find(b => b.id === id)?.props.images;
    updateBlock(id, { images: [...(image ?? []), ...file] });
    updateImage(id, [...(image ?? []), ...file]);
  };

  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value || '후원사' });
  };
  const handleOnChangeIsSubTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isSubTitle: e.target.checked });
  };

  const handleOnchangeEnglishTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      subTitle: sanitizeEnglishTitleInput(e.target) || 'OUR SPONSORS',
    });
  };
  return (
    <LeftEditorWrapper ariaLabel="후원 정보">
      <NavigationBar>후원 정보 편집 페이지</NavigationBar>
      <div className="w-full">
        <TextField
          label="제목"
          className="py-1.5 text-center"
          inputProps={{
            placeholder: '후원사',
            value:
              blockInfo.props.title === '후원사' ? '' : blockInfo.props.title,
            onChange: handleOnChangeTitle,
          }}
        />
      </div>
      {blockInfo.props.isSubTitle && (
        <div className="w-full">
          <TextField
            label="영문 제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: 'OUR SPONSORS',
              value:
                blockInfo.props.subTitle === 'OUR SPONSORS'
                  ? ''
                  : blockInfo.props.subTitle,
              onChange: handleOnchangeEnglishTitle,
            }}
          />
        </div>
      )}
      <div className="w-full">
        <Picture
          label="후원사 로고"
          labelClassName="break-words w-[49px] text-center"
          className="py-1"
          multiple={true}
          value={blockInfo.props.images}
          onReorder={file => {
            updateBlock(id, { images: file });
            updateImage(id, file);
          }}
          onChange={handlePictureChange}
          onDelete={handlePictureDelete}
        />
      </div>
      <div className="w-full pb-2 flex gap-2 items-center">
        <Label className="font-semibold shrink-0 text-center">추가기능</Label>

        <Checkbox
          onChange={handleOnChangeIsSubTitle}
          checked={blockInfo.props.isSubTitle}
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </div>
    </LeftEditorWrapper>
  );
}

export default SponsorshipInfomation;
