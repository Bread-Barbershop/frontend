'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import LargeColorPicker from '@/components/molecules/color-picker/LargeColorPicker';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export function GraphicPanel() {
  const { canvas, toggleDrawingMode, drawingType } = useFabricContext();
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
        type: drawingType,
        color: drawingConfig.color,
        config: {
          width: drawingConfig.width,
        },
      });
    }
  }, [canvas, drawingConfig, drawingType, toggleDrawingMode]);

  // 패널 진입 시 그리기 모드 강제 활성화 (사용자 편의)
  useEffect(() => {
    if (!canvas) return;
    toggleDrawingMode(canvas, {
      enable: true,
      type: drawingType,
      color: drawingConfig.color,
      config: {
        width: drawingConfig.width,
      },
    });

    return () => {
      // 패널 나갈 때 그리기 모드 해제
      toggleDrawingMode(canvas, { enable: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, toggleDrawingMode, drawingConfig]);

  if (!canvas) return null;

  return (
    <LeftEditorWrapper ariaLabel="그리기 설정">
      <div className="flex flex-col w-full items-center">
        <section className="w-full h-11 flex flex-row gap-2 items-center justify-center bg-bg-base">
          <p className="w-[47px] h-8 flex items-center justify-center text-[13px] font-semibold text-text-primary">
            굵기
          </p>
          <div className="flex items-center justify-center w-56 h-8 px-1">
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
          <input
            type="text"
            readOnly
            value={drawingConfig.width}
            className="flex items-center justify-center text-center w-[47px] h-8 text-xs bg-bg-base border border-border-neutral rounded-lg focus:outline-none"
          />
        </section>

        <LargeColorPicker
          value={drawingConfig.color}
          onChange={e => setDrawingConfig({ color: e.hsva })}
          className="border-none pl-6 pr-4"
        />
      </div>
    </LeftEditorWrapper>
  );
}
