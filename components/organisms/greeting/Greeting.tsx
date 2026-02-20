import { Plus } from 'lucide-react';

import { UtilityButton } from '@/components/atoms/button';
import { ImageUploadButton } from '@/components/atoms/image';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditorBar } from '@/components/molecules/text-editor-bar';
import { TextField } from '@/components/molecules/text-field';

function Greeting() {
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
        <TextEditorBar initialContent="내용을 입력해 주세요." />

        {/* 추가기능 */}
        <div className="flex gap-2 items-center">
          <Label className="text-center">추가기능</Label>
          <div className="flex flex-col">
            <Checkbox>인사말 하단 신랑&신부&혼주 성함 표시</Checkbox>
            <Checkbox>성함 자유 입력</Checkbox>
          </div>
        </div>

        {/* 사진 */}
        <div className="flex gap-2 items-center">
          <Label className="text-center">사진</Label>
          <ImageUploadButton />
        </div>
      </div>
    </section>
  );
}
export default Greeting;
