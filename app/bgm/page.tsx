'use client';

import Image from 'next/image';

import { Label } from '@/components/atoms/label';
import { Radio } from '@/components/atoms/radio/Radio';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';

import { BGM_LIST } from './bgmList';
import { useBgmPlayer } from './useBgmPlayer';

export default function Page() {
  const { isLoop, isPlaying, selectedBgm, selectBgm, setIsLoop, togglePlay } =
    useBgmPlayer(BGM_LIST, { volume: 0.2 });

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
                <Radio
                  name="bgm"
                  value={bgm.id}
                  onChange={() => selectBgm(bgm.id)}
                />
              </div>

              <p className="truncate">{bgm.title}</p>
              <p>{bgm.duration}</p>

              {/* 선택된 항목에만 버튼 표시 */}
              {selectedBgm === bgm.id && (
                <button type="button" onClick={togglePlay}>
                  {isPlaying ? (
                    <Image
                      src="/assets/icons/pause.svg"
                      alt="정지"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <Image
                      src="/assets/icons/play.svg"
                      alt="재생"
                      width={32}
                      height={32}
                    />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <hr className="border-t border-gray-200" />

        {/* 추가기능 */}
        <div className="flex gap-2">
          <Label className="font-semibold text-[14px]">
            추가기능
          </Label>
          <Checkbox
            className="gap-1 pl-1"
            checked={isLoop}
            onChange={e => setIsLoop(e.target.checked)}
          >
            반복재생
          </Checkbox>
        </div>
      </div>
    </main>
  );
}
