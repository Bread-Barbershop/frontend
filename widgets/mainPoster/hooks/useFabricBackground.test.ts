import { act, renderHook } from '@testing-library/react';
import { Observable } from 'fabric';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { useFabricBackground } from './useFabricBackground';

import type { Canvas } from 'fabric';

describe('포스터 배경색 복원', () => {
  it('저장된 반투명 배경과 이후 캔버스에서 복원한 색을 편집기에 표시한다', () => {
    const canvas = Object.assign(new Observable<{ 'after:render': unknown }>(), {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    });
    const saveHistory = jest.fn();
    const { result } = renderHook(() =>
      useFabricBackground({
        canvas: canvas as unknown as Canvas,
        saveHistory,
      })
    );

    expect(result.current.backgroundColor).toEqual({
      h: 0,
      s: 0,
      v: 100,
      a: 0.8,
    });
    act(() => {
      canvas.backgroundColor = '#182433';
      canvas.fire('after:render');
    });
    expect(result.current.backgroundColor).toEqual(
      expect.objectContaining({ a: 1 })
    );
    expect(saveHistory).not.toHaveBeenCalled();
  });

  it('배경만 변경해도 투명도를 캔버스에 기록하고 미저장 변경으로 표시한다', () => {
    const canvas = Object.assign(new Observable<{ 'after:render': unknown }>(), {
      backgroundColor: '#ffffff',
      getObjects: () => [],
      set: jest.fn(),
      requestRenderAll: jest.fn(),
    });
    const saveHistory = jest.fn();
    useEditorStore.getState().setIsDirty(false);
    const { result } = renderHook(() =>
      useFabricBackground({
        canvas: canvas as unknown as Canvas,
        saveHistory,
      })
    );

    act(() =>
      result.current.updateBackgroundColor({ h: 0, s: 0, v: 100, a: 0.8 })
    );

    expect(canvas.set).toHaveBeenCalledWith({
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backgroundImage: null,
    });
    expect(useEditorStore.getState().isDirty).toBe(true);
    expect(saveHistory).toHaveBeenCalledTimes(1);
  });
});
