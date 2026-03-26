'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import PosterPanel from './components/PosterPanel';
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
  const [tab, setTab] = useState(typeArray?.length === 0 ? 'poster' : 'type');

  return (
    <div className="w-93.75 h-203 mr-15 flex flex-col gap-5">
      <div className="w-93.75 min-h-0 flex-1 bg-white rounded-lg shadow-edit flex-center flex-col gap-3 px-5 ">
        <div className="w-full">
          <button
            type="button"
            className={` w-41.5 h-11 font-semibold ${tab === 'poster' ? 'border-b text-text-primary' : 'text-text-tertiary'}`}
            onPointerDown={() => setTab('poster')}
          >
            포스터
          </button>
          <button
            type="button"
            className={`w-41.75 h-11 font-semibold ${typeArray ? 'pointer-events-auto' : 'pointer-events-none'} ${tab === 'type' ? 'border-b text-text-primary' : 'text-text-tertiary'}`}
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
