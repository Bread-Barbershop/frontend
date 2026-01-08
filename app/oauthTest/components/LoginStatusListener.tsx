'use client';

import { useEffect, useState } from 'react';

export default function LoginStatusListener() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        setMessage('로그인 성공!');
      }
      if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
        setMessage('로그인 실패. 다시 시도해 주세요.');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!message) return null;

  return (
    <p className="mt-4 text-sm font-medium text-green-600" role="status">
      {message}
    </p>
  );
}
