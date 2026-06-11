import { TPointerEvent, TPointerEventInfo } from 'fabric';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import ControlZindex from './ControlZindex';
import CopyAndPaste from './CopyAndPaste';
import { DeleteObject } from './DeleteObject';
import { LockObject } from './LockObject';
import { RegisterSlot } from './RegisterSlot';
import { UndoRedo } from './UndoRedo';

export function ContextMenu() {
  const CONTEXT_MENU_MAX_HEIGHT = 400;
  const { canvas } = useFabricContext();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('type') === 'admin';
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

  const shouldOpenUpward =
    window.innerHeight - pos.y <= CONTEXT_MENU_MAX_HEIGHT;

  return (
    <div
      ref={menuRef}
      className="fixed z-9999 font-pretendard w-55 max-h-[360px] overflow-y-auto flex flex-col gap-3 p-3 bg-white border border-gray-200 rounded-md shadow-lg"
      style={
        shouldOpenUpward
          ? { bottom: window.innerHeight - pos.y, left: pos.x }
          : { top: pos.y, left: pos.x }
      }
      onContextMenu={e => e.preventDefault()}
    >
      {isAdmin && <RegisterSlot onClick={() => setOpen(false)} />}
      <CopyAndPaste onClick={() => setOpen(false)} />
      <ControlZindex onClick={() => setOpen(false)} />
      <UndoRedo onClick={() => setOpen(false)} />
      <DeleteObject onClick={() => setOpen(false)} />
      <LockObject onClick={() => setOpen(false)} />
    </div>
  );
}
