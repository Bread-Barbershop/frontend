'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import ColorPicker from '../richtext/ColorPicker';

export function GraphicPanel() {
  const { canvas, toggleDrawingMode } = useFabricContext();
  const { drawingConfig, setDrawingConfig } = useEditorStore(
    useShallow(state => ({
      drawingConfig: state.drawingConfig,
      setDrawingConfig: state.setDrawingConfig,
    }))
  );

  // 설정 변경 시 브러시 업데이트
  useEffect(() => {
    if (!canvas) return;

    if (canvas.isDrawingMode) {
      toggleDrawingMode(canvas, {
        enable: true,
        ...drawingConfig,
      });
    }
  }, [canvas, drawingConfig, toggleDrawingMode]);

  // 패널 진입 시 그리기 모드 강제 활성화 (사용자 편의)
  useEffect(() => {
    if (!canvas) return;
    toggleDrawingMode(canvas, {
      enable: true,
      ...drawingConfig,
    });

    return () => {
      // 패널 나갈 때 그리기 모드 해제
      toggleDrawingMode(canvas, { enable: false });
    };
  }, [canvas, toggleDrawingMode, drawingConfig]);

  if (!canvas) return null;

  return (
    <LeftEditorWrapper ariaLabel="그리기 설정">
      <NavigationBar>그리기</NavigationBar>

      <div className="flex flex-col gap-6 w-full py-2">
        <section className="relative w-full">
          <div className="bg-bg-base">
            <div className="mb-2 text-center text-[13px] font-semibold text-text-primary">
              굵기
            </div>
            <div className="flex items-center gap-1.5 w-full">
              <input
                type="text"
                readOnly
                value={drawingConfig.width}
                className="flex items-center justify-center text-center w-[47px] h-[32px] text-xs bg-bg-base border border-border-neutral rounded-lg focus:outline-none"
              />
              <div className="flex-1 px-1">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={drawingConfig.width}
                  onChange={e =>
                    setDrawingConfig({ width: parseInt(e.target.value, 10) })
                  }
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6]
                    [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] [&::-moz-range-thumb]:border-none"
                />
              </div>
            </div>
          </div>
        </section>

        <ColorPicker
          onColorSelect={color => setDrawingConfig({ color })}
          selectedColor={drawingConfig.color}
        />
      </div>
    </LeftEditorWrapper>
  );
}
