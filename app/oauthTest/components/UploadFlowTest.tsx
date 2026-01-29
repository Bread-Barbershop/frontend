'use client';

import { useMemo, useState } from 'react';

import { saveInvitationFlow } from '@/app/oauthTest/utils/saveInvitationFlow';

type UploadResult = Awaited<ReturnType<typeof saveInvitationFlow>>;
type BatchResult = UploadResult['results']['images'];

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function UploadFlowTest() {
  const [images, setImages] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [dataJson, setDataJson] = useState<string>('{}');
  const [invitationUuid, setInvitationUuid] = useState<string>('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const imagesBytes = useMemo(
    () => images.reduce((sum, file) => sum + file.size, 0),
    [images]
  );

  const renderBatch = (label: string, batch: BatchResult) => {
    return (
      <div className="rounded-md border bg-neutral-50 p-3 text-xs text-neutral-800">
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-neutral-600">
          ok: {batch.ok.length}, fail: {batch.fail.length}
        </p>
        {batch.fail.length > 0 && (
          <ul className="mt-2 space-y-1 text-red-600">
            {batch.fail.map((item, index) => {
              const message =
                item.error instanceof Error
                  ? item.error.message
                  : JSON.stringify(item.error);
              return (
                <li key={`${item.file.name}-${index}`}>
                  {item.file.name} - {message}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const handleRun = async () => {
    setError(null);
    setResult(null);

    let data: object;
    try {
      data = dataJson.trim() ? JSON.parse(dataJson) : {};
    } catch {
      setError('Invalid JSON in data.json input.');
      return;
    }

    setBusy(true);
    try {
      const flowResult = await saveInvitationFlow({
        images,
        audio,
        data,
        invitationUuid: invitationUuid.trim() || undefined,
      });
      setResult(flowResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload flow failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border p-6">
      <h2 className="text-lg font-semibold">Upload Flow Test</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Select files and run the current upload flow. This page does not apply
        backoff or concurrency limits yet.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-medium">Images (max 30)</label>
          <input
            className="mt-2 block w-full text-sm"
            type="file"
            multiple
            accept="image/*"
            onChange={(event) =>
              setImages(Array.from(event.target.files ?? []))
            }
          />
          <p className="mt-1 text-xs text-neutral-500">
            Selected: {images.length} files, {formatBytes(imagesBytes)} total
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Audio (optional)</label>
          <input
            className="mt-2 block w-full text-sm"
            type="file"
            accept="audio/*"
            onChange={(event) =>
              setAudio(event.target.files?.[0] ?? null)
            }
          />
          <p className="mt-1 text-xs text-neutral-500">
            {audio ? `${audio.name} (${formatBytes(audio.size)})` : 'No audio selected'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">data.json (JSON)</label>
          <textarea
            className="mt-2 min-h-[140px] w-full rounded-md border p-2 text-sm"
            value={dataJson}
            onChange={(event) => setDataJson(event.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Invitation UUID (optional)</label>
          <input
            className="mt-2 block w-full rounded-md border px-3 py-2 text-sm"
            type="text"
            value={invitationUuid}
            onChange={(event) => setInvitationUuid(event.target.value)}
            placeholder="leave blank for new invitation"
          />
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={busy}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Running upload flow...' : 'Run upload flow'}
        </button>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">
                success: {String(result.success)}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                invitationUuid: {result.invitationUuid}
              </p>
              <div className="mt-2 text-xs text-neutral-600">
                <p>workspaceFolderId: {result.folders.workspaceFolderId}</p>
                <p>invitationFolderId: {result.folders.invitationFolderId}</p>
                <p>imageFolderId: {result.folders.imageFolderId}</p>
                <p>audioFolderId: {result.folders.audioFolderId}</p>
                <p>refreshedToken: {String(result.debug.refreshedToken)}</p>
              </div>
            </div>

            {renderBatch('Images', result.results.images)}
            {renderBatch('Audio', result.results.audio)}
            {renderBatch('Data', result.results.data)}
          </div>
        )}
      </div>
    </section>
  );
}
