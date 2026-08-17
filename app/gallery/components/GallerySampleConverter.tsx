'use client';

import { useMemo, useState } from 'react';

import type { ReactNode } from 'react';

type AssetSlot = {
  id: string;
  label: string;
  path: Array<string | number>;
  currentValue: string;
};

type FileMap = Record<string, File | null>;
type ZipEntry = {
  path: string;
  data: Uint8Array;
};

const IMAGE_KEY_PATTERN = /image|images|photo|thumbnail|poster/i;
const AUDIO_KEY_PATTERN = /audio|bgm|music|sound/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pathToLabel(path: Array<string | number>) {
  return path
    .map(part => (typeof part === 'number' ? `[${part}]` : part))
    .join('.');
}

function fileExtension(file: File, fallback: string) {
  const dotIndex = file.name.lastIndexOf('.');
  if (dotIndex >= 0) return file.name.slice(dotIndex).toLowerCase();
  return fallback;
}

function safeFileName(file: File, index: number, fallback: string) {
  const dotIndex = file.name.lastIndexOf('.');
  const rawBase = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
  const base =
    rawBase
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}-]+/gu, '_')
      .replace(/^_+|_+$/g, '') || fallback;

  return `${String(index + 1).padStart(2, '0')}_${base}${fileExtension(file, '.png')}`;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripLeadingSlash(path: string) {
  return path.replace(/^\/+/, '');
}

function createCrc32Table() {
  return Array.from({ length: 256 }, (_, index) => {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    return crc >>> 0;
  });
}

const CRC32_TABLE = createCrc32Table();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  data.forEach(byte => {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function concatBytes(parts: Uint8Array[]) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(size);
  let offset = 0;

  parts.forEach(part => {
    result.set(part, offset);
    offset += part.length;
  });

  return result;
}

function buildZip(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  entries.forEach(entry => {
    const name = encoder.encode(entry.path);
    const checksum = crc32(entry.data);
    const localHeader = new Uint8Array(30 + name.length);

    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0x0800);
    writeUint16(localHeader, 8, 0);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, entry.data.length);
    writeUint32(localHeader, 22, entry.data.length);
    writeUint16(localHeader, 26, name.length);
    localHeader.set(name, 30);

    const centralHeader = new Uint8Array(46 + name.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0x0800);
    writeUint16(centralHeader, 10, 0);
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, entry.data.length);
    writeUint32(centralHeader, 24, entry.data.length);
    writeUint16(centralHeader, 28, name.length);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(name, 46);

    localParts.push(localHeader, entry.data);
    centralParts.push(centralHeader);
    offset += localHeader.length + entry.data.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const end = new Uint8Array(22);

  writeUint32(end, 0, 0x06054b50);
  writeUint16(end, 8, entries.length);
  writeUint16(end, 10, entries.length);
  writeUint32(end, 12, centralDirectory.length);
  writeUint32(end, 16, offset);

  const zipBytes = concatBytes([...localParts, centralDirectory, end]);
  const zipBuffer = zipBytes.buffer.slice(
    zipBytes.byteOffset,
    zipBytes.byteOffset + zipBytes.byteLength
  ) as ArrayBuffer;

  return new Blob([zipBuffer], {
    type: 'application/zip',
  });
}

function setValueAtPath(
  target: unknown,
  path: Array<string | number>,
  value: unknown
) {
  let cursor = target as Record<string, unknown> | unknown[];

  for (let index = 0; index < path.length - 1; index += 1) {
    cursor = (cursor as Record<string, unknown> | unknown[])[
      path[index] as never
    ] as Record<string, unknown> | unknown[];
  }

  (cursor as Record<string, unknown> | unknown[])[
    path[path.length - 1] as never
  ] = value as never;
}

function collectSlots(input: unknown, pattern: RegExp, skipPoster = false) {
  const slots: AssetSlot[] = [];

  function visit(value: unknown, path: Array<string | number>, key = '') {
    if (skipPoster && (path[0] === 'mainPoster' || path[0] === 'renderHints')) {
      return;
    }

    if (typeof value === 'string') {
      if (pattern.test(key) && value.trim()) {
        slots.push({
          id: pathToLabel(path),
          label: pathToLabel(path),
          path,
          currentValue: value,
        });
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, index], key));
      return;
    }

    if (!isRecord(value)) return;

    Object.entries(value).forEach(([childKey, child]) => {
      visit(child, [...path, childKey], childKey);
    });
  }

  visit(input, []);
  return slots;
}

function GallerySampleConverter() {
  const [sampleId, setSampleId] = useState('seminar_01');
  const [title, setTitle] = useState('2026 Annual Business Conference');
  const [category, setCategory] = useState('seminar');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [sourceJson, setSourceJson] = useState<unknown>(null);
  const [imageFiles, setImageFiles] = useState<FileMap>({});
  const [audioFiles, setAudioFiles] = useState<FileMap>({});
  const [jsonError, setJsonError] = useState('');

  const imageSlots = useMemo(
    () => collectSlots(sourceJson, IMAGE_KEY_PATTERN, true),
    [sourceJson]
  );
  const audioSlots = useMemo(
    () => collectSlots(sourceJson, AUDIO_KEY_PATTERN),
    [sourceJson]
  );

  const output = useMemo(() => {
    if (!sampleId || !sourceJson || !posterFile) return null;

    const nextJson = cloneJson(sourceJson);
    const copiedImages: Array<{ from: string; to: string }> = [];
    const copiedAudios: Array<{ from: string; to: string }> = [];
    const posterTarget = `/samples/${sampleId}/poster${fileExtension(posterFile, '.png')}`;

    if (isRecord(nextJson)) {
      delete nextJson.renderHints;
    }

    imageSlots.forEach((slot, index) => {
      const file = imageFiles[slot.id];
      if (!file) return;

      const targetPath = `/samples/${sampleId}/images/${safeFileName(file, index, 'image')}`;
      setValueAtPath(nextJson, slot.path, targetPath);
      copiedImages.push({ from: file.name, to: targetPath });
    });

    audioSlots.forEach((slot, index) => {
      const file = audioFiles[slot.id];
      if (!file) return;

      const targetPath = `/samples/${sampleId}/audios/${safeFileName(file, index, 'audio')}`;
      setValueAtPath(nextJson, slot.path, targetPath);
      copiedAudios.push({ from: file.name, to: targetPath });
    });

    if (isRecord(nextJson) && isRecord(nextJson.mainPoster)) {
      nextJson.mainPoster.thumbnailFileId = posterTarget;
    }

    const manifestItem = {
      id: sampleId,
      title,
      category,
      thumbnailUrl: posterTarget,
      dataUrl: `/samples/${sampleId}/data.json`,
    };

    return {
      dataJson: JSON.stringify(nextJson, null, 2),
      copiedImages,
      copiedAudios,
      manifestItem: JSON.stringify(manifestItem, null, 2),
      posterTarget,
    };
  }, [
    audioFiles,
    audioSlots,
    category,
    imageFiles,
    imageSlots,
    posterFile,
    sampleId,
    sourceJson,
    title,
  ]);

  const readJsonFile = async (file: File | undefined) => {
    if (!file) return;

    try {
      setSourceJson(JSON.parse(await file.text()));
      setImageFiles({});
      setAudioFiles({});
      setJsonError('');
    } catch {
      setSourceJson(null);
      setJsonError('JSON 파일을 읽을 수 없습니다.');
    }
  };

  const downloadDataJson = () => {
    if (!output) return;

    const blob = new Blob([output.dataJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleZip = async () => {
    if (!output || !posterFile) return;

    const encoder = new TextEncoder();
    const entries: ZipEntry[] = [
      {
        path: `samples/${sampleId}/data.json`,
        data: encoder.encode(output.dataJson),
      },
      {
        path: stripLeadingSlash(output.posterTarget),
        data: new Uint8Array(await posterFile.arrayBuffer()),
      },
    ];

    await Promise.all(
      [
        ...imageSlots.map((slot, index) => {
          const file = imageFiles[slot.id];
          return {
            file,
            target: file
              ? `/samples/${sampleId}/images/${safeFileName(file, index, 'image')}`
              : '',
          };
        }),
        ...audioSlots.map((slot, index) => {
          const file = audioFiles[slot.id];
          return {
            file,
            target: file
              ? `/samples/${sampleId}/audios/${safeFileName(file, index, 'audio')}`
              : '',
          };
        }),
      ].map(async item => {
        if (!item.file || !item.target) return;

        entries.push({
          path: stripLeadingSlash(item.target),
          data: new Uint8Array(await item.file.arrayBuffer()),
        });
      })
    );

    const url = URL.createObjectURL(buildZip(entries));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sampleId}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto w-full max-w-[1400px] rounded-4xl bg-white/80 p-8 shadow-edit backdrop-blur-md">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Sample Converter
        </p>
        <h1 className="mt-2 text-[40px] font-black text-text-plain">
          갤러리 샘플 변환기
        </h1>
        <p className="mt-2 text-lg text-text-secondary">
          포스터, data.json, 이미지/오디오 파일을 수동 매핑해서 샘플 번들
          구조로 변환합니다.
        </p>
      </div>

      <div className="grid grid-cols-[360px_1fr] gap-8">
        <div className="flex flex-col gap-4">
          <Field label="Sample ID">
            <input
              className="h-11 rounded-lg border border-black/10 px-3"
              value={sampleId}
              onChange={event => setSampleId(event.target.value.trim())}
            />
          </Field>
          <Field label="Title">
            <input
              className="h-11 rounded-lg border border-black/10 px-3"
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </Field>
          <Field label="Category">
            <input
              className="h-11 rounded-lg border border-black/10 px-3"
              value={category}
              onChange={event => setCategory(event.target.value.trim())}
            />
          </Field>
          <FileField
            accept="image/*"
            label="포스터 이미지"
            onChange={file => setPosterFile(file ?? null)}
          />
          <FileField
            accept="application/json,.json"
            label="data.json"
            onChange={readJsonFile}
          />
          {jsonError && <p className="text-sm text-red-500">{jsonError}</p>}
        </div>

        <div className="min-w-0">
          <MappingSection
            accept="image/*"
            files={imageFiles}
            slots={imageSlots}
            title="이미지 매핑"
            onChange={(slotId, file) =>
              setImageFiles(prev => ({ ...prev, [slotId]: file }))
            }
          />

          <MappingSection
            accept="audio/*"
            files={audioFiles}
            slots={audioSlots}
            title="오디오 매핑"
            onChange={(slotId, file) =>
              setAudioFiles(prev => ({ ...prev, [slotId]: file }))
            }
          />

          {output && (
            <div className="mt-8 rounded-2xl bg-white p-5 shadow-edit">
              <h2 className="text-xl font-bold">변환 결과</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <ResultBox
                  title="복사 위치"
                  value={[
                    `${posterFile?.name ?? 'poster'} → ${output.posterTarget}`,
                    ...output.copiedImages.map(
                      item => `${item.from} → ${item.to}`
                    ),
                    ...output.copiedAudios.map(
                      item => `${item.from} → ${item.to}`
                    ),
                  ].join('\n')}
                />
                <ResultBox title="manifest 항목" value={output.manifestItem} />
              </div>
              <button
                type="button"
                className="mt-4 h-11 rounded-lg bg-black px-5 font-semibold text-white"
                onClick={downloadDataJson}
              >
                변환된 data.json 다운로드
              </button>
              <button
                type="button"
                className="ml-3 mt-4 h-11 rounded-lg bg-black px-5 font-semibold text-white"
                onClick={() => {
                  void downloadSampleZip();
                }}
              >
                샘플 ZIP 다운로드
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-text-plain">
      {label}
      {children}
    </label>
  );
}

function FileField({
  accept,
  label,
  onChange,
}: {
  accept: string;
  label: string;
  onChange: (file: File | undefined) => void | Promise<void>;
}) {
  return (
    <Field label={label}>
      <input
        accept={accept}
        className="rounded-lg border border-black/10 bg-white p-2"
        type="file"
        onChange={event => {
          void onChange(event.target.files?.[0]);
        }}
      />
    </Field>
  );
}

function MappingSection({
  accept,
  files,
  onChange,
  slots,
  title,
}: {
  accept: string;
  files: FileMap;
  onChange: (slotId: string, file: File | null) => void;
  slots: AssetSlot[];
  title: string;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-edit first:mt-0">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-text-secondary">{slots.length}개</span>
      </div>
      <div className="mt-4 flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-2">
        {slots.length === 0 ? (
          <p className="text-sm text-text-secondary">
            data.json을 올리면 매핑 슬롯이 표시됩니다.
          </p>
        ) : (
          slots.map(slot => (
            <div
              key={slot.id}
              className="grid grid-cols-[1fr_220px] gap-3 rounded-xl border border-black/10 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{slot.label}</p>
                <p className="mt-1 truncate text-xs text-text-secondary">
                  현재 값: {slot.currentValue}
                </p>
              </div>
              <input
                accept={accept}
                className="text-sm"
                type="file"
                onChange={event =>
                  onChange(slot.id, event.target.files?.[0] ?? null)
                }
              />
              {files[slot.id] && (
                <p className="col-span-2 text-xs text-text-secondary">
                  선택됨: {files[slot.id]?.name}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ResultBox({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <pre className="max-h-[220px] overflow-auto rounded-xl bg-[#F6F7F8] p-3 text-xs leading-relaxed">
        {value}
      </pre>
    </div>
  );
}

export default GallerySampleConverter;
