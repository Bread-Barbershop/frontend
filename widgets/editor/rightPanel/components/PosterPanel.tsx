'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  TEMPLATE_CATEGORIES,
  TemplateCategory,
  TemplateItem,
} from '@/app/api/template/types';
import { getTemplateManifest } from '@/app/api/template/utils';
import { useToast } from '@/shared/hooks/useToast';
import {
  useFabricActionsContext,
  useFabricViewContext,
} from '@/widgets/mainPoster/context/FabricContext';
import { prepareTemplateAssets } from '@/widgets/mainPoster/hooks/useTemplate';

import { PosterPanelView } from './PosterPanelView';

export const PosterPanel = () => {
  const { canvas } = useFabricViewContext();
  const { applyTemplateToCanvas } = useFabricActionsContext();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [readyTemplateIds, setReadyTemplateIds] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory>('all');
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

  const fetchTemplates = async () => {
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchTemplateAssets = () => {
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
    };
    fetchTemplateAssets();

    return () => {
      cancelled = true;
    };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return templates;

    return templates.filter(template => template.category === selectedCategory);
  }, [templates, selectedCategory]);

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
    <section className="w-93.75 h-full flex justify-center px-5 gap-2 flex-col">
      <div className="w-full flex justify-between bg-white rounded-lg">
        {Object.entries(TEMPLATE_CATEGORIES).map(([eng, kor]) => (
          <button
            key={eng}
            type="button"
            className={`w-[61px] h-11 font-semibold ${selectedCategory === eng ? 'border-b text-text-primary' : 'text-text-tertiary'}`}
            onPointerDown={() => setSelectedCategory(eng as TemplateCategory)}
          >
            <p>{kor}</p>
          </button>
        ))}
      </div>
      <PosterPanelView
        templates={filteredTemplates}
        readyTemplateIds={readyTemplateIds}
        onSelectTemplate={handleSelectTemplate}
      />
    </section>
  );
};
