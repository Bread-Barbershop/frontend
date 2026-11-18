'use client';
import { useEffect, useState } from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import {
  collectionClosesAt,
  emptyCollection,
  lastCollectionDay,
} from './model';

export default function CollectionSettings({
  suggestedDate,
}: {
  suggestedDate: string;
}) {
  const folder = useEditorStore(s => s.invitationFolderId);
  const [values, setValues] = useState(emptyCollection);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'saving'>(
    'loading'
  );
  const [notice, setNotice] = useState('');
  const [version, reload] = useState(0);
  useEffect(() => {
    if (!folder) return;
    const controller = new AbortController();
    setState('loading');
    setNotice('');
    fetch(
      '/api/guest-collection/settings?folder=' + encodeURIComponent(folder),
      { cache: 'no-store', signal: controller.signal }
    )
      .then(async r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        if (!controller.signal.aborted) {
          setValues({
            guestbook: data.guestbook,
            photos: data.photos,
            eventDate: data.eventDate || suggestedDate,
          });
          setState('ready');
          if (data.reconnect)
            setNotice(
              'Google에 다시 연결해야 하객 접수를 이어갈 수 있어요. 로그인 후 아래 버튼을 눌러 주세요.'
            );
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setState('error');
      });
    return () => controller.abort();
  }, [folder, suggestedDate, version]);
  const on = values.photos || values.guestbook;
  async function apply() {
    setState('saving');
    setNotice('');
    try {
      const result = await fetch('/api/guest-collection/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, folder, consent: on }),
      });
      if (!result.ok)
        throw new Error(
          (await result.json()).message || '설정을 저장하지 못했어요.'
        );
      setNotice(
        on
          ? '접수 설정을 저장했어요. 로그아웃해도 하객이 참여할 수 있어요.'
          : '새 접수를 껐어요. 이미 받은 글과 사진은 그대로 보관돼요.'
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : '다시 시도해 주세요.');
    } finally {
      setState('ready');
    }
  }
  return (
    <section
      aria-label="하객 접수 설정"
      className="space-y-3 border-t border-black/10 pt-4 text-sm"
    >
      <h3 className="font-semibold">방명록과 하객 사진</h3>
      {!folder ? (
        <p>초대장을 먼저 저장하면 하객 접수를 설정할 수 있어요.</p>
      ) : state === 'loading' ? (
        <p>접수 설정을 불러오는 중이에요.</p>
      ) : state === 'error' ? (
        <button type="button" onClick={() => reload(v => v + 1)}>
          접수 설정 다시 불러오기
        </button>
      ) : (
        <>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={values.guestbook}
              onChange={e =>
                setValues({ ...values, guestbook: e.target.checked })
              }
            />
            공개 방명록 받기
          </label>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={values.photos}
              onChange={e => setValues({ ...values, photos: e.target.checked })}
            />
            나만 보는 하객 사진 받기
          </label>
          {on && (
            <>
              <label className="flex items-center gap-3">
                예식일
                <input
                  type="date"
                  className="rounded border p-1"
                  value={values.eventDate}
                  onChange={e =>
                    setValues({ ...values, eventDate: e.target.value })
                  }
                />
              </label>
              <p>
                {lastCollectionDay(values.eventDate)
                  ? `예식 후 3일째인 ${lastCollectionDay(values.eventDate)} 23:59까지 새 글과 사진을 받아요(한국 시간).`
                  : '예식일을 선택하면 접수가 끝나는 날짜를 확인할 수 있어요.'}{' '}
                가족·친구용 링크도 같은 방명록과 사진함을 사용해요.
              </p>
              {values.guestbook && (
                <p>
                  이름과 축하 글, 작성일은 링크로 읽을 수 있는 전용 Google
                  시트에 저장돼요. 마감 후에도 읽을 수 있으니 이 파일에는 공개할
                  내용만 넣어 주세요.
                </p>
              )}
              {values.photos && (
                <p>
                  사진은 내 드라이브의 비공개 사진함에 모여요. 하객은 다른
                  사람의 사진을 볼 수 없어요.
                </p>
              )}
              <p>
                로그아웃한 동안에도 받으려면 인비아가 내 Google 연결을 기억해야
                해요. 이 초대장의 연결 정보는 암호화해 보관하고, 접수를 모두
                끄거나 마감하면 삭제해요.
              </p>
            </>
          )}
          {!on && (
            <p>
              둘 다 끄면 이 초대장의 하객 접수용 Google 연결 정보가 삭제돼요.
              이미 받은 방명록과 사진은 내 Drive에 남아요.
            </p>
          )}
          <button
            type="button"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
            disabled={
              state === 'saving' ||
              (on && collectionClosesAt(values.eventDate) <= Date.now())
            }
            onClick={() => void apply()}
          >
            {state === 'saving'
              ? '저장 중…'
              : on
                ? '동의하고 접수 설정 저장'
                : '접수 끄기'}
          </button>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
