import * as fabric from 'fabric';
import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useFabric } from '@/widgets/mainPoster/hooks/useFabric';

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function TextBackground({ canvas, applyRichStyle }: Props) {
  const [patternUrl, setPatternUrl] = useState<string>();
  const { setPatternOffset } = useFabric();
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvas) return;

    const syncOffsets = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.fill instanceof fabric.Pattern) {
        setOffsets({
          x: activeObject.fill.offsetX || 0,
          y: activeObject.fill.offsetY || 0,
        });
      } else {
        setOffsets({ x: 0, y: 0 });
      }
    };

    canvas.on('selection:created', syncOffsets);
    canvas.on('selection:updated', syncOffsets);
    canvas.on('selection:cleared', () => setOffsets({ x: 0, y: 0 }));

    syncOffsets();

    return () => {
      canvas.off('selection:created', syncOffsets);
      canvas.off('selection:updated', syncOffsets);
      canvas.off('selection:cleared', syncOffsets);
    };
  }, [canvas]);

  const handleOffsetChange = (axis: 'x' | 'y', value: number) => {
    if (!canvas) return;
    const newOffsets = { ...offsets, [axis]: value };
    setOffsets(newOffsets);
    setPatternOffset(canvas, newOffsets.x, newOffsets.y);
  };

  const applyPattern = async (url: string) => {
    if (!canvas) return;
    try {
      const img = await fabric.util.loadImage(url);

      const pattern = new fabric.Pattern({
        source: img,
        repeat: 'repeat',
      });

      applyRichStyle({ fill: pattern }, canvas);
    } catch (err) {
      console.error('패턴 이미지 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    if (patternUrl) {
      applyPattern(patternUrl);
    }
  }, [patternUrl]);

  const handlePatternChange = (url: string) => {
    setPatternUrl(url);
  };
  return (
    <div className="relative flex flex-col gap-4 p-4 bg-bg-secondary rounded-md">
      <div className="flex items-center gap-2">
        <label htmlFor="pattern-upload" className="group cursor-pointer">
          <div className="w-10 h-10 flex justify-center items-center bg-bg-base text-text-primary group-hover:bg-btn-hover group-active:bg-btn-pressed rounded-md border border-border-base transition-colors">
            <Image size={20} className="text-text-primary" />
          </div>
          <input
            id="pattern-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                handlePatternChange(url);
              }
            }}
          />
        </label>
      </div>

      <div className=" flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>가로</span>
            <span>{offsets.x}px</span>
          </div>
          <input
            type="range"
            min="-500"
            max="500"
            value={offsets.x}
            onChange={e => handleOffsetChange('x', parseInt(e.target.value))}
            className="w-full h-1.5 bg-bg-base rounded-lg appearance-none cursor-pointer accent-btn-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>세로</span>
            <span>{offsets.y}px</span>
          </div>
          <input
            type="range"
            min="-500"
            max="500"
            value={offsets.y}
            onChange={e => handleOffsetChange('y', parseInt(e.target.value))}
            className="w-full h-1.5 bg-bg-base rounded-lg appearance-none cursor-pointer accent-btn-primary"
          />
        </div>
      </div>
    </div>
  );
}
export default TextBackground;
