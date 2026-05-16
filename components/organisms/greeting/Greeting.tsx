import { ChangeEvent, useEffect, useMemo } from 'react';

import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'greeting'>;
  id: string;
}

const DEFAULT_GREETING_TITLE = '인사말';
const DEFAULT_GREETING_ENGLISH_TITLE = 'INVITATION';

function Greeting({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const {
    title,
    checkedEnglishTitle = true,
    englishTitle = DEFAULT_GREETING_ENGLISH_TITLE,
    messageJson,
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
    if (title === '') {
      updateBlock(id, { title: DEFAULT_GREETING_TITLE });
    }
  }, [id, title, updateBlock]);

  useEffect(() => {
    if (englishTitle === '') {
      updateBlock(id, { englishTitle: DEFAULT_GREETING_ENGLISH_TITLE });
    }
  }, [englishTitle, id, updateBlock]);

  useEffect(() => {
    return () => {
      debouncedUpdateMessage.cancel();
    };
  }, [debouncedUpdateMessage]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    updateBlock(id, { title: nextTitle || DEFAULT_GREETING_TITLE });
  };

  const handleEnglishTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextEnglishTitle = e.target.value;
    updateBlock(id, {
      englishTitle: nextEnglishTitle || DEFAULT_GREETING_ENGLISH_TITLE,
    });
  };

  const handleEnglishTitleCheckedChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, { checkedEnglishTitle: e.target.checked });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  return (
    <LeftEditorWrapper ariaLabel="인사말" className="gap-4">
      <NavigationBar>인사말 편집 페이지</NavigationBar>
      <TextField
        key={`title-${id}`}
        label="제목"
        inputProps={{
          placeholder: DEFAULT_GREETING_TITLE,
          defaultValue: title === DEFAULT_GREETING_TITLE ? '' : title,
          onChange: handleTitleChange,
        }}
        className="text-center w-full"
      />
      {checkedEnglishTitle && (
        <TextField
          key={`english-title-${id}`}
          label="영문제목"
          inputProps={{
            placeholder: DEFAULT_GREETING_ENGLISH_TITLE,
            defaultValue:
              englishTitle === DEFAULT_GREETING_ENGLISH_TITLE
                ? ''
                : englishTitle,
            onChange: handleEnglishTitleChange,
          }}
          className="text-center w-full"
        />
      )}

      <NavigationBar>내용</NavigationBar>

      <div className="w-full flex flex-col gap-2">
        <TextEditor
          key={id}
          value={messageJson}
          defaultText="내용을 입력해 주세요"
          defaultAlign="center"
          onChange={handleEditorChange}
        />

        <section className="flex flex-row gap-2 items-center w-full">
          <Label className="font-semibold">추가기능</Label>
          <Checkbox
            checked={checkedEnglishTitle}
            onChange={handleEnglishTitleCheckedChange}
          >
            영문 제목 추가
          </Checkbox>
        </section>
      </div>
    </LeftEditorWrapper>
  );
}

export default Greeting;
