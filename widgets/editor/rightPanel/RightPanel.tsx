'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { PosterPanel } from './components/PosterPanel';
import TypePanel from './components/TypePanel';
import { useComponentType } from './hooks/useComponentType';

function RightPanel() {
  const { block, selectedId } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      selectedId: state.selectedId,
    }))
  );
  const { typeArray } = useComponentType({ block, selectedId });

  const [prevTypeArray, setPrevTypeArray] = useState(typeArray);
  const [tab, setTab] = useState(
    typeArray && typeArray.length > 0 ? 'type' : 'poster'
  );

  if (typeArray !== prevTypeArray) {
    setPrevTypeArray(typeArray);
    setTab(typeArray && typeArray.length > 0 ? 'type' : 'poster');
  }

  return (
    <div
      className={`${selectedId !== 'mainPoster' && (!typeArray || typeArray.length === 0) ? 'invisible' : 'visible'} w-93.75 h-full max-h-[810px] mr-5 min-[1540px]:mr-15 flex flex-col gap-5`}
    >
      <div className="w-93.75 min-h-0 h-full flex-1 bg-white rounded-lg shadow-edit flex-center flex-col gap-2 px-5 ">
        <div className="w-full h-11">
          <button
            type="button"
            className={`w-41.5 h-11 cursor-pointer select-none text-sm ${tab === 'poster' ? 'border-b font-semibold text-text-primary' : 'font-normal text-[#838383]'}`}
            onPointerDown={() => setTab('poster')}
          >
            포스터
          </button>
          <button
            type="button"
            className={`w-41.75 h-11 cursor-pointer select-none text-sm ${typeArray && typeArray.length > 0 ? 'pointer-events-auto' : 'pointer-events-none'} ${tab === 'type' ? 'border-b font-semibold text-text-primary' : 'font-normal text-[#838383]'}`}
            onPointerDown={() => setTab('type')}
          >
            타입
          </button>
        </div>

        {tab === 'type' && typeArray && typeArray.length > 0 && (
          <TypePanel typeArray={typeArray} selectedId={selectedId} />
        )}
        {tab === 'poster' && <PosterPanel />}
      </div>
    </div>
  );
}
export default RightPanel;
