import * as fabric from 'fabric';
import React from 'react';

// 단순 버튼 스타일
const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  background: 'white',
  cursor: 'pointer',
  fontWeight: '500',
};

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function Menubar({ canvas, applyRichStyle }: Props) {
  if (!canvas) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '15px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={() => applyRichStyle({ fontWeight: 'bold' }, canvas)}
        style={btnStyle}
      >
        Bold
      </button>
      <button
        onClick={() => applyRichStyle({ fontStyle: 'italic' }, canvas)}
        style={btnStyle}
      >
        Italic
      </button>
      <button
        onClick={() => applyRichStyle({ underline: true }, canvas)}
        style={btnStyle}
      >
        <u>U</u>
      </button>
      <button
        onClick={() => applyRichStyle({ fill: '#ef4444' }, canvas)}
        style={{ ...btnStyle, color: 'red' }}
      >
        Red
      </button>
      <button
        onClick={() => applyRichStyle({ fill: '#10b981' }, canvas)}
        style={{ ...btnStyle, color: 'green' }}
      >
        Green
      </button>
      <button
        onClick={() =>
          applyRichStyle({ textBackgroundColor: '#fef08a' }, canvas)
        }
        style={btnStyle}
      >
        Highlight
      </button>
      <button
        onClick={() => applyRichStyle({ fontSize: 60 }, canvas)}
        style={btnStyle}
      >
        Big
      </button>
    </div>
  );
}
export default Menubar;
