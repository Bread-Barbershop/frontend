import { TPointerEvent, TPointerEventInfo } from 'fabric';
import { useEffect, useRef, useState } from 'react';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import ControlZindex from './ControlZindex';
import CopyAndPaste from './CopyAndPaste';

export function ContextMenu() {
  const { canvas, handleDeleteShape } = useFabricContext();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvas) return;
    const el = canvas.upperCanvasEl;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    el.addEventListener('contextmenu', onContextMenu);

    const onMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      const e = opt.e as MouseEvent;
      // 우클릭만
      if (e.button !== 2) return;

      e.preventDefault();

      setPos({ x: e.clientX, y: e.clientY });
      setOpen(true);
    };

    canvas.on('mouse:down', onMouseDown);

    return () => {
      el.removeEventListener('contextmenu', onContextMenu);
      canvas.off('mouse:down', onMouseDown);
    };
  }, [canvas]);
  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;

    const onDocDown = (e: MouseEvent) => {
      if (e.button === 2) return; //우클릭은 닫기 트리거에서 제외

      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', onDocDown, true);
    return () => document.removeEventListener('mousedown', onDocDown, true);
  }, [open]);

  if (!open) return null;
  return (
    <div
      ref={menuRef}
      className="fixed z-9999 flex flex-col gap-3 p-3 bg-white border border-gray-200 rounded-md shadow-lg"
      style={{ top: pos.y, left: pos.x }}
      // onMouseDown={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
    >
      <CopyAndPaste onClick={() => setOpen(false)} />
      <ControlZindex onClick={() => setOpen(false)} />
      <button
        type="button"
        className="hover:bg-gray-100 active:bg-gray-200"
        onClick={() => {
          if (canvas) {
            handleDeleteShape(canvas, undefined, true);
          }
          setOpen(false);
        }}
      >
        삭제하기
      </button>
    </div>
  );
}
