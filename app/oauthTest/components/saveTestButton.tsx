'use client';

import { useState } from 'react';

type BootstrapResponse = {
  workspaceFolderId: string;
  invitationFolderId: string;
  imageFolderId: string;
  audioFolderId: string;
  meta: {
    workspaceReused: boolean;
    invitationReused: boolean;
    assets: {
      imageReused: boolean;
      audioReused: boolean;
    };
  };
};

export default function SaveInvitationButton() {
  // 저장 중 중복 클릭 방지
  const [loading, setLoading] = useState(false);

  // 결과 표시용
  const [result, setResult] = useState<BootstrapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/drive/saveInvitation', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? '저장 초기화에 실패했습니다.');
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? '저장 준비 중…' : '저장'}
      </button>

      {/* 에러 표시 */}
      {error && (
        <div className="text-xs text-red-600">
          <p>{error}</p>
        </div>
      )}

      {/* 성공 결과 표시 (디버그/개발용) */}
      {result && (
        <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-700">
          <p className="font-medium">Drive 구조 준비 완료</p>

          <ul className="mt-2 space-y-1 break-all text-neutral-600">
            <li>
              workspaceFolderId: {result.workspaceFolderId}{' '}
              {result.meta.workspaceReused ? '(reused)' : '(created)'}
            </li>
            <li>
              invitationFolderId: {result.invitationFolderId}{' '}
              {result.meta.invitationReused ? '(reused)' : '(created)'}
            </li>
            <li>
              imageFolderId: {result.imageFolderId}{' '}
              {result.meta.assets.imageReused ? '(reused)' : '(created)'}
            </li>
            <li>
              audioFolderId: {result.audioFolderId}{' '}
              {result.meta.assets.audioReused ? '(reused)' : '(created)'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
