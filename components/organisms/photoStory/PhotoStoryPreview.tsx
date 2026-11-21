'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent,
} from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import styles from './photoStory.module.css';
import {
  hasPhotoStoryPageContent,
  readPhotoStoryPages,
  type PhotoStoryPage,
} from './PhotoStory.schema';

function StoryPage({
  page,
  selected,
  isGuestPage,
}: {
  page: PhotoStoryPage;
  selected: boolean;
  isGuestPage: boolean;
}) {
  const src = useResolvedImageSource(page.image?.[0]);
  return (
    <figure className={styles.page} data-selected={selected}>
      {src ? (
        <div className={styles.photo}>
          <Image
            src={src}
            alt={page.heading || '이야기 사진'}
            fill
            sizes="(max-width: 480px) 90vw, 400px"
            className="object-cover"
          />
        </div>
      ) : (
        !isGuestPage && (
          <div
            className={cn(
              styles.photo,
              'flex-center border border-dashed border-current/25 text-xs'
            )}
          >
            사진을 추가해 주세요.
          </div>
        )
      )}
      {(page.date || page.heading || page.caption) && (
        <figcaption className={styles.caption}>
          {page.date && (
            <time dateTime={page.date} className={styles.date}>
              {page.date.replaceAll('-', '. ')}
            </time>
          )}
          {page.heading && <h3 className={styles.heading}>{page.heading}</h3>}
          {page.caption && <p>{page.caption}</p>}
        </figcaption>
      )}
    </figure>
  );
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'photoStory'>;
  isGuestPage?: boolean;
  titleClassName?: string;
}

export function PhotoStoryPreview({
  blockInfo,
  isGuestPage = false,
  className = '',
  titleClassName,
  ...rest
}: Props) {
  const title =
    (typeof blockInfo.props.title === 'string' &&
      blockInfo.props.title.trim()) ||
    '한 장 이야기';
  const visible = readPhotoStoryPages(blockInfo.props.pages).filter(
    page => !isGuestPage || hasPhotoStoryPageContent(page)
  );
  const { fontFamily, fontSize, fontWeight, color } = useBodyFontInfo();
  const track = useRef<HTMLDivElement>(null);
  const mouseDrag = useRef<{ x: number; left: number; page: number } | null>(
    null
  );
  const trackId = useId();
  const [index, setIndex] = useState(0);
  const active = Math.min(index, visible.length - 1);

  function moveTo(target: number) {
    const element = track.current;
    const slide = element?.children[target];
    if (!element || !(slide instanceof HTMLElement)) return;
    element.scrollTo({ left: slide.offsetLeft, behavior: 'auto' });
  }

  function readPosition() {
    const element = track.current;
    const second = element?.children[1];
    if (element && second instanceof HTMLElement && second.offsetLeft > 0) {
      setIndex(Math.round(element.scrollLeft / second.offsetLeft));
    } else {
      setIndex(0);
    }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      visible.length < 2
    )
      return;
    const element = event.currentTarget;
    mouseDrag.current = {
      x: event.clientX,
      left: element.scrollLeft,
      page: active,
    };
    element.setPointerCapture(event.pointerId);
    element.dataset.dragging = 'true';
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const start = mouseDrag.current;
    if (!start || event.pointerType !== 'mouse') return;
    mouseDrag.current = null;
    delete event.currentTarget.dataset.dragging;
    const distance = start.x - event.clientX;
    const step =
      event.type === 'pointerup' && Math.abs(distance) >= 36
        ? Math.sign(distance)
        : 0;
    moveTo(Math.max(0, Math.min(visible.length - 1, start.page + step)));
  }

  useEffect(() => {
    const frame = requestAnimationFrame(readPosition);
    return () => cancelAnimationFrame(frame);
  }, [visible.length]);

  if (isGuestPage && !visible.length) return null;
  return (
    <MiddlePreviewWrapper noTitle className={className} {...rest}>
      <section
        aria-label={title}
        className="w-full min-w-0 text-left"
        style={{ fontFamily, fontSize, fontWeight, color }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <PreviewTitle
            isMainTitle
            mainTitle={title}
            className="min-w-0 flex-1"
            titleClassName={cn(
              'text-left [overflow-wrap:anywhere]',
              titleClassName
            )}
          />
          {visible.length > 1 && (
            <div className={styles.navigation}>
              <button
                type="button"
                aria-label="이전 장"
                aria-controls={trackId}
                disabled={active <= 0}
                onClick={() => moveTo(active - 1)}
              >
                <ArrowLeft size={17} />
              </button>
              <span aria-live="polite" aria-atomic="true">
                {active + 1} / {visible.length}
              </span>
              <button
                type="button"
                aria-label="다음 장"
                aria-controls={trackId}
                disabled={active >= visible.length - 1}
                onClick={() => moveTo(active + 1)}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
        {visible.length ? (
          <div
            id={trackId}
            ref={track}
            className={styles.track}
            data-multiple={visible.length > 1}
            data-no-block-drag
            role="region"
            aria-label="이야기 페이지"
            tabIndex={visible.length > 1 ? 0 : undefined}
            onScroll={readPosition}
            onPointerDown={startDrag}
            onPointerMove={event => {
              const start = mouseDrag.current;
              if (start && event.pointerType === 'mouse') {
                event.currentTarget.scrollLeft =
                  start.left + start.x - event.clientX;
              }
            }}
            onPointerUp={finishDrag}
            onLostPointerCapture={finishDrag}
            onDragStart={event => event.preventDefault()}
            onKeyDown={event => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
                return;
              event.preventDefault();
              moveTo(active + (event.key === 'ArrowRight' ? 1 : -1));
            }}
          >
            {visible.map((page, i) => (
              <StoryPage
                key={page.id}
                page={page}
                selected={i === active}
                isGuestPage={isGuestPage}
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm">장을 추가해 주세요.</p>
        )}
      </section>
    </MiddlePreviewWrapper>
  );
}
