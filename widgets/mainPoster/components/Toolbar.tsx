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
    icon: React.ReactNode;
    onClick: () => void;
    active: boolean;
    hoverIcon: React.ReactNode;
    className?: string;
    variant?: 'bordered' | 'solid' | 'flat' | 'ghost' | 'light';
  };

  const TOOLBAR_ITEMS: ToolbarItem[] = [
    {
      id: 'text',
      active: activeTab === 'text',
      icon: <AddText width={19} height={22} />,
      hoverIcon: (
        <p className="w-26.25 font-bold text-[16px] text-text-plain ">
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
      icon: <AddImage width={24} height={24} />,
      onClick: () => {
        setActiveTab('image');
      },
      hoverIcon: (
        <p className="w-26.25 font-bold text-[16px] text-text-plain">
          이미지 추가
        </p>
      ),
    },
    {
      id: 'graphic',
      active: activeTab === 'graphic' && drawingType === 'pen',
      icon: <AddDrawing width={22} height={20} />,
      hoverIcon: (
        <p className="w-26.25 font-bold text-[16px] text-text-plain">
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
      icon: <Background width={22} height={22} />,
      hoverIcon: (
        <p className="w-26.25 font-bold text-[16px] text-text-plain">
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
      className:
        activeTab === 'slot' ? '' : 'bg-[#0F766E] text-white border-none',
      variant: activeTab === 'slot' ? 'bordered' : 'solid',
    });

    TOOLBAR_ITEMS.unshift({
      id: 'shape',
      active: activeTab === 'shape',
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
      hoverIcon: <p className="w-26.25 font-bold text-text-plain">도형 추가</p>,
      onClick: () => {
        setActiveTab('shape');
      },
      className:
        activeTab === 'shape' ? '' : 'bg-[#10B981] text-white border-none',
      variant: activeTab === 'shape' ? 'bordered' : 'solid',
    });
  }

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -left-6 -translate-x-full flex flex-col gap-3 items-end"
      data-canvas="true"
    >
      {TOOLBAR_ITEMS.map(item => (
        <Button
          key={item.id}
          className={`group size-11 hover:w-[105px] rounded-full shadow-btn-drop-black transition-width duration-150 ${item.className || ''}`}
          onClick={item.onClick}
          active={item.active}
        >
          <span className="flex items-center justify-center group-hover:hidden">
            {item.icon}
          </span>
          <span className="hidden items-center justify-center group-hover:inline-flex">
            {item.hoverIcon}
          </span>
        </Button>
      ))}
    </div>
  );
}
export default Toolbar;
