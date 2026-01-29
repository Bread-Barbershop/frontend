'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '../store/useEditorStore';
import { blockRegistry } from '../types/registry';

import CompoenentsPopup from './components/CompoenentsPopup';
import OrderPanel from './components/OrderPanel';

function Preview() {
  const [isTab, setIsTab] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { block, selectedId, selectedBlock } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      selectedId: state.selectedId,
      selectedBlock: state.selectedBlock,
    }))
  );

  useEffect(() => {
    if (!selectedId) return;
    const el = blockRefs.current[selectedId];
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [selectedId, block]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setIsTab(false);
      }
    };

    if (isTab) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isTab]);

  const handlePopClose = () => {
    setIsTab(false);
  };
  return (
    <div className="w-93.75 h-218 flex flex-col  gap-4 relative">
      <div className="h-203 bg-white">
        <div className="overflow-y-auto h-full w-93.75 box-border flex flex-col justify-center">
          {block.map(comp => {
            const registryItem = blockRegistry[comp.component];

            const View = registryItem.viewComponent as React.ComponentType<{
              blockInfo: typeof comp;
              className: string;
              onClick: () => void;
            }>;

            return (
              <div
                key={comp.id}
                ref={el => {
                  blockRefs.current[comp.id] = el;
                }}
              >
                <View
                  key={comp.id}
                  blockInfo={comp}
                  className={`${selectedId === comp.id ? 'border border-primary rounded-lg' : ''}`}
                  onClick={() => selectedBlock(comp.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
      {block.length > 0 && <OrderPanel />}
      <div className="w-full relative" ref={tabRef}>
        {isTab && <CompoenentsPopup onPopClose={handlePopClose} />}

        <button
          type="button"
          className="w-full h-11 bg-white rounded-lg shadow-edit flex-center gap-2 font-semibold"
          onClick={() => setIsTab(props => !props)}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>페이지 추가</title>
            <path
              d="M0.800781 4.7998H8.80078M4.80078 0.799805V8.7998"
              stroke="black"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          페이지 추가
        </button>
      </div>
    </div>
  );
}
export default Preview;
