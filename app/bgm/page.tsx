import { Label } from '@/components/atoms/label';
import { Radio } from '@/components/atoms/radio/Radio';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';

import { BGM_LIST } from './bgmList';

export default function Page() {
  return (
    <main>
      <div className="flex flex-col gap-1 w-93.75 border rounded-lg px-5">
        <NavigationBar>배경 음악</NavigationBar>

        {/* 라디오 박스 */}
        <div className="flex flex-col gap-1">
          {BGM_LIST.map(bgm => (
            <div
              key={bgm.id}
              className="flex items-center gap-2 text-text-secondary has-[input:checked]:text-black px-1"
            >
              <div className="p-1.5">
                <Radio name="bgm-preset" value={bgm.id} />
              </div>

              <p className="truncate">{bgm.title}</p>
              <p>{bgm.duration}</p>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <hr className="border-t border-gray-200" />

        {/* 추가기능 */}
        <div className="flex gap-2 py-2.5">
          <Label className="font-bold text-[14px]">추가기능</Label>
          <Checkbox className="gap-1 pl-1">반복재생</Checkbox>
          <Checkbox className="gap-1">하이라이트만 재생</Checkbox>
        </div>

        {/* 컨트롤러 */}
        <div></div>
      </div>
    </main>
  );
}
