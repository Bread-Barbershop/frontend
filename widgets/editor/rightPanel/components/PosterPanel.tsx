'use client';

import React, { useEffect, useState } from 'react';

import { TemplateItem } from '@/app/api/template/types';
import { getTemplateManifest } from '@/app/api/template/utils';
import { Image } from '@/components/atoms/image';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

function PosterPanel() {
  const { canvas, applyTemplateToCanvas, saveHistory } = useFabricContext();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        setIsLoading(true);
        const data = await getTemplateManifest();
        setTemplates(data.templates);
      } catch (err) {
        console.error('템플릿 목록 로드 실패:', err);
        setError('템플릿 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifest();
  }, []);

  const handleSelectTemplate = async (template: TemplateItem) => {
    try {
      await applyTemplateToCanvas(canvas, template.jsonUrl);
      saveHistory();
    } catch (err) {
      console.error('템플릿을 적용하는 중 오류가 발생했습니다.', err);
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex-center">템플릿 로딩 중...</div>;
  }

  if (error) {
    return <div className="flex-1 flex-center text-status-error">{error}</div>;
  }

  return (
    <div className="min-h-0 flex-1 flex flex-wrap gap-3.5 content-start w-full overflow-y-auto scrollbar-hide relative">
      {templates.map(template => (
        <button
          type="button"
          key={template.id}
          className="aspect-[1/2] relative w-40 h-80 rounded-lg border border-text-primary/5 bg-[#FAFAFB] overflow-hidden group"
          onClick={() => handleSelectTemplate(template)}
        >
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {template.name}
          </div>
        </button>
      ))}

      <div className="flex justify-center w-full h-13 items-end sticky bottom-0 left-0 right-0 bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%"></div>
    </div>
  );
}

export default PosterPanel;
