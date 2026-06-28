import { ChangeEvent, useEffect } from 'react';

import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'greeting'>;
  id: string;
}

const DEFAULT_GREETING_TITLE = '인사말';
const DEFAULT_GREETING_SUB_TITLE = 'INVITATION';

function Greeting({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const {
    title,
    checkedSubTitle = true,
    subTitle = DEFAULT_GREETING_SUB_TITLE,
    messageJson,
  } = blockInfo.props;
  useEffect(() => {
    if (title === '') {
      updateBlock(id, { title: DEFAULT_GREETING_TITLE });
    }
  }, [id, title, updateBlock]);

  useEffect(() => {
    if (subTitle === '') {
      updateBlock(id, { subTitle: DEFAULT_GREETING_SUB_TITLE });
    }
  }, [subTitle, id, updateBlock]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    updateBlock(id, { title: nextTitle || DEFAULT_GREETING_TITLE });
  };

  const handleSubTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextSubTitle = sanitizeEnglishTitleInput(e.target);
    updateBlock(id, {
      subTitle: nextSubTitle || DEFAULT_GREETING_SUB_TITLE,
    });
  };

  const handleEnglishTitleCheckedChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, { checkedSubTitle: e.target.checked });
  };

  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, {
      messageJson: json,
      messageHtml: tiptapJsonToHtmlInBrowser(json),
    });
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
      {checkedSubTitle && (
        <TextField
          key={`english-title-${id}`}
          label="영문제목"
          inputProps={{
            placeholder: DEFAULT_GREETING_SUB_TITLE,
            defaultValue:
              subTitle === DEFAULT_GREETING_SUB_TITLE
                ? ''
                : subTitle,
            onChange: handleSubTitleChange,
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
            checked={checkedSubTitle}
            onChange={handleEnglishTitleCheckedChange}
          >
            <span className="text-[13px]">영문 제목 추가</span>
          </Checkbox>
        </section>
      </div>
    </LeftEditorWrapper>
  );
}

export default Greeting;
