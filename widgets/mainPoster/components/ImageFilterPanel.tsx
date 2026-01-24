import * as fabric from 'fabric';
import React from 'react';

import { ImageFilterOptions } from '../types/fabric';

interface Props {
  canvas: fabric.Canvas | null;
  applyImageFilter: (
    options: ImageFilterOptions,
    canvas: fabric.Canvas
  ) => void;
  currentFilters?: ImageFilterOptions;
}

const ImageFilterPanel: React.FC<Props> = ({
  canvas,
  applyImageFilter,
  currentFilters,
}) => {
  if (!canvas) return null;

  const handleChange = (
    key: keyof ImageFilterOptions,
    value: number | boolean
  ) => {
    const newOptions = { ...currentFilters, [key]: value };
    applyImageFilter(newOptions, canvas);
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#4b5563',
    marginBottom: '4px',
    display: 'block',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '120px',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '15px',
        background: '#f3f4f6',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '700px',
      }}
    >
      <div style={sectionStyle}>
        <label style={labelStyle}>밝기 (Brightness)</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={currentFilters?.brightness ?? 0}
          onChange={e => handleChange('brightness', Number(e.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>대비 (Contrast)</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={currentFilters?.contrast ?? 0}
          onChange={e => handleChange('contrast', Number(e.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>채도 (Saturation)</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={currentFilters?.saturation ?? 0}
          onChange={e => handleChange('saturation', Number(e.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>블러 (Blur)</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentFilters?.blur ?? 0}
          onChange={e => handleChange('blur', Number(e.target.value))}
        />
      </div>

      <div
        style={{
          ...sectionStyle,
          minWidth: '80px',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <input
          type="checkbox"
          id="grayscale"
          checked={currentFilters?.grayscale ?? false}
          onChange={e => handleChange('grayscale', e.target.checked)}
        />
        <label htmlFor="grayscale" style={{ ...labelStyle, marginBottom: 0 }}>
          흑백
        </label>
      </div>

      <div
        style={{
          ...sectionStyle,
          minWidth: '80px',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <input
          type="checkbox"
          id="invert"
          checked={currentFilters?.invert ?? false}
          onChange={e => handleChange('invert', e.target.checked)}
        />
        <label htmlFor="invert" style={{ ...labelStyle, marginBottom: 0 }}>
          반전
        </label>
      </div>
    </div>
  );
};

export default ImageFilterPanel;
