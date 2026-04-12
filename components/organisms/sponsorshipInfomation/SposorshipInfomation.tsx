import React, { ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

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
  const handlePictureDelete = (files: (File | string)[]) => {
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
    updateBlock(id, { title: e.target.value });
  };
  return (
    <LeftEditorWrapper ariaLabel="후원 정보">
      <NavigationBar>후원 정보</NavigationBar>
      <div className="w-full">
        <TextField
          label="제목"
          className="py-1.5 text-center"
          inputProps={{
            placeholder: 'ex. Our Sponsors',
            onChange: handleOnChangeTitle,
          }}
        />
      </div>
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
    </LeftEditorWrapper>
  );
}

export default SponsorshipInfomation;
