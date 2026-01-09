'use client';

import { useState } from 'react';

export default function CreateWorkspaceButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    setFolderId(null);

    try {
      const res = await fetch('/api/drive/createWorkspace', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? '요청에 실패했습니다.');
      }

      setMessage(data.message);
      setFolderId(data.folderId);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : '워크스페이스 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? '생성 중…' : '작업 스페이스 생성'}
      </button>

      {message && (
        <div className="mt-2 text-xs text-neutral-600">
          <p>{message}</p>
          {folderId && (
            <p className="mt-1 break-all text-neutral-400">
              folderId: {folderId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
