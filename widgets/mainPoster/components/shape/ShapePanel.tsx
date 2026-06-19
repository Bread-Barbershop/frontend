'use client';

import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import LargeColorPicker from '@/components/molecules/color-picker/LargeColorPicker';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { convertFabricColor } from '@/widgets/mainPoster/utils/fabricUtils';

import { useFabricContext } from '../../context/FabricContext';

export function ShapePanel() {
  const { canvas, addRect, addLine, updateShapeStyle } = useFabricContext();
  const { shapeConfig, setShapeConfig } = useEditorStore(
    useShallow(state => ({
      shapeConfig: state.shapeConfig,
      setShapeConfig: state.setShapeConfig,
    }))
  );

  if (!canvas) return null;

  return (
    <LeftEditorWrapper ariaLabel="도형 설정">
      <NavigationBar>도형 설정</NavigationBar>

      <div className="flex flex-col gap-6 w-full pt-2 pb-5 items-center">
        <div className="flex gap-4 w-full">
          <UtilityButton
            size="md"
            className="w-full"
            onClick={() => addRect(canvas)}
          >
            사각형 추가
          </UtilityButton>
          <UtilityButton
            size="md"
            className="w-full"
            onClick={() => addLine(canvas)}
          >
            직선 추가
          </UtilityButton>
        </div>

        <section className="relative w-full">
          <div className="bg-bg-base">
            <div className="mb-2 text-center text-[13px] font-semibold text-text-primary">
              선 굵기
            </div>
            <div className="flex items-center gap-1.5 w-full">
              <input
                type="text"
                readOnly
                value={shapeConfig.strokeWidth}
                className="flex items-center justify-center text-center w-[47px] h-[32px] text-xs bg-bg-base border border-border-neutral rounded-lg focus:outline-none"
              />
              <div className="flex-1 px-1">
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={shapeConfig.strokeWidth}
                  onChange={e => {
                    const val = Number(e.target.value);
                    // const val = parseInt(e.target.value, 10);
                    setShapeConfig({ strokeWidth: val });
                    updateShapeStyle(canvas, { strokeWidth: val });
                  }}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6]
                    [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] [&::-moz-range-thumb]:border-none"
                />
              </div>
            </div>
          </div>
        </section>

        <LargeColorPicker
          title="선 색상"
          value={shapeConfig.strokeColor}
          onChange={e => {
            setShapeConfig({ strokeColor: e.hsva });
            updateShapeStyle(canvas, { stroke: convertFabricColor(e.hsva) });
          }}
          className="border-none pl-6 pr-4"
        />

        <LargeColorPicker
          title="채우기 색상"
          value={shapeConfig.fillColor}
          onChange={e => {
            setShapeConfig({ fillColor: e.hsva });
            updateShapeStyle(canvas, { fill: convertFabricColor(e.hsva) });
          }}
          className="border-none pl-6 pr-4"
        />
      </div>
    </LeftEditorWrapper>
  );
}
