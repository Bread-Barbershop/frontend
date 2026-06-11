'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { blockRegistry } from '@/shared/data/registry/registry';
import { preloadFontFamilyWeights } from '@/shared/fonts/fontLoader';
import {
  getFontFamilies,
  resolveFontFamily,
} from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import type { BulkJson, GuestBlock } from '../types/guestTypes';

const FONT_FAMILY_SET = new Set(getFontFamilies().map(font => font.family));

function extractFontFamiliesFromString(value: string) {
  const families = new Set<string>();
  const normalizedValue = value.replace(/&quot;/g, '"');

  const fontFamilyRegex = /font-family\s*:\s*([^;"'}]+)/gi;

  for (const match of normalizedValue.matchAll(fontFamilyRegex)) {
    const rawFamilies = match[1]?.split(',') ?? [];

    rawFamilies.forEach(rawFamily => {
      const normalizedFamily = resolveFontFamily(
        rawFamily.trim().replace(/^['"]|['"]$/g, '')
      );

      if (FONT_FAMILY_SET.has(normalizedFamily)) {
        families.add(normalizedFamily);
      }
    });
  }

  FONT_FAMILY_SET.forEach(fontFamily => {
    if (normalizedValue.includes(fontFamily)) {
      families.add(fontFamily);
    }
  });

  return families;
}

function collectGuestFontFamilies(
  value: unknown,
  families = new Set<string>()
) {
  if (typeof value === 'string') {
    extractFontFamiliesFromString(value).forEach(fontFamily => {
      families.add(fontFamily);
    });

    const resolvedFamily = resolveFontFamily(value);
    if (FONT_FAMILY_SET.has(resolvedFamily)) {
      families.add(resolvedFamily);
    }

    return families;
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      collectGuestFontFamilies(item, families);
    });

    return families;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => {
      collectGuestFontFamilies(item, families);
    });
  }

  return families;
}

function GuestRenderer({
  blocks,
  bulkData,
}: {
  blocks: GuestBlock[];
  bulkData: BulkJson;
}) {
  const { titleData, bodyData } = bulkData;
  const { setTitleData, setBodyData } = useEditorStore(
    useShallow(state => ({
      setTitleData: state.setTitleData,
      setBodyData: state.setBodyData,
    }))
  );
  const [fontsReady, setFontsReady] = useState(false);
  const pathname = usePathname();
  const fontFamiliesToPreload = useMemo(() => {
    const families = collectGuestFontFamilies({
      blocks,
      titleData,
      bodyData,
    });

    families.add(resolveFontFamily(titleData.font));
    families.add(resolveFontFamily(bodyData.font));

    return Array.from(families);
  }, [blocks, bodyData, titleData]);

  useEffect(() => {
    setTitleData(titleData);
    setBodyData(bodyData);
  }, [setTitleData, setBodyData, titleData, bodyData]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      setFontsReady(false);

      await Promise.allSettled(
        fontFamiliesToPreload.map(fontFamily =>
          preloadFontFamilyWeights(fontFamily)
        )
      );

      if (mounted) {
        setFontsReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fontFamiliesToPreload]);

  useEffect(() => {
    if (bulkData.isZoom) {
      document.addEventListener(
        'gesturestart',
        e => {
          e.preventDefault();
        },
        { passive: false }
      );

      document.addEventListener(
        'gesturechange',
        e => {
          e.preventDefault();
        },
        { passive: false }
      );

      document.addEventListener(
        'gestureend',
        e => {
          e.preventDefault();
        },
        { passive: false }
      );
    }
  }, [bulkData.isZoom]);
  return (
    <div
      className="flex flex-col transition-opacity duration-150"
      style={{
        opacity: fontsReady ? 1 : 0,
      }}
    >
      {blocks.map(block => {
        const registryItem =
          blockRegistry[block.component as keyof typeof blockRegistry];

        if (!registryItem || !registryItem.viewComponent) return null;

        const View = registryItem.viewComponent as React.ComponentType<{
          blockInfo: GuestBlock;
          className?: string;
          isGuestPage?: boolean;
        }>;

        return (
          <div key={block.id} className="w-full">
            <View
              blockInfo={block}
              className=""
              isGuestPage={pathname.startsWith('/guest')}
            />
          </div>
        );
      })}
    </div>
  );
}

export default GuestRenderer;
