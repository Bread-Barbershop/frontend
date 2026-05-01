import { useMemo, useEffect, ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { Divider } from '@/components/atoms/divider/Divider';
import { Input } from '@/components/atoms/input/Input';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'myChild'>;
  id: string;
}

export const MyChild = ({ blockInfo, id }: Props) => {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const {
    checkedEnglishTitle,
    englishTitle,
    name,
    nickname,
    birthday,
    messageJson,
    image,
  } = blockInfo.props;
  const debouncedUpdateMessage = useMemo(
    () =>
      debounce((messageJson: JSONContent) => {
        updateBlock(id, {
          messageJson,
          messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
        });
      }, 300),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateMessage.cancel();
    };
  }, [debouncedUpdateMessage]);

  const handleStringChange = (
    type: 'title' | 'englishTitle' | 'name' | 'nickname',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, { [type]: e.target.value });
  };

  const handleBirthdayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 8);
    let formattedValue = '';

    if (numericValue.length <= 4) {
      formattedValue = numericValue;
    } else if (numericValue.length <= 6) {
      formattedValue = `${numericValue.slice(0, 4)}.${numericValue.slice(4)}`;
    } else {
      formattedValue = `${numericValue.slice(0, 4)}.${numericValue.slice(4, 6)}.${numericValue.slice(6)}`;
    }

    updateBlock(id, { birthday: formattedValue });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const handlePictureChange = (file: (File | string)[]) => {
    updateBlock(id, { image: file });
    updateImage(id, file);
  };
  const handlePictureDelete = () => {
    updateBlock(id, { image: [] });
    updateImage(id, []);
  };

  const handleCheckedChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { checkedEnglishTitle: e.target.checked });
  };

  return (
    <LeftEditorWrapper ariaLabel="아기 소개">
      <NavigationBar>아기 소개</NavigationBar>
      <section className="w-full flex flex-col gap-3 items-start">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
            value: blockInfo.props.title,
            onChange: e => handleStringChange('title', e),
          }}
          className="text-center w-full"
        />
        {checkedEnglishTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
              value: englishTitle,
              onChange: e => handleStringChange('englishTitle', e),
            }}
            className="text-center w-full"
          />
        )}
        <Divider className="w-full" />
        <TextField
          label="이름"
          inputProps={{
            placeholder: '아기 이름',
            value: name,
            onChange: e => handleStringChange('name', e),
          }}
          className="text-center w-full"
        />
        <TextField
          label="애칭"
          inputProps={{
            placeholder: 'ex. 콩이',
            value: nickname,
            onChange: e => handleStringChange('nickname', e),
          }}
          className="text-center w-full"
        />
        <div className="w-full flex items-center gap-1">
          <Label
            htmlFor="birthday"
            className="font-semibold shrink-0 text-center"
          >
            태어난 날
          </Label>
          <Input
            id="birthday"
            placeholder="ex. 2024.12.12"
            value={birthday}
            onChange={handleBirthdayChange}
          />
        </div>
      </section>

      <NavigationBar>내용</NavigationBar>

      <TextEditor
        value={messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />

      <div className="mt-2 w-full">
        <Picture
          label="사진"
          className="w-full text-center"
          multiple={false}
          value={image}
          onChange={handlePictureChange}
          onDelete={handlePictureDelete}
        />
      </div>

      <section className="flex w-full -mx-2 gap-1 py-1.5">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          className="text-[13px]"
          checked={checkedEnglishTitle}
          onChange={handleCheckedChange}
        >
          영문 제목 추가
        </Checkbox>
      </section>
    </LeftEditorWrapper>
  );
};
