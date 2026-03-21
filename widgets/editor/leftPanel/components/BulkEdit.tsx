import React from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Radio } from '@/components/atoms/radio';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Selector } from '@/components/molecules/selector';
import { TextEditorPreview } from '@/components/molecules/text-editor-preview';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

const TEST_VALUE = [
  { value: '글자색', label: '글자색' },
  { value: '글자크기', label: '글자크기' },
  { value: '글자굵기', label: '글자굵기' },
  { value: '글자 기울임', label: '글자 기울임' },
  { value: '글자 밑줄', label: '글자 밑줄' },
  { value: '글자 정렬', label: '글자 정렬' },
  { value: '글자 정렬', label: '글자 정렬' },
];
const BACKGROUND_VALUE = [
  { value: '글자색', label: '글자색' },
  { value: '글자크기', label: '글자크기' },
  { value: '글자굵기', label: '글자굵기' },
  { value: '글자 기울임', label: '글자 기울임' },
  { value: '글자 밑줄', label: '글자 밑줄' },
  { value: '글자 정렬', label: '글자 정렬' },
  { value: '글자 정렬', label: '글자 정렬' },
];

function BulkEdit() {
  return (
    <div className="w-full bg-white rounded-b-lg shadow-edit border border-t-0 border-black/5 transition-all duration-300 ease-in-out">
      <LeftEditorWrapper className="w-full">
        <div className="w-full">
          <NavigationBar
            action={
              <UtilityButton size="md" variant="primary" onClick={() => {}}>
                적용하기
              </UtilityButton>
            }
            direction="right"
          >
            제목 편집
          </NavigationBar>
          <TextEditorPreview>
            <div className="w-full h-full flex flex-col gap-1 items-center">
              <p className="sub-title">ENG TITLE</p>
              <p className="main-title">제목입니다.</p>
            </div>
          </TextEditorPreview>
        </div>
        <div className="flex gap-2 py-2 w-full">
          <Label className="font-semibold shrink-0">추가기능</Label>
          <Checkbox>영문 타이틀 추가</Checkbox>
        </div>
        <div className="w-full">
          <NavigationBar
            action={
              <UtilityButton size="md" variant="primary" onClick={() => {}}>
                적용하기
              </UtilityButton>
            }
            direction="right"
          >
            본문 편집
          </NavigationBar>
          <TextEditorPreview>
            <div className="w-full h-full flex flex-col gap-1 items-center">
              <p className="font-base text-base">본문입니다.</p>
            </div>
          </TextEditorPreview>
        </div>
        <div className="w-full">
          <NavigationBar>배경 편집</NavigationBar>
          <div className="flex gap-2">
            <div className="flex">
              <Radio />
              <Selector
                options={TEST_VALUE}
                selected={TEST_VALUE[0]}
                onSelect={() => {}}
              />
            </div>
            <div className="flex">
              <Radio />
              <Selector
                options={BACKGROUND_VALUE}
                selected={BACKGROUND_VALUE[0]}
                onSelect={() => {}}
              />
            </div>
          </div>
        </div>
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
