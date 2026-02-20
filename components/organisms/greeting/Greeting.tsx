import { Plus } from 'lucide-react';
import { ChangeEvent } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { ImageUploadButton } from '@/components/atoms/image';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorBar } from '@/components/molecules/text-editor-bar';
import { TextField } from '@/components/molecules/text-field';
import {
  EditorBlock,
  useEditorStore,
} from '@/widgets/editor/store/useEditorStore';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'greeting'>;
  id: string;
}

function Greeting({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);

  // (타이틀)실시간 변경사항 Editor 스토어에 적재.
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  // (내용)실시간 변경사항 Editor 스토어에 적재.
  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, { messageJson: json } as any);
  };

  // (추가기능 1)실시간 변경사항 Editor 스토어에 적재.
  const handleFamilyNamesChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { familyNames: e.target.checked });
  };

  // (추가기능 1)실시간 변경사항 Editor 스토어에 적재.
  const handleCustomFamilyNamesChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { customFamilyNames: e.target.checked });
  };

  // (사진)실시간 변경사항 Editor 스토어에 적재.
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    updateBlock(id, { image: files });
    e.target.value = '';
  };

  return (
    <section aria-label="인사말">
      <div className="flex flex-col gap-1 w-93.75 rounded-lg px-5 pb-2.5">
        {/* 컴포넌트 제목 */}
        <NavigationBar>인사말</NavigationBar>

        {/* 제목 입력 필드 */}
        <TextField
          label="제목"
          inputProps={{
            placeholder: '제목을 입력해 주세요.',
            value: blockInfo.props.title,
            onChange: handleTitleChange,
          }}
          className="text-center"
        />

        {/* 소제목 - 내용 */}
        <NavigationBar
          action={
            <UtilityButton size="md" variant="primary">
              <Plus size={16} />
              샘플문구
            </UtilityButton>
          }
          direction="right"
        >
          내용
        </NavigationBar>

        {/* 텍스트 에디터 */}
        <TextEditorBar
          initialContent="내용을 입력해 주세요."
          onChange={handleEditorChange}
        />

        {/* 추가기능 */}
        <div className="flex gap-2 items-center">
          <Label className="text-center">추가기능</Label>
          <div className="flex flex-col">
            <Checkbox
              checked={!!blockInfo.props.familyNames}
              onChange={handleFamilyNamesChange}
            >
              인사말 하단 신랑&신부&혼주 성함 표시
            </Checkbox>
            <Checkbox
              checked={!!blockInfo.props.customFamilyNames}
              onChange={handleCustomFamilyNamesChange}
            >
              성함 자유 입력
            </Checkbox>
          </div>
        </div>

        {/* 사진 */}
        <div className="flex gap-2 items-center">
          <Label className="text-center">사진</Label>
          <ImageUploadButton onChange={handleImageChange} />
        </div>
      </div>
    </section>
  );
}
export default Greeting;
