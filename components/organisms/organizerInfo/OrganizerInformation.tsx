import { JSONContent } from '@tiptap/core';
import { useMemo, useEffect, ChangeEvent, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor/TextEditor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

interface Props {
  blockInfo: EditorBlock<'organizerInformation'>;
  id: string;
}
export const OrganizerInformation = ({ blockInfo, id }: Props) => {
  const [addLink, setAddLink] = useState(false);
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const { title, organizer, url, messageJson, image } = blockInfo.props;
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

  const handleAddLink = () => {
    setAddLink(prev => {
      const next = !prev;
      if (!next) {
        updateBlock(id, { url: '' });
      }
      return next;
    });
  };

  const handleStringChange = (
    key: 'title' | 'organizer' | 'url',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, { [key]: e.target.value });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const handlePictureChange = (file: (string | File)[]) => {
    updateBlock(id, { image: file });
    updateImage(id, file);
  };

  return (
    <LeftEditorWrapper className="gap-3">
      <NavigationBar>주최정보</NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해주세요',
          value: title,
          onChange: e => handleStringChange('title', e),
        }}
        className="text-center w-full"
      />
      <TextField
        label="주최명"
        inputProps={{
          placeholder: '00 Company',
          value: organizer,
          onChange: e => handleStringChange('organizer', e),
        }}
        className="text-center w-full"
      />

      <p className="text-center font-semibold py-2">내용</p>
      <TextEditor
        value={messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />

      <Picture
        label="브랜드 로고"
        className="w-full"
        multiple={false}
        value={image}
        onChange={handlePictureChange}
      />
      <section className="flex items-center gap-2 w-full">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox checked={addLink} onChange={handleAddLink}>
          로고 클릭 시 주최사 홈페이지 접속 가능
        </Checkbox>
      </section>
      {addLink && (
        <TextField
          label="홈페이지"
          inputProps={{
            placeholder: 'https://example.com',
            value: url,
            onChange: e => handleStringChange('url', e),
          }}
          className="text-center w-full"
        />
      )}
    </LeftEditorWrapper>
  );
};
