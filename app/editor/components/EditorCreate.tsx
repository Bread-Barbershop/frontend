'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  parseGuestPayload,
  type NormalizedGuestPayload,
} from '@/app/guest/[id]/validation/parseGuestPayload';
import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import type { BgmData } from '@/shared/types/invitationSave';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import MainContentsArea from './MainContentsArea';

import type { SavedData } from '../[id]/types/savedata';

type SampleManifestItem = {
  id: string;
  dataUrl: string;
  posterTemplateId?: string;
};

type SamplesManifest = {
  samples: SampleManifestItem[];
};

type TemplateManifest = {
  templates: Array<{
    id: string;
    jsonUrl: string;
  }>;
};

const SAMPLES_MANIFEST_URL = '/samples/manifest.json';
const TEMPLATES_MANIFEST_URL = '/templates/manifest.json';
const BUNDLED_SAMPLE_ASSET_PREFIX = '/samples/';

function isBundledSampleAsset(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith(BUNDLED_SAMPLE_ASSET_PREFIX)
  );
}

function stripBundledSampleAssets<T>(value: T): T {
  if (isBundledSampleAsset(value)) {
    return '' as T;
  }

  if (Array.isArray(value)) {
    return value
      .filter(item => !isBundledSampleAsset(item))
      .map(stripBundledSampleAssets) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        stripBundledSampleAssets(child),
      ])
    ) as T;
  }

  return value;
}

function sanitizeSampleBgm(bgm: BgmData): BgmData {
  if (
    bgm.selectedBgmId !== 'user-bgm' &&
    !isBundledSampleAsset(bgm.userBgmFileId)
  ) {
    return bgm;
  }

  return {
    ...bgm,
    selectedBgmId: null,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  };
}

function toSavedData(
  payload: NormalizedGuestPayload,
  mainPoster: unknown
): SavedData {
  return {
    bulkData: payload.bulkData,
    blocks: stripBundledSampleAssets(payload.blocks) as SavedData['blocks'],
    mainPoster: JSON.stringify(mainPoster),
    bgm: {
      bgmInfo: sanitizeSampleBgm(payload.bgm),
      bgmFile: null,
    },
    shareUrl: {
      ...createDefaultShareUrlState(),
      ...stripBundledSampleAssets(payload.shareUrl ?? {}),
    },
    imageFolderId: '',
    audioFolderId: '',
    invitationImage: [],
  };
}

async function loadPosterTemplateJson(templateId: string) {
  const manifestResponse = await fetch(TEMPLATES_MANIFEST_URL);
  if (!manifestResponse.ok) {
    throw new Error(`template_manifest_failed:${manifestResponse.status}`);
  }

  const manifest = (await manifestResponse.json()) as TemplateManifest;
  const template = manifest.templates.find(item => item.id === templateId);
  if (!template) {
    throw new Error(`poster_template_not_found:${templateId}`);
  }

  const templateResponse = await fetch(template.jsonUrl);
  if (!templateResponse.ok) {
    throw new Error(`poster_template_failed:${templateResponse.status}`);
  }

  return templateResponse.json();
}

function EditorCreate() {
  const sampleId = useSearchParams().get('sample');
  const [savedData, setSavedData] = useState<SavedData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sampleId));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSample() {
      if (!sampleId) {
        setIsLoading(false);
        setLoadError(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(false);
        const manifestResponse = await fetch(SAMPLES_MANIFEST_URL);
        if (!manifestResponse.ok) {
          throw new Error(`sample_manifest_failed:${manifestResponse.status}`);
        }

        const manifest = (await manifestResponse.json()) as SamplesManifest;
        const sample = manifest.samples.find(item => item.id === sampleId);
        if (!sample) {
          throw new Error(`sample_not_found:${sampleId}`);
        }

        const sampleResponse = await fetch(sample.dataUrl);
        if (!sampleResponse.ok) {
          throw new Error(`sample_data_failed:${sampleResponse.status}`);
        }

        const result = parseGuestPayload(await sampleResponse.json());
        if (!result.ok) {
          throw new Error(`sample_parse_failed:${result.reason}`);
        }

        const posterTemplateJson = await loadPosterTemplateJson(
          sample.posterTemplateId ?? sample.id
        );

        if (!cancelled) {
          setSavedData(toSavedData(result.payload, posterTemplateJson));
        }
      } catch (error) {
        console.error('샘플 에디터 로드 실패:', error);
        if (!cancelled) {
          setSavedData(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSample();

    return () => {
      cancelled = true;
    };
  }, [sampleId]);

  if (isLoading) {
    return <EditorCreateLoading />;
  }

  if (sampleId && loadError) {
    return <EditorCreateError />;
  }

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
      <div className="w-full h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-x-auto overflow-y-hidden">
        <MainContentsArea savedData={savedData} />
      </div>
    </FabricProvider>
  );
}

function EditorCreateError() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#E7E9EB]">
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-edit">
        <h1 className="text-2xl font-bold text-text-plain">
          샘플을 불러오지 못했습니다.
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          갤러리로 돌아가 다른 디자인을 선택해 주세요.
        </p>
        <Link
          href="/gallery"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-black px-5 font-semibold text-white"
        >
          갤러리로 돌아가기
        </Link>
      </div>
    </div>
  );
}

function EditorCreateLoading() {
  return (
    <div className="w-full h-full flex justify-center items-center bg-[#E7E9EB]">
      <div className="flex flex-col items-center gap-4 text-text-primary">
        <LoadingSpinner className="w-20 h-20 animate-spin" />
        <p className="text-sm">에디터를 준비하는 중...</p>
      </div>
    </div>
  );
}

export default EditorCreate;
