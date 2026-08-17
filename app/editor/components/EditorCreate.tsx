'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  parseGuestPayload,
  type NormalizedGuestPayload,
} from '@/app/guest/[id]/validation/parseGuestPayload';
import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import MainContentsArea from './MainContentsArea';

import type { SavedData } from '../[id]/types/savedata';

type SampleManifestItem = {
  id: string;
  dataUrl: string;
};

type SamplesManifest = {
  samples: SampleManifestItem[];
};

const SAMPLES_MANIFEST_URL = '/samples/manifest.json';
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

function toSavedData(payload: NormalizedGuestPayload): SavedData {
  return {
    bulkData: payload.bulkData,
    blocks: stripBundledSampleAssets(payload.blocks) as SavedData['blocks'],
    mainPoster: JSON.stringify(payload.mainPoster),
    bgm: {
      bgmInfo: payload.bgm,
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

function EditorCreate() {
  const sampleId = useSearchParams().get('sample');
  const [savedData, setSavedData] = useState<SavedData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sampleId));

  useEffect(() => {
    let cancelled = false;

    async function loadSample() {
      if (!sampleId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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

        if (!cancelled) {
          setSavedData(toSavedData(result.payload));
        }
      } catch (error) {
        console.error('샘플 에디터 로드 실패:', error);
        if (!cancelled) {
          setSavedData(null);
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

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
      <div className="w-full h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-x-auto overflow-y-hidden">
        <MainContentsArea savedData={savedData} />
      </div>
    </FabricProvider>
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
