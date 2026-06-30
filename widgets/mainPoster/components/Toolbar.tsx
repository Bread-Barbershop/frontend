import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button';
import Background from '@/shared/assets/icons/add-background.svg';
import AddDrawing from '@/shared/assets/icons/add-drawing.svg';
// import AddEraser from '@/shared/assets/icons/add-eraser.svg';
import AddImage from '@/shared/assets/icons/add-image.svg';
// import AddPencil from '@/shared/assets/icons/add-pencil.svg';
import AddText from '@/shared/assets/icons/add-text.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

function Toolbar() {
  const { canvas, createTextBox, setDrawingType, drawingType, addSlotRect } =
    useFabricContext();
  const { activeTab, setActiveTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
    }))
  );
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('type') === 'admin';

  if (!canvas) return null;

  type ToolbarItem = {
    id: string;
    active: boolean;
    araiaLabel: string;
    icon: React.ReactNode;
    hoverIcon: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: 'bordered' | 'solid' | 'flat' | 'ghost' | 'light';
  };

  const TOOLBAR_ITEMS: ToolbarItem[] = [
    {
      id: 'text',
      active: activeTab === 'text',
      araiaLabel: '텍스트 추가',
      icon: <AddText width={19} height={22} />,
      hoverIcon: (
        <p className="w-24 font-semibold text-sm text-text-plain ">
          텍스트 추가
        </p>
      ),
      onClick: () => {
        setActiveTab('text');
        createTextBox(canvas);
      },
    },
    {
      id: 'image',
      active: activeTab === 'image',
      araiaLabel: '이미지 추가',
      icon: <AddImage width={24} height={24} />,
      onClick: () => {
        setActiveTab('image');
      },
      hoverIcon: (
        <p className="w-24 font-semibold text-sm text-text-plain">
          이미지 추가
        </p>
      ),
    },
    {
      id: 'graphic',
      active: activeTab === 'graphic' && drawingType === 'pen',
      araiaLabel: '그림 그리기',
      icon: <AddDrawing width={22} height={20} />,
      hoverIcon: (
        <p className="w-24 font-semibold text-sm text-text-plain">
          그림 그리기
        </p>
      ),
      onClick: () => {
        setActiveTab('graphic');
        setDrawingType('pen');
      },
    },
    {
      id: 'background',
      active: activeTab === 'background',
      araiaLabel: '배경 변경',
      icon: <Background width={22} height={22} />,
      hoverIcon: (
        <p className="w-24 font-semibold text-sm text-text-plain">
          배경색 변경
        </p>
      ),
      onClick: () => {
        setActiveTab('background');
      },
    },
  ];

  if (isAdmin) {
    TOOLBAR_ITEMS.unshift({
      id: 'slot',
      active: activeTab === 'slot',
      araiaLabel: '슬롯 추가',
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <path d="M3 9h18"></path>
          <path d="M9 3v18"></path>
        </svg>
      ),
      hoverIcon: (
        <p className="w-26.25 font-bold text-[16px] text-text-plain">
          슬롯 추가
        </p>
      ),
      onClick: () => {
        setActiveTab('slot');
        addSlotRect();
      },
    });

    TOOLBAR_ITEMS.unshift({
      id: 'shape',
      active: activeTab === 'shape',
      araiaLabel: '도형 추가',
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      ),
      hoverIcon: (
        <p className="w-26.25 font-bold text-[16px] text-text-plain">
          도형 추가
        </p>
      ),
      onClick: () => {
        setActiveTab('shape');
      },
    });
  }

  return (
    <div
      className="absolute z-30 top-1/2 -translate-y-1/2 -left-6 -translate-x-full flex flex-col gap-3 items-end"
      data-canvas="true"
    >
      {TOOLBAR_ITEMS.map(item => (
        <div
          key={item.id}
          className="group/item relative flex h-11 w-[105px] justify-end"
        >
          <Button
            className={`absolute right-0 top-0 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-bg-base transition-[width] duration-200 ease-out group-hover/item:w-[105px] group-focus-within/item:w-[105px] hover:bg-bg-base ${item.className || ''}`}
            onClick={item.onClick}
            active={item.active}
            shadow="custom"
            aria-label={item.araiaLabel}
          >
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-150 ease-out group-hover/item:-translate-x-2 group-hover/item:opacity-0 group-focus-within/item:-translate-x-2 group-focus-within/item:opacity-0">
              {item.icon}
            </span>
            <span className="absolute inset-y-0 left-0 flex translate-x-2 items-center pl-11 pr-4 text-left opacity-0 transition-all duration-200 ease-out group-hover/item:-translate-x-6 group-hover/item:opacity-100 group-focus-within/item:-translate-x-6 group-focus-within/item:opacity-100">
              {item.hoverIcon}
            </span>
          </Button>
        </div>
      ))}
    </div>
  );
}
export default Toolbar;
