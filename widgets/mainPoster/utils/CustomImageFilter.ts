import * as fabric from 'fabric';

import { PhotoPresetOptions } from '../types/fabric';

/**
 * Fabric.js 커스텀 사진 보정 필터 클래스
 */
export class PhotoPreset extends fabric.filters.BaseFilter<'PhotoPreset'> {
  public static type = 'PhotoPreset';
  public get type(): 'PhotoPreset' {
    return 'PhotoPreset';
  }
  public options: Required<PhotoPresetOptions>;

  constructor(options?: PhotoPresetOptions) {
    super();
    // 기본값과 전달받은 옵션 병합
    this.options = {
      exposure: 50,
      contrast: 50,
      saturation: 50,
      temperature: 50,
      tint: 50,
      fade: 0,
      vignette: 0,
      grain: 0,
      bw: 0,
      ...options,
    };
  }

  // 유틸리티 메서드
  private _clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  private _lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  private _randn = () => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  private _rgbToHsl(r: number, g: number, b: number) {
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r:
          h = ((g - b) / d) % 6;
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
      if (h < 0) h += 1;
    }
    return { h, s, l };
  }

  private _hslToRgb(h: number, s: number, l: number) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    const hp = h * 6;
    if (hp < 1) [r, g, b] = [c, x, 0];
    else if (hp < 2) [r, g, b] = [x, c, 0];
    else if (hp < 3) [r, g, b] = [0, c, x];
    else if (hp < 4) [r, g, b] = [0, x, c];
    else if (hp < 5) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return { r: r + m, g: g + m, b: b + m };
  }

  /**
   * 실제 픽셀 데이터를 조작하는 메서드
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public applyTo2d(options: any) {
    const imageData = options.imageData;
    const d = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const p = this.options;

    const expMul = Math.pow(2, (p.exposure - 50) / 50);
    const conMul = 1 + ((p.contrast - 50) / 50) * 0.8;
    const satMul = 1 + (p.saturation - 50) / 50;
    const temp = (p.temperature - 50) / 50;
    const tint = (p.tint - 50) / 50;
    const fadeLift = (p.fade / 100) * 0.25;
    const vignStr = (p.vignette / 100) * 0.75;
    const grainAmp = (p.grain / 100) * 0.1;
    const bwWeight = p.bw / 100;

    const cx = w / 2,
      cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] / 255,
        g = d[i + 1] / 255,
        b = d[i + 2] / 255;

      r *= expMul * (1 + temp * 0.12);
      g *= expMul * (1 + tint * 0.08);
      b *= expMul * (1 - temp * 0.12);

      r = (r - 0.5) * conMul + 0.5;
      g = (g - 0.5) * conMul + 0.5;
      b = (b - 0.5) * conMul + 0.5;

      const hsl = this._rgbToHsl(
        this._clamp01(r),
        this._clamp01(g),
        this._clamp01(b)
      );
      hsl.s = this._clamp01(hsl.s * satMul);
      const rgb = this._hslToRgb(hsl.h, hsl.s, hsl.l);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;

      r = r * (1 - fadeLift) + fadeLift;
      g = g * (1 - fadeLift) + fadeLift;
      b = b * (1 - fadeLift) + fadeLift;

      if (vignStr > 0) {
        const px = (i / 4) % w,
          py = Math.floor(i / 4 / w);
        const dist =
          Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2)) / maxR;
        const mask = 1 - vignStr * (dist * dist);
        r *= mask;
        g *= mask;
        b *= mask;
      }

      if (grainAmp > 0) {
        const noise = this._randn() * grainAmp;
        r += noise;
        g += noise;
        b += noise;
      }

      if (bwWeight > 0) {
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = this._lerp(r, lum, bwWeight);
        g = this._lerp(g, lum, bwWeight);
        b = this._lerp(b, lum, bwWeight);
      }

      d[i] = this._clamp01(r) * 255;
      d[i + 1] = this._clamp01(g) * 255;
      d[i + 2] = this._clamp01(b) * 255;
    }
  }

  // 객체를 JSON으로 직렬화할 때 필요한 데이터
  public toObject() {
    return { ...super.toObject(), options: this.options };
  }
}

fabric.classRegistry.setClass(PhotoPreset);
if (typeof window !== 'undefined') {
  fabric.setFilterBackend(new fabric.Canvas2dFilterBackend());
}
