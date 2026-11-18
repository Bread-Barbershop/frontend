import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import {
  MENU_TEXT_LIMITS,
  menuText,
  normalizeMenuCourses,
  resolveMealMenuStyle,
} from './mealMenuContent';
import styles from './MealMenuPreview.module.css';

interface Props {
  blockInfo: EditorBlock<'mealMenu'>;
  className?: string;
  isGuestPage?: boolean;
  compact?: boolean;
}

export function MealMenuPreview({
  blockInfo,
  className,
  isGuestPage = false,
  compact = false,
}: Props) {
  const { props } = blockInfo;
  const { id: menuStyle, hasArtwork } = resolveMealMenuStyle(props.menuStyle);
  const title =
    menuText(props.title, MENU_TEXT_LIMITS.title).trim() || '식사 메뉴';
  const subtitle = menuText(props.subtitle, MENU_TEXT_LIMITS.subtitle).trim();
  const note = menuText(props.note, MENU_TEXT_LIMITS.note).trim();
  const courses = normalizeMenuCourses(props.courses)
    .map(course => ({
      ...course,
      dishes: course.dishes.filter(dish => dish.name.trim()),
    }))
    .filter(course => course.dishes.length > 0);

  if (isGuestPage && courses.length === 0) return null;

  return (
    <div className={cn(styles.wrapper, compact && styles.compact, className)}>
      <article
        aria-label={title}
        className={cn(styles.paper, styles[menuStyle])}
        data-menu-style={menuStyle}
        data-corner-art={hasArtwork && props.showCornerArt !== false}
      >
        <header className={styles.heading}>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <h2 className={styles.title}>{title}</h2>
        </header>
        {courses.length === 0 ? (
          <p className={styles.note}>요리를 추가해주세요.</p>
        ) : (
          <div className={styles.courses}>
            {courses.map(course => (
              <section className={styles.course} key={course.id}>
                {course.name.trim() && (
                  <h3 className={styles.courseTitle}>{course.name}</h3>
                )}
                <ol className={styles.dishes} role="list">
                  {course.dishes.map(dish => (
                    <li className={styles.dish} key={dish.id}>
                      <p className={styles.dishName}>{dish.name}</p>
                      {dish.description.trim() && (
                        <p className={styles.description}>{dish.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
        {note && <p className={styles.note}>{note}</p>}
      </article>
    </div>
  );
}
