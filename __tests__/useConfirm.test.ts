import { renderHook, act } from '@testing-library/react';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { useConfirmStore } from '@/shared/store/useConfirmStore';

describe('useConfirm 커스텀 훅 테스트', () => {
  beforeEach(() => {
    // 매 테스트 시작 전 상태를 초기값으로 리셋
    act(() => {
      useConfirmStore.setState({
        isOpen: false,
        message: '',
        confirmText: '예',
        cancelText: '아니오',
        variant: 'glass',
        xPosition: 'center',
        yPosition: 'top',
        resolveRef: null,
      });
    });
  });

  it('confirm 함수 호출 시 isOpen 상태가 true로 변경된다', () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm('테스트 메시지');
    });

    expect(useConfirmStore.getState().isOpen).toBe(true);
    expect(useConfirmStore.getState().message).toBe('테스트 메시지');
  });

  it('confirm 함수 호출 시 기본 옵션(예/아니오)이 올바르게 설정된다', () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm('테스트 메시지');
    });

    expect(useConfirmStore.getState().confirmText).toBe('예');
    expect(useConfirmStore.getState().cancelText).toBe('아니오');
  });

  it('confirm 함수 호출 시 커스텀 옵션이 올바르게 반영된다', () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm({
        message: '삭제하시겠습니까?',
        confirmText: '삭제',
        cancelText: '취소',
        variant: 'white',
      });
    });

    expect(useConfirmStore.getState().message).toBe('삭제하시겠습니까?');
    expect(useConfirmStore.getState().confirmText).toBe('삭제');
    expect(useConfirmStore.getState().cancelText).toBe('취소');
    expect(useConfirmStore.getState().variant).toBe('white');
  });

  it('handleConfirm 호출 시 Promise가 true로 해결된다', async () => {
    const { result } = renderHook(() => useConfirm());

    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm('확인 요청');
    });

    act(() => {
      useConfirmStore.getState().handleConfirm();
    });

    await expect(confirmPromise!).resolves.toBe(true);
  });

  it('handleCancel 호출 시 Promise가 false로 해결된다', async () => {
    const { result } = renderHook(() => useConfirm());

    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.confirm('확인 요청');
    });

    act(() => {
      useConfirmStore.getState().handleCancel();
    });

    await expect(confirmPromise!).resolves.toBe(false);
  });
});
