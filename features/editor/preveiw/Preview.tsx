'use client';
import React, { useEffect, useRef, useState } from 'react';

import { useEditorStore } from '../store/useEditorStore';
import { blockRegistry } from '../types/registry';

import CompoenentsPopup from './components/CompoenentsPopup';

function Preview() {
  const [isTab, setIsTab] = useState(false);
  const [isWeddingTab, setIsWeddingTab] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const block = useEditorStore(state => state.block);

  const handleNewPage = () => {
    setIsTab(props => !props);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setIsTab(false);
        setIsWeddingTab(false);
      }
    };

    if (isTab || isWeddingTab) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTab, isWeddingTab]);

  return (
    <div className="w-[375px] h-[872px] flex flex-col gap-4">
      <div className="h-full bg-white overflow-y-auto">
        {block.map(comp => {
          const registryItem = blockRegistry[comp.type];

          const View = registryItem.viewComponent as React.ComponentType<{
            blockInfo: typeof comp;
          }>;

          return <View key={comp.id} blockInfo={comp} />;
        })}
      </div>
      <div className="w-full relative" ref={tabRef}>
        {isTab && <CompoenentsPopup />}

        <button
          className="w-full h-11 bg-white rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)] flex justify-center items-center gap-2 font-semibold"
          onClick={handleNewPage}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.800781 4.7998H8.80078M4.80078 0.799805V8.7998"
              stroke="black"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          페이지 추가
        </button>
      </div>
    </div>
  );
}
export default Preview;
