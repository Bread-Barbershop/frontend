import * as fabric from 'fabric';
import React, { useMemo, useState } from 'react';
import { RiMenu2Fill, RiMenu3Fill, RiMenu5Fill } from 'react-icons/ri';

import { Selector } from '@/components/molecules/selector';
import { debounce } from '@/shared/utils/debounce';

import { RichStyle } from '../types/fabric';

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  background: 'white',
  cursor: 'pointer',
  fontWeight: '500',
};
type selectorOptions = { label: string; value: string };

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function Menubar({ canvas, applyRichStyle }: Props) {
  const [selectedFontSize, setSelectedFontSize] = useState<selectorOptions>();

  const [selectedStrokeSize, setSelectedStrokeSize] = useState<selectorOptions>(
    {
      label: '0.5',
      value: '0.5',
    }
  );

  const fontSize: selectorOptions[] = [];
  const fontSizeList = [10, 12, 14, 16, 20, 24, 32, 40];
  fontSizeList.forEach(size => {
    const obj = {
      label: `${size}px`,
      value: String(size),
    };
    fontSize.push(obj);
  });

  const strokeSize: selectorOptions[] = [];
  const strokeSizeList = [0.5, 1.0, 1.5, 2.0, 3.0];
  strokeSizeList.forEach(size => {
    const obj = {
      label: String(size),
      value: String(size),
    };
    strokeSize.push(obj);
  });

  const debouncedApplyStyle = useMemo(
    () =>
      debounce((style: RichStyle, canvas: fabric.Canvas) => {
        applyRichStyle(style, canvas);
      }, 300),
    [applyRichStyle]
  );
  const handleNumberChange = (value: string | number) => {
    if (!canvas) return;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue < 1) {
      return;
    }
    return numValue;
  };

  if (!canvas) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '15px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}
    >
      <button
        type="button"
        onClick={() => applyRichStyle({ fontWeight: 'bold' }, canvas)}
        style={btnStyle}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ fontStyle: 'italic' }, canvas)}
        style={btnStyle}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ underline: true }, canvas)}
        style={btnStyle}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ textAlign: 'left' }, canvas)}
        style={btnStyle}
      >
        <RiMenu2Fill className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ textAlign: 'center' }, canvas)}
        style={btnStyle}
      >
        <RiMenu5Fill className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ textAlign: 'right' }, canvas)}
        style={btnStyle}
      >
        <RiMenu3Fill className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ fill: '#ef4444' }, canvas)}
        style={{ ...btnStyle, color: 'red' }}
      >
        Red
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ fill: '#10b981' }, canvas)}
        style={{ ...btnStyle, color: 'green' }}
      >
        Green
      </button>
      <button
        type="button"
        onClick={() =>
          applyRichStyle({ textBackgroundColor: '#fef08a' }, canvas)
        }
        style={btnStyle}
      >
        Highlight
      </button>
      <button
        type="button"
        onClick={() => applyRichStyle({ fontSize: 60 }, canvas)}
        style={btnStyle}
      >
        Big
      </button>
      {/* 폰트 */}
      <Selector
        placeholder="16px"
        options={fontSize}
        // 폰트 사이즈 여러개 섞였을시 mixed 표시 필요
        onSelect={option => {
          const safeSize = handleNumberChange(option.value);
          if (safeSize) {
            applyRichStyle({ fontSize: option.value }, canvas);
            setSelectedFontSize(option);
          }
        }}
        onInputChange={value => {
          setSelectedFontSize({ label: value, value: 'custom' });
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue < 1) {
            return;
          }
          debouncedApplyStyle({ fontSize: numValue }, canvas);
        }}
        selected={selectedFontSize ?? null}
      />
      {/* 폰트색 */}
      <section className="flex flex-col">
        <label htmlFor="fontColor">폰트 색</label>
        <input
          type="color"
          id="fontColor"
          onChange={e => applyRichStyle({ fill: e.target.value }, canvas)}
        />
      </section>
      {/* 하이라이팅 */}
      <section className="flex flex-col">
        <label htmlFor="textBackground">하이라이팅</label>
        <input
          type="color"
          id="textBackground"
          onChange={e =>
            applyRichStyle({ textBackgroundColor: e.target.value }, canvas)
          }
        />
      </section>
      {/* 외곽선 */}
      <section className="flex flex-col">
        <label htmlFor="lineHeight">외곽선</label>
        <input
          type="color"
          id="stroke"
          onChange={e => {
            const activeObject = canvas?.getActiveObject() as fabric.Textbox;
            if (!activeObject) return;

            const selectionStyles = activeObject.getSelectionStyles();

            const currentWidth =
              selectionStyles.length > 0 && selectionStyles[0].strokeWidth
                ? selectionStyles[0].strokeWidth
                : activeObject.get('strokeWidth');

            applyRichStyle(
              {
                stroke: e.target.value,
                strokeWidth: currentWidth,
              },
              canvas
            );
          }}
        />
        {/* 외곽선 두께 */}
        <Selector
          placeholder="0.5"
          options={strokeSize}
          // 폰트 사이즈 여러개 섞였을시 mixed 표시 필요
          onSelect={option => {
            applyRichStyle({ strokeWidth: Number(option.value) }, canvas);
            setSelectedStrokeSize(option);
          }}
          onInputChange={value => {
            debouncedApplyStyle({ strokeWidth: Number(value) }, canvas);
          }}
          selected={selectedStrokeSize ?? null}
        />
      </section>
      {/* 그림자 */}
      <section className="flex flex-col">
        <label htmlFor="shadowColor">그림자</label>
        <input
          type="color"
          id="shadowColor"
          onChange={e =>
            debouncedApplyStyle(
              {
                shadow: {
                  color: e.target.value,
                  blur: 2,
                  offsetX: 2,
                  offsetY: 2,
                },
              },
              canvas
            )
          }
        />
        <label htmlFor="shadowHorizon">horizontal</label>
        <input
          type="text"
          id="shadowHorizontal"
          placeholder="2"
          onChange={e => {
            debouncedApplyStyle(
              {
                shadow: {
                  offsetX: Number(e.target.value),
                },
              },
              canvas
            );
          }}
          className="flex items-center justify-between w-4 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
        />
        <label htmlFor="shadowHorizon">vertical</label>
        <input
          type="text"
          id="shadowVertical"
          placeholder="2"
          onChange={e => {
            debouncedApplyStyle(
              {
                shadow: {
                  offsetY: Number(e.target.value),
                },
              },
              canvas
            );
          }}
          className="flex items-center justify-between w-4 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
        />
        <label htmlFor="shadowHorizon">blur</label>
        <input
          type="text"
          id="shadowBlur"
          placeholder="2"
          onChange={e => {
            debouncedApplyStyle(
              {
                shadow: {
                  blur: Number(e.target.value),
                },
              },
              canvas
            );
          }}
          className="flex items-center justify-between w-4 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
        />
      </section>

      <section>
        <label htmlFor="lineHeight">행간</label>
        <input
          type="range"
          id="lineHeight"
          min="0"
          max="5"
          step="0.1"
          onChange={e => {
            debouncedApplyStyle({ lineHeight: Number(e.target.value) }, canvas);
          }}
        />
        <input
          type="text"
          id=""
          placeholder="1.6"
          onChange={e => {
            debouncedApplyStyle({ lineHeight: Number(e.target.value) }, canvas);
          }}
          className="flex items-center justify-between w-4 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
        />
      </section>
      <section>
        <label htmlFor="charSpacing">자간</label>
        <input
          type="range"
          id="charSpacing"
          min="-100"
          max="1000"
          step="50"
          onChange={e => {
            debouncedApplyStyle(
              { charSpacing: Number(e.target.value) },
              canvas
            );
          }}
        />
        <input
          type="text"
          id=""
          placeholder="100"
          onChange={e => {
            debouncedApplyStyle(
              { charSpacing: Number(e.target.value) },
              canvas
            );
          }}
          className="flex items-center justify-between w-4 px-2 py-2 text-sm bg-bg-base border transition-all border-border-neutral rounded-lg"
        />
      </section>
    </div>
  );
}
export default Menubar;
