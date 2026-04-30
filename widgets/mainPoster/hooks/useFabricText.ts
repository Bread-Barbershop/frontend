import { Canvas, Pattern, Shadow, Textbox } from 'fabric';
import { useCallback, useMemo } from 'react';

import { debounce } from '@/shared/utils/debounce';

import { LayoutStyle, RichStyle, RichStyleKey, TextboxWithLock } from '../types/fabric';

interface Props {
  syncActiveObjectInfo?: (canvas: Canvas) => void;
  saveHistory: () => void;
}

const isLayoutStyle = (style: RichStyle): style is LayoutStyle => {
  return (
    'textAlign' in style ||
    'lineHeight' in style ||
    'charSpacing' in style ||
    'shadow' in style
  );
};

const getFallbackValue = (key: string) => {
  switch (key) {
    case 'fontWeight':
      return 'normal';
    case 'fontStyle':
      return 'normal';
    case 'underline':
      return false;
    case 'linethrough':
      return false;
    case 'stroke':
      return null;
    case 'strokeWidth':
      return 0;
    case 'textAlign':
      return 'left';
    case 'fill':
      return 'black';
    case 'textBackgroundColor':
      return null;
    case 'shadow':
      return null;
    case 'lineHeight':
      return 1.1;
    case 'fontSize':
      return 16;
    case 'charSpacing':
      return 0;
    default:
      return '';
  }
};

export const useFabricText = ({ syncActiveObjectInfo, saveHistory }: Props) => {
  const createTextBox = (canvas: Canvas) => {
    const newTextbox = new Textbox('텍스트를 입력해주세요', {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      width: 100,
      fontSize: 16,
      splitByGrapheme: true,
    });

    newTextbox.set({ id: `text-${Date.now()}` });
    canvas.add(newTextbox);
    canvas.setActiveObject(newTextbox);
    if (syncActiveObjectInfo) {
      syncActiveObjectInfo(canvas);
    }
    newTextbox.enterEditing();
    newTextbox.selectAll();
    canvas.requestRenderAll();
  };

  const handleNumberInValidity = (styleObj: RichStyle) => {
    for (const [key, value] of Object.entries(styleObj)) {
      if (
        key === 'fontSize' ||
        key === 'strokeWidth' ||
        key === 'charSpacing' ||
        key === 'lineHeight'
      ) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (typeof numValue !== 'number' || Number.isNaN(numValue)) return true;

        if (key === 'fontSize' && numValue < 1) return true;
        if (key === 'strokeWidth' && numValue < 0) return true;
        if (
          (key === 'charSpacing' || key === 'lineHeight') &&
          (numValue < -200 || numValue > 200)
        )
          return true;
      }
    }
    return false;
  };

  const applyRichStyle = useCallback(
    (styleObj: RichStyle, canvas: Canvas) => {
      const activeObject = canvas.getActiveObject() as TextboxWithLock;
      if (!activeObject || activeObject.isLocked) return;
      if (handleNumberInValidity(styleObj)) return;

      const isLayout = isLayoutStyle(styleObj);
      const isSelectionPresent =
        activeObject.selectionStart !== undefined &&
        activeObject.selectionEnd !== undefined &&
        activeObject.selectionStart !== activeObject.selectionEnd;

      const finalStyle: RichStyle = {};
      (Object.keys(styleObj) as Array<keyof RichStyle>).forEach(key => {
        const nextValue = styleObj[key];

        const currentStyle = isSelectionPresent
          ? activeObject.getSelectionStyles(
              activeObject.selectionStart,
              activeObject.selectionStart + 1
            )[0]?.[key]
          : activeObject.get(key as keyof Textbox);

        if (
          key === 'fontSize' ||
          key === 'fontFamily' ||
          key === 'fill' ||
          key === 'stroke' ||
          key === 'textBackgroundColor' ||
          isLayout
        ) {
          finalStyle[key] = nextValue as never;
        } else if (currentStyle === nextValue) {
          finalStyle[key] = getFallbackValue(key) as never;
        } else {
          finalStyle[key] = nextValue as never;
        }
      });

      if (isLayout) {
        if (styleObj.shadow) {
          activeObject.set({
            shadow: new Shadow({
              ...activeObject.shadow,
              ...styleObj.shadow,
            }),
          });
        } else {
          activeObject.set(finalStyle);
        }
      } else {
        if (isSelectionPresent) {
          activeObject.setSelectionStyles(finalStyle);
        } else {
          activeObject.set(finalStyle);
        }
      }

      activeObject.dirty = true;
      activeObject.initDimensions();
      saveHistory();
      canvas.requestRenderAll();
      syncActiveObjectInfo?.(canvas);
    },
    [saveHistory, syncActiveObjectInfo]
  );

  const getRichStyles = <T extends RichStyleKey>(
    activeObject: Textbox,
    style: T,
    onChange: (value: string) => void
  ) => {
    if (!activeObject) return;

    const isSelectionPresent =
      activeObject.selectionStart !== activeObject.selectionEnd;

    const currentStyle = isSelectionPresent
      ? (activeObject.getSelectionStyles(
          activeObject.selectionStart,
          activeObject.selectionStart + 1
        )[0]?.[style] as string)
      : (activeObject.get(style) as string);

    if (currentStyle !== undefined && currentStyle !== null) {
      onChange(currentStyle);
    }
  };

  const setPatternOffset = (
    canvas: Canvas,
    offsetX: number,
    offsetY: number
  ) => {
    const activeObject = canvas.getActiveObject() as Textbox;
    if (!activeObject) return;

    let patternUpdated = false;

    // 1. 전체 객체 레벨의 패턴 업데이트
    if (activeObject.fill instanceof Pattern) {
      activeObject.fill.offsetX = offsetX;
      activeObject.fill.offsetY = offsetY;
      patternUpdated = true;
    }

    // 2. 선택 영역(글자별) 패턴 업데이트 (있는 경우)
    if (activeObject.isType('textbox') || activeObject.isType('itext')) {
      const styles = activeObject.getSelectionStyles(
        0,
        activeObject.text.length
      );
      styles.forEach(style => {
        if (style.fill instanceof Pattern) {
          style.fill.offsetX = offsetX;
          style.fill.offsetY = offsetY;
          patternUpdated = true;
        }
      });
    }

    if (patternUpdated) {
      // 강제 렌더링 갱신
      activeObject.dirty = true;
      saveHistory();
      canvas.requestRenderAll();
    }
  };

  const debouncedApplyStyle = useMemo(
    () =>
      debounce((style: RichStyle, canvas: Canvas) => {
        applyRichStyle(style, canvas);
      }, 300),
    [applyRichStyle]
  );

  return {
    createTextBox,
    applyRichStyle,
    debouncedApplyStyle,
    getRichStyles,
    setPatternOffset,
  };
};
