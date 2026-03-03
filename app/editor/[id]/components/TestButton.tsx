'use client';
import React from 'react';

function TestButton({ id }: { id: string }) {
  const handleOnClick = async () => {
    try {
      const res = await fetch('/api/drive/loadInvitation', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await res.json().catch(() => null);
      console.log(payload);
      if (!res.ok) {
        // const message =
        //   typeof payload?.message === 'string'
        //     ? payload.message
        //     : '대시보드 로드에 실패했습니다.';
        // throw new Error(message);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return <button onClick={handleOnClick}>테스트</button>;
}

export default TestButton;
