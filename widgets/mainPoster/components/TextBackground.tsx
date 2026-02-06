import * as fabric from 'fabric';
import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}

function TextBackground({ canvas, applyRichStyle }: Props) {
  const [patternUrl, setPatternUrl] = useState<string>();

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
      console.error('Failed to load pattern image:', err);
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
    <label htmlFor="pattern-upload" className="cursor-pointer group">
      <div className="flex items-center justify-center p-2 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors">
        <Image size={18} className="text-text-primary" />
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
  );
}
export default TextBackground;
