import { useEffect } from 'react';

export function usePreventBack() {
  useEffect(() => {
    // 1. 탭 닫기 / 새로고침 방지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    // 2. 뒤로가기 방지
    const handlePopState = () => {
      const leave = window.confirm(
        '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?'
      );
      if (!leave) {
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
  }, []);
}
