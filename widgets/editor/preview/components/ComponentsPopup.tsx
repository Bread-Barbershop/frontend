'use client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';
import {
  getInvitationTemplates,
  type InvitationTemplateType,
} from '@/shared/data/invitationTemplates';
import { useConfirmStore } from '@/shared/store/useConfirmStore';
import { trapFocus } from '@/shared/utils/focusTrap';
import { useInvitationTemplate } from '@/widgets/editor/preview/hooks/useInvitationTemplate';

import ContentsArea from './ContentsArea';
import InvitationTemplatePicker from './InvitationTemplatePicker';
import TabArea from './TabArea';

interface Props {
  open?: boolean;
  onPopClose: () => void;
}

const emptySubscribe = () => () => {};

function ComponentsPopup({ open = true, onPopClose }: Props) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [active, setActive] = useState('wedding');
  const [searchQuery, setSearchQuery] = useState('');
  const [templatePickerType, setTemplatePickerType] =
    useState<InvitationTemplateType | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const { applyTemplate, isApplying } = useInvitationTemplate();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleClose = useCallback(() => {
    if (isApplying) return;
    setSearchQuery('');
    setTemplatePickerType(null);
    onPopClose();
  }, [isApplying, onPopClose]);

  useEffect(() => {
    if (!open) return;

    const closeIfViewportGuardActive = () => {
      if (
        window.innerWidth < DESKTOP_CONTENT_MIN_WIDTH &&
        !isApplying &&
        !useConfirmStore.getState().isOpen
      ) {
        handleClose();
      }
    };

    closeIfViewportGuardActive();
    window.addEventListener('resize', closeIfViewportGuardActive);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !useConfirmStore.getState().isOpen) {
        const dialog = dialogRef.current;
        if (dialog) trapFocus(event, dialog);
      }

      if (event.key === 'Escape') {
        if (isApplying || useConfirmStore.getState().isOpen) return;
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', closeIfViewportGuardActive);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClose, isApplying]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    return () => {
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        if (isManualScrolling.current) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const type = entry.target.getAttribute('data-type');
            if (type) setActive(type);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.9,
      }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [open, searchQuery]);

  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  const handleTabClick = (english: string) => {
    if (searchQuery) {
      setSearchQuery('');
    }

    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }

    isManualScrolling.current = true;
    setActive(english);
    sectionRefs.current[english]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrolling.current = false;
      manualScrollTimeoutRef.current = null;
    }, 800);
  };

  const handleOpenTemplatePicker = (type: InvitationTemplateType) => {
    setTemplatePickerType(type);
    setSelectedTemplateId(getInvitationTemplates(type)[0]?.id ?? null);
  };

  const handleTemplateTypeChange = (type: InvitationTemplateType) => {
    setTemplatePickerType(type);
    setSelectedTemplateId(getInvitationTemplates(type)[0]?.id ?? null);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) return;
    const didApply = await applyTemplate(selectedTemplateId);
    if (didApply) {
      setSearchQuery('');
      setTemplatePickerType(null);
      onPopClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[30000] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 pointer-events-auto"
            onClick={handleClose}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={templatePickerType ? '초대장 템플릿 선택' : '블록 추가'}
            ref={dialogRef}
            className={`absolute flex flex-col gap-3 overflow-hidden bg-white shadow-edit pointer-events-auto ${templatePickerType ? 'left-1/2 top-1/2 h-[min(820px,calc(100dvh-64px))] min-h-[min(580px,calc(100dvh-64px))] w-[min(1040px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl' : 'bottom-12 left-1/2 h-99.5 w-164 -translate-x-1/2 rounded-md'}`}
          >
            {templatePickerType ? (
              <InvitationTemplatePicker
                type={templatePickerType}
                selectedId={selectedTemplateId}
                isApplying={isApplying}
                onSelect={setSelectedTemplateId}
                onTypeChange={handleTemplateTypeChange}
                onBack={() => setTemplatePickerType(null)}
                onClose={handleClose}
                onApply={handleApplyTemplate}
              />
            ) : (
              <>
                <div>
                  <TabArea
                    active={active}
                    tabClick={english => handleTabClick(english)}
                    closeClick={handleClose}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
                <ContentsArea
                  scrollContainerRef={scrollContainerRef}
                  sectionRefs={sectionRefs}
                  searchQuery={searchQuery}
                  onOpenTemplatePicker={handleOpenTemplatePicker}
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ComponentsPopup;
