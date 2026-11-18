'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  PHOTO_LIMIT,
  photoExtensions,
  type GuestCollectionView,
} from './model';

export default function GuestCollection({ id }: { id: string }) {
  const endpoint = '/api/guest-collection/' + encodeURIComponent(id);
  const [view, setView] = useState<
    (GuestCollectionView & { hasBook: boolean }) | null
  >(null);
  const [name, setName] = useState(''),
    [message, setMessage] = useState('');
  const [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [count, setCount] = useState(10);
  const requestId = useRef(''),
    sending = useRef(false);
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const r = await fetch(endpoint, { cache: 'no-store', signal });
      if (r.ok) {
        const next = await r.json();
        if (!signal?.aborted) setView(next);
      }
    },
    [endpoint]
  );
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal).catch(() => {});
    return () => controller.abort();
  }, [refresh]);
  const closesAt = view?.closesAt ?? 0;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function syncDeadline() {
      const current = Date.now();
      setNow(current);
      if (current < closesAt)
        timer = setTimeout(
          syncDeadline,
          Math.min(closesAt - current, 2_000_000_000)
        );
    }
    syncDeadline();
    return () => clearTimeout(timer);
  }, [closesAt]);
  async function post(body: unknown) {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message ?? '다시 시도해 주세요.');
    return data;
  }
  async function submit(file?: File) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setNotice('');
    try {
      if (file) {
        if (
          !Object.hasOwn(photoExtensions, file.type) ||
          !file.size ||
          file.size > PHOTO_LIMIT
        )
          throw new Error(
            'JPG, PNG, WebP, HEIC 사진 한 장을 20MB 이하로 골라 주세요.'
          );
        const { uploadUrl } = await post({
          kind: 'photo',
          size: file.size,
          mimeType: file.type,
        });
        const r = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        });
        if (!r.ok)
          throw new Error('사진을 전송하지 못했어요. 다시 시도해 주세요.');
        setNotice('작성자의 비공개 사진함으로 보냈어요.');
      } else {
        requestId.current ||= crypto.randomUUID();
        await post({
          kind: 'message',
          requestId: requestId.current,
          name,
          message,
        });
        requestId.current = '';
        setMessage('');
        setNotice('축하 글을 남겼어요.');
        await refresh().catch(() => {});
      }
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : '전송하지 못했어요. 다시 시도해 주세요.'
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  if (!view || (!view.hasBook && !view.photos)) return null;
  const open = now < view.closesAt && !view.reconnect;
  const input =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm';
  return (
    <section className="space-y-5 px-6 py-8">
      {view.hasBook && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">방명록</h2>
          {view.readFailed ? (
            <button onClick={() => void refresh().catch(() => {})}>
              방명록 다시 불러오기
            </button>
          ) : view.entries.length ? (
            <ul className="divide-y divide-neutral-200">
              {view.entries.slice(0, count).map(([author, text, date], i) => (
                <li key={i} className="py-3">
                  <strong>{author}</strong>
                  <p className="whitespace-pre-wrap break-words">{text}</p>
                  <small>
                    {date &&
                      new Date(date).toLocaleDateString('ko-KR', {
                        timeZone: 'Asia/Seoul',
                      })}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">아직 등록된 축하 글이 없어요.</p>
          )}
          {view.entries.length > count && (
            <button onClick={() => setCount(count + 10)}>
              축하 글 더 보기
            </button>
          )}
          {open && view.guestbook && (
            <form
              className="space-y-2"
              onSubmit={e => {
                e.preventDefault();
                void submit();
              }}
            >
              <input
                aria-label="방명록 이름"
                className={input}
                placeholder="이름"
                required
                maxLength={40}
                value={name}
                disabled={busy}
                onChange={e => {
                  requestId.current = '';
                  setName(e.target.value);
                }}
              />
              <textarea
                aria-label="축하 메시지"
                className={input}
                placeholder="축하 메시지"
                required
                maxLength={500}
                value={message}
                disabled={busy}
                onChange={e => {
                  requestId.current = '';
                  setMessage(e.target.value);
                }}
              />
              <p className="text-xs">
                이름과 글은 이 방명록을 읽는 분들에게 공개돼요.
              </p>
              <button
                disabled={busy}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-white"
              >
                축하 글 남기기
              </button>
            </form>
          )}
        </section>
      )}
      {open && view.photos && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">하객 사진 보내기</h2>
          <p className="text-sm">
            사진은 초대장 작성자만 볼 수 있어요. 한 장에 최대 20MB예요.
          </p>
          <label>
            사진 선택
            <input
              type="file"
              className="block w-full text-sm"
              accept={Object.keys(photoExtensions).join(',')}
              disabled={busy}
              onChange={e => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) void submit(file);
              }}
            />
          </label>
        </section>
      )}
      {!open && (
        <p className="text-sm">
          {view.reconnect
            ? '작성자의 Google 재연결을 기다리고 있어요.'
            : '하객 접수가 마감됐어요.'}
        </p>
      )}
      <p role="status" className="text-sm">
        {busy ? '전송 중이에요.' : notice}
      </p>
    </section>
  );
}
