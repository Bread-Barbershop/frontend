'use client';

import { useEffect } from 'react';

import LeftPanel from '@/widgets/editor/leftPanel/LeftPanel';
import Preview from '@/widgets/editor/preview/Preview';
import RightPanel from '@/widgets/editor/rightPanel/RightPanel';

function MainContentsArea() {
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
      if (leave) {
        history.back();
      } else {
        history.pushState(null, '', window.location.href);
      }
    };

    history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  return (
    <div className="min-w-[1280px] flex justify-between items-center">
      <LeftPanel />
      <Preview />
      <RightPanel />
    </div>
  );
}

export default MainContentsArea;
