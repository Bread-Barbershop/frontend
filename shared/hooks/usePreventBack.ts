import { useEffect } from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { useConfirm } from './useConfirm';

export function usePreventBack() {
  const { confirm } = useConfirm();
  const isDirty = useEditorStore(state => state.isDirty);

  useEffect(() => {
    // 1. 탭 닫기 / 새로고침 방지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };

    // 2. 뒤로가기 방지
    const handlePopState = async () => {
      if (!isDirty) {
        return;
      }

      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
      });
      if (!isConfirm) {
        history.pushState(null, '', window.location.href);
        return;
      }
      window.removeEventListener('popstate', handlePopState);
      history.back();
    };

    history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [confirm, isDirty]);
}
