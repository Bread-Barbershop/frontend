import { act, renderHook } from '@testing-library/react';

import { useConfirm } from './useConfirm';
import { useConfirmStore } from '../store/useConfirmStore';

describe('useConfirm', () => {
  afterEach(() => {
    act(() => useConfirmStore.getState().handleClose());
  });

  it('안정된 confirm 함수를 제공하고 문자열과 옵션 객체를 Promise로 전달한다', async () => {
    const { result, rerender } = renderHook(() => useConfirm());
    const initialConfirm = result.current.confirm;

    rerender();

    expect(result.current.confirm).toBe(initialConfirm);

    let stringPromise!: Promise<boolean>;
    act(() => {
      stringPromise = result.current.confirm('계속하시겠습니까?');
    });
    expect(useConfirmStore.getState().message).toBe('계속하시겠습니까?');
    act(() => useConfirmStore.getState().handleConfirm());
    await expect(stringPromise).resolves.toBe(true);

    const options = {
      message: '변경 내용을 저장할까요?',
      confirmText: '저장',
      cancelText: '취소',
      variant: 'white' as const,
      xPosition: 'right' as const,
      yPosition: 'bottom' as const,
    };
    let optionsPromise!: Promise<boolean>;
    act(() => {
      optionsPromise = result.current.confirm(options);
    });

    const state = useConfirmStore.getState();
    expect(state.message).toBe(options.message);
    expect(state.confirmText).toBe(options.confirmText);
    expect(state.cancelText).toBe(options.cancelText);
    expect(state.variant).toBe(options.variant);
    expect(state.xPosition).toBe(options.xPosition);
    expect(state.yPosition).toBe(options.yPosition);

    act(() => useConfirmStore.getState().handleCancel());
    await expect(optionsPromise).resolves.toBe(false);
  });
});
