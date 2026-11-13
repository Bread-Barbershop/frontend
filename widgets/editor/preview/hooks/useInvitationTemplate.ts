import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createInvitationTemplate,
  INVITATION_TEMPLATES,
} from '@/shared/data/invitationTemplates';
import type { PreparedInvitationTemplate } from '@/shared/data/invitationTemplates';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useConfirmStore } from '@/shared/store/useConfirmStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import {
  preloadFonts,
  stabilizeCanvasAfterLoad,
} from '@/widgets/mainPoster/hooks/useTemplate';

const CANVAS_OBJECT_PROPERTIES = [
  'filters',
  'id',
  'name',
  'isLocked',
  'lockMovementX',
  'lockMovementY',
  'lockScalingX',
  'lockScalingY',
  'lockRotation',
  'hasControls',
  'editable',
  'selectable',
  'evented',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textAlign',
  'lineHeight',
  'charSpacing',
  'underline',
  'linethrough',
  'fill',
  'stroke',
  'strokeWidth',
  'strokeUniform',
  'shadow',
  'paintFirst',
  'slot',
  'imageBaseScale',
  'imageSliderX',
  'imageSliderY',
  'imageSliderScale',
  'slotBaseCropWidth',
  'slotBaseCropHeight',
  'slotZoomScale',
  'slotFrameWidth',
  'slotFrameHeight',
  'slotFrameLeft',
  'slotFrameTop',
  'slotFrameAngle',
  'slotImageBaseScale',
  'slotImageOffsetX',
  'slotImageOffsetY',
  'photoSlot',
  'templatePhotoSlot',
  'templatePhotoSlotLabel',
];

const isFileOrBlob = (value: unknown): boolean => {
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  return false;
};

const IMAGE_DATA_KEYS = new Set(['image', 'images']);

const collectBlockImageIds = (
  value: unknown,
  ids: Set<string>,
  seen = new WeakSet<object>()
) => {
  if (!value || typeof value !== 'object' || isFileOrBlob(value)) return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach(item => collectBlockImageIds(item, ids, seen));
    return;
  }

  const record = value as Record<string, unknown>;
  const hasImageData = Object.keys(record).some(key =>
    IMAGE_DATA_KEYS.has(key)
  );
  if (
    hasImageData &&
    typeof record.id === 'string' &&
    record.id &&
    record.id !== 'shareUrl'
  ) {
    ids.add(record.id);
  }

  Object.entries(record).forEach(([key, item]) => {
    if (/^imageIds?$/i.test(key)) {
      const imageIds = Array.isArray(item) ? item : [item];
      imageIds.forEach(imageId => {
        if (
          typeof imageId === 'string' &&
          imageId.trim() &&
          imageId !== 'shareUrl'
        ) {
          ids.add(imageId);
        }
      });
      return;
    }
    collectBlockImageIds(item, ids, seen);
  });
};

const cloneCanvasJson = (json: Record<string, unknown>) =>
  JSON.parse(JSON.stringify(json)) as Record<string, unknown>;

const waitForFontPreparation = async (template: PreparedInvitationTemplate) => {
  const posterObjects = Array.isArray(template.posterJson.objects)
    ? template.posterJson.objects
    : [];
  const fontProbeObjects = [
    {
      type: 'textbox',
      fontFamily: template.titleData.font,
      fontWeight: template.titleData.fontWeight,
    },
    {
      type: 'textbox',
      fontFamily: template.bodyData.font,
      fontWeight: template.bodyData.fontWeight,
    },
  ];
  const fontWork = preloadFonts({
    objects: [...posterObjects, ...fontProbeObjects],
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Template fonts were not ready before timeout.')),
      5000
    );
    fontWork.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      fontError => {
        clearTimeout(timer);
        reject(fontError);
      }
    );
  });
};

interface UseInvitationTemplateOptions {
  onApplied?: () => void;
}

export function useInvitationTemplate({
  onApplied,
}: UseInvitationTemplateOptions = {}) {
  const { canvas, runHistoryTransaction } = useFabricContext();
  const { confirm } = useConfirm();
  const { success, error: showError } = useToast();
  const isApplyingRef = useRef(false);
  const [isApplying, setIsApplying] = useState(false);
  const mountedRef = useRef(true);
  const latestRequestIdRef = useRef(0);
  const activeConfirmMessageRef = useRef<string | null>(null);
  const currentCanvasRef = useRef(canvas);
  currentCanvasRef.current = canvas;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      latestRequestIdRef.current += 1;
      const activeConfirmMessage = activeConfirmMessageRef.current;
      const confirmState = useConfirmStore.getState();
      if (
        activeConfirmMessage &&
        confirmState.isOpen &&
        confirmState.message === activeConfirmMessage
      ) {
        confirmState.handleCancel();
      }
    };
  }, []);

  const applyTemplate = useCallback(
    async (templateId: string) => {
      if (isApplyingRef.current) return false;
      isApplyingRef.current = true;
      const requestId = ++latestRequestIdRef.current;
      const isCurrentRequest = () =>
        mountedRef.current &&
        latestRequestIdRef.current === requestId &&
        currentCanvasRef.current === canvas;
      const isCanvasUsable = () =>
        Boolean(
          canvas &&
          !canvas.disposed &&
          !canvas.destroyed &&
          currentCanvasRef.current === canvas
        );
      setIsApplying(true);

      try {
        const template = INVITATION_TEMPLATES.find(
          item => item.id === templateId
        );
        if (!template)
          throw new Error(`Unknown invitation template: ${templateId}`);

        const confirmMessage = `“${template.name}” 템플릿을 사용하시겠습니까?\n현재 포스터와 페이지, 입력한 내용이 템플릿 기본값으로 교체됩니다.`;
        activeConfirmMessageRef.current = confirmMessage;
        const isConfirmed = await confirm({
          message: confirmMessage,
          confirmText: '적용하기',
          cancelText: '취소',
          variant: 'white',
          yPosition: 'center',
        });
        if (activeConfirmMessageRef.current === confirmMessage) {
          activeConfirmMessageRef.current = null;
        }
        if (!isCurrentRequest()) return false;
        if (!isConfirmed) return false;
        if (!canvas) throw new Error('The poster canvas is not ready.');

        const prepared = createInvitationTemplate(templateId);
        await waitForFontPreparation(prepared);
        if (!isCurrentRequest()) return false;
        if (!isCanvasUsable()) {
          throw new Error('The poster canvas is no longer available.');
        }

        const canvasSnapshot = cloneCanvasJson(
          canvas.toObject(CANVAS_OBJECT_PROPERTIES)
        );

        try {
          await runHistoryTransaction(
            async () => {
              await canvas.loadFromJSON(cloneCanvasJson(prepared.posterJson));
              await stabilizeCanvasAfterLoad(canvas);
            },
            { save: true }
          );
        } catch (applyError) {
          if (isCanvasUsable()) {
            try {
              await runHistoryTransaction(
                async () => {
                  await canvas.loadFromJSON(canvasSnapshot);
                },
                { save: false }
              );
            } catch (rollbackError) {
              console.error(
                '템플릿 적용 후 캔버스 복구에 실패했습니다.',
                rollbackError
              );
            }
          }
          throw applyError;
        }

        if (!isCurrentRequest()) {
          if (isCanvasUsable()) {
            await runHistoryTransaction(
              async () => {
                await canvas.loadFromJSON(canvasSnapshot);
              },
              { save: false }
            );
          }
          return false;
        }

        const removedImageIds = new Set<string>();
        const previousBlocks = useEditorStore.getState().block;
        previousBlocks.forEach(block => {
          if (block.id !== 'shareUrl') removedImageIds.add(block.id);
          collectBlockImageIds(block.props, removedImageIds);
        });

        useEditorStore.setState(state => ({
          block: prepared.blocks,
          backgroundColor: prepared.backgroundColor,
          titleData: prepared.titleData,
          bodyData: prepared.bodyData,
          images: state.images.filter(image => !removedImageIds.has(image.id)),
          selectedId: 'mainPoster',
          activeTab: null,
          isEdit: false,
          isDirty: true,
        }));

        success(`${template.name} 템플릿을 적용했습니다.`, {
          placement: 'top-right',
        });
        onApplied?.();
        return true;
      } catch (applyError) {
        if (!isCurrentRequest()) return false;
        console.error('초대장 템플릿 적용 중 오류가 발생했습니다.', applyError);
        showError('템플릿을 적용하지 못했습니다. 다시 시도해 주세요.', {
          placement: 'top-right',
        });
        return false;
      } finally {
        isApplyingRef.current = false;
        activeConfirmMessageRef.current = null;
        if (mountedRef.current) setIsApplying(false);
      }
    },
    [canvas, confirm, onApplied, runHistoryTransaction, showError, success]
  );

  return { applyTemplate, isApplying };
}

export const collectInvitationTemplateImageIds = (blocks: unknown[]) => {
  const ids = new Set<string>();
  blocks.forEach(block => {
    if (!block || typeof block !== 'object') return;
    const maybeBlock = block as { id?: unknown; props?: unknown };
    if (
      typeof maybeBlock.id === 'string' &&
      maybeBlock.id &&
      maybeBlock.id !== 'shareUrl'
    ) {
      ids.add(maybeBlock.id);
    }
    collectBlockImageIds(maybeBlock.props, ids);
  });
  return ids;
};
