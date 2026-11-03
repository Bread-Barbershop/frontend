'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
  const selectedBlock = block.find(item => item.id === selectedId);
  const hasTypeArray = Boolean(typeArray && typeArray.length > 0);
  const isPosterTabDisabled =
    selectedBlock?.component === 'gallery' ||
    selectedBlock?.component === 'calendar';

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
            disabled={isPosterTabDisabled}
            className={`w-41.5 h-11 select-none text-sm ${isPosterTabDisabled ? 'cursor-not-allowed text-text-disabled' : 'cursor-pointer'} ${tab === 'poster' ? 'border-b font-semibold text-text-primary' : 'font-normal text-[#838383]'} transition-colors`}
            onPointerDown={() => {
              if (isPosterTabDisabled) return;
              setTab('poster');
            }}
          >
            포스터
          </button>
          <button
            type="button"
            disabled={!hasTypeArray}
            className={`w-41.75 h-11 select-none text-sm ${hasTypeArray ? 'cursor-pointer' : 'cursor-not-allowed text-text-disabled'} ${tab === 'type' ? 'border-b font-semibold text-text-primary' : 'font-normal text-[#838383]'} transition-colors`}
            onPointerDown={() => {
              if (!hasTypeArray) return;
              setTab('type');
            }}
          >
            타입
          </button>
        </div>

        <div className="w-full flex-1 min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            {tab === 'type' && typeArray && typeArray.length > 0 && (
              <motion.div
                key="type"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full h-full flex flex-col"
              >
                <TypePanel typeArray={typeArray} selectedId={selectedId} />
              </motion.div>
            )}
            {tab === 'poster' && (
              <motion.div
                key="poster"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full h-full flex flex-col"
              >
                <PosterPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default RightPanel;
