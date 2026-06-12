'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { TemplateItem } from '@/app/api/template/types';
import { getTemplateManifest } from '@/app/api/template/utils';
import { Image } from '@/components/atoms/image';
import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { useToast } from '@/shared/hooks/useToast';
import { cn } from '@/shared/utils/cn';
import {
  useFabricActionsContext,
  useFabricViewContext,
} from '@/widgets/mainPoster/context/FabricContext';
import { prepareTemplateAssets } from '@/widgets/mainPoster/hooks/useTemplate';

interface PosterPanelViewProps {
  templates: TemplateItem[];
  readyTemplateIds: Set<string>;
  onSelectTemplate: (template: TemplateItem) => void;
}

const PosterPanelView = memo(function PosterPanelView({
  templates,
  readyTemplateIds,
  onSelectTemplate,
}: PosterPanelViewProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-wrap content-start gap-3.5 overflow-y-auto scrollbar-hide">
      {templates.map(template => {
        const isReady = readyTemplateIds.has(template.id);

        return (
          <button
            type="button"
            key={template.id}
            disabled={!isReady}
            className={cn(
              'group relative aspect-[1/2] h-80 w-40 overflow-hidden rounded-lg border border-text-primary/5 bg-[#FAFAFB] text-left',
              isReady
                ? 'transition-shadow hover:shadow-md'
                : 'cursor-progress opacity-80'
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <Image
              src={template.thumbnailUrl}
              alt={template.name}
              fill
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {template.name}
            </div>

            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white">
                <LoadingSpinner className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">준비 중...</span>
              </div>
            )}
          </button>
        );
      })}

      <div className="sticky bottom-0 left-0 right-0 flex h-13 w-full items-end justify-center bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%"></div>
    </div>
  );
});

function PosterPanel() {
  const { canvas } = useFabricViewContext();
  const { applyTemplateToCanvas } = useFabricActionsContext();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [readyTemplateIds, setReadyTemplateIds] = useState<Set<string>>(
    () => new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: errorToast } = useToast();
  const canvasRef = useRef(canvas);
  const applyTemplateRef = useRef(applyTemplateToCanvas);
  const errorToastRef = useRef(errorToast);

  useEffect(() => {
    canvasRef.current = canvas;
    applyTemplateRef.current = applyTemplateToCanvas;
    errorToastRef.current = errorToast;
  }, [applyTemplateToCanvas, canvas, errorToast]);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        setIsLoading(true);
        const data = await getTemplateManifest();
        setTemplates(data.templates);
        setReadyTemplateIds(new Set());
      } catch (err) {
        errorToastRef.current('템플릿 목록 로드에 실패했습니다.');
        console.error('템플릿 목록 로드 실패:', err);
        setError('템플릿 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifest();
  }, []);

  useEffect(() => {
    let cancelled = false;

    templates.forEach(template => {
      void prepareTemplateAssets(template.jsonUrl)
        .then(() => {
          if (cancelled) return;

          setReadyTemplateIds(prev => {
            if (prev.has(template.id)) return prev;

            const next = new Set(prev);
            next.add(template.id);
            return next;
          });
        })
        .catch(error => {
          console.error(`템플릿 준비 실패: ${template.id}`, error);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [templates]);

  const handleSelectTemplate = useCallback(
    async (template: TemplateItem) => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas || !readyTemplateIds.has(template.id)) return;

      try {
        await applyTemplateRef.current(currentCanvas, template.jsonUrl);
      } catch (err) {
        errorToastRef.current('템플릿 적용 중 오류가 발생했습니다.');
        console.error('템플릿 적용 중 오류가 발생했습니다.', err);
      }
    },
    [readyTemplateIds]
  );

  if (isLoading) {
    return <div className="flex-1 flex-center">템플릿 로딩 중...</div>;
  }

  if (error) {
    return <div className="flex-1 flex-center text-status-error">{error}</div>;
  }

  return (
    <PosterPanelView
      templates={templates}
      readyTemplateIds={readyTemplateIds}
      onSelectTemplate={handleSelectTemplate}
    />
  );
}

export default PosterPanel;
