import { JSONContent } from '@tiptap/core';
import { useMemo, useEffect, ChangeEvent } from 'react';
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
  const {
    title,
    organizer,
    hasUrl,
    url,
    messageJson,
    image,
    checkedEnglishTitle,
    englishTitle,
  } = blockInfo.props;
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
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

  const handleValueChange = (
    key: 'title' | 'organizer' | 'url' | 'hasUrl' | 'englishTitle',
    e?: ChangeEvent<HTMLInputElement>,
    value?: string | boolean
  ) => {
    updateBlock(id, { [key]: value ?? e?.target.value });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const handlePictureChange = (file: (string | File)[]) => {
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
    <LeftEditorWrapper className="gap-4 pb-3">
      <NavigationBar className="-mb-2">주최정보 편집 페이지</NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '주최사',
          value: title === '주최사' ? '' : title,
          onChange: e =>
            handleValueChange('title', undefined, e.target.value || '주최사'),
        }}
        className="text-center w-full"
      />
      {checkedEnglishTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'ORGANIZER INFORMATION',
            value:
              englishTitle === 'ORGANIZER INFORMATION' ? '' : englishTitle,
            onChange: e =>
              handleValueChange(
                'englishTitle',
                undefined,
                e.target.value || 'ORGANIZER INFORMATION'
              ),
          }}
          className="text-center w-full"
        />
      )}
      <TextField
        label="주최명"
        inputProps={{
          placeholder: 'ex. 00 Company',
          value: organizer,
          onChange: e => handleValueChange('organizer', e),
        }}
        className="text-center w-full"
      />

      <p className="text-center font-semibold py-1">내용</p>
      <TextEditor
        value={messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />

      <Picture
        label="브랜드 로고"
        className="w-full"
        labelClassName="w-14 text-center"
        multiple={false}
        value={image}
        onChange={handlePictureChange}
        onDelete={handlePictureDelete}
      />
      <section className="flex items-center gap-2 w-full">
        <Label className="font-semibold">추가기능</Label>
        <div className="flex-col">
          <Checkbox
            className="text-[13px]"
            checked={checkedEnglishTitle}
            onChange={handleCheckedChange}
          >
            영문 제목 추가
          </Checkbox>
          <Checkbox
            checked={hasUrl}
            onChange={() => handleValueChange('hasUrl', undefined, !hasUrl)}
          >
            <p className={hasUrl ? 'text-text-primary' : 'text-text-secondary'}>
              로고 클릭 시 주최사 홈페이지 접속 가능
            </p>
          </Checkbox>
        </div>
      </section>
      {hasUrl && (
        <TextField
          label="URL"
          inputProps={{
            placeholder: 'https://example.com',
            value: url,
            onChange: e => handleValueChange('url', e),
            title: 'http, https로 시작하는 URL을 입력해주세요',
          }}
          className="text-center w-full"
        />
      )}
    </LeftEditorWrapper>
  );
};
