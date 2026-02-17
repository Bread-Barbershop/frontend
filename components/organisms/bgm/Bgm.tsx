'use client';

import { useMemo, type ChangeEvent } from 'react';

import { Label } from '@/components/atoms/label';
import { Radio } from '@/components/atoms/radio/Radio';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';

import { PlayToggleButton } from './components/PlayToggleButton';
import { BGM_LIST } from './data/bgmList';
import { useBgmPlayer } from './hooks/useBgmPlayer';
import { USER_BGM_ID, useUserBgmUpload } from './hooks/useUserBgmUpload';
import { useBgmStore } from './store/useBgmStore';

export default function Bgm() {
  const { selectedBgmId } = useBgmStore();
  const { fileInputRef, openFilePicker, uploadUserBgm, userBgm } =
    useUserBgmUpload();

  // 선택된 id로부터 재생할 src를 직접 resolve — bgmList를 훅에 넘기지 않음
  const currentSrc = useMemo(() => {
    if (!selectedBgmId) return null;
    if (selectedBgmId === USER_BGM_ID) return userBgm?.src ?? null;
    return BGM_LIST.find(b => b.id === selectedBgmId)?.src ?? null;
  }, [selectedBgmId, userBgm?.src]);

  const { isLoop, isPlaying, selectedBgm, selectBgm, setIsLoop, togglePlay } =
    useBgmPlayer(currentSrc);

  const isUserBgmSelected = selectedBgm === USER_BGM_ID;

  const handlePresetBgmChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectBgm(e.target.value);
  };

  // 사용자 음원이 있으면 해당 트랙만 선택하고, 없으면 파일 선택창을 연다.
  const handleUserBgmRadioChange = () => {
    if (userBgm) {
      selectBgm(USER_BGM_ID);
      return;
    }

    openFilePicker();
  };

  // 파일 업로드가 성공하면 사용자 음원 라디오를 선택해 바로 재생 흐름으로 연결한다.
  const handleUserBgmUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploaded = await uploadUserBgm(e);

    if (uploaded) {
      selectBgm(USER_BGM_ID);
    }
  };

  return (
    <section aria-label="배경 음악">
      <div className="flex flex-col gap-1 w-93.75 rounded-lg px-5">
        <NavigationBar>배경 음악</NavigationBar>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,.mp3"
          className="hidden"
          onChange={handleUserBgmUpload}
        />

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
                  checked={selectedBgm === bgm.id}
                  onChange={handlePresetBgmChange}
                />
              </div>

              <p className="truncate font-medium">{bgm.title}</p>
              <p className="font-medium">{bgm.duration}</p>

              {/* 선택된 항목에만 버튼 표시 */}
              {selectedBgm === bgm.id && (
                <PlayToggleButton isPlaying={isPlaying} onToggle={togglePlay} />
              )}
            </div>
          ))}

          <div className="flex items-center gap-2 text-text-secondary has-[input:checked]:text-black px-1">
            <div className="p-1.5">
              <Radio
                name="bgm"
                value={USER_BGM_ID}
                checked={isUserBgmSelected}
                onChange={handleUserBgmRadioChange}
              />
            </div>

            {userBgm ? (
              <p className="truncate font-medium">{userBgm.title}</p>
            ) : (
              <button
                type="button"
                className="truncate text-left appearance-none bg-transparent border-0 p-0 cursor-pointer"
                onClick={openFilePicker}
              >
                음악 추가하기
              </button>
            )}
            {userBgm && (
              <p className="shrink-0 font-medium">{userBgm.duration}</p>
            )}
            {userBgm && (
              <button
                type="button"
                className="shrink-0 text-primary cursor-pointer font-medium"
                onClick={openFilePicker}
              >
                음악 변경
              </button>
            )}

            {isUserBgmSelected && userBgm && (
              <PlayToggleButton isPlaying={isPlaying} onToggle={togglePlay} />
            )}
          </div>
        </div>

        {/* 구분선 */}
        <hr className="border-t border-gray-200" />

        {/* 추가기능 */}
        <div className="flex gap-2">
          <Label className="font-semibold text-[14px]">추가기능</Label>
          <Checkbox
            className="gap-1 pl-1 font-medium"
            checked={isLoop}
            onChange={e => setIsLoop(e.target.checked)}
          >
            반복재생
          </Checkbox>
        </div>
      </div>
    </section>
  );
}