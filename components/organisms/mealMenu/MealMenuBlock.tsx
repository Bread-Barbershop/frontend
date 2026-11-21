'use client';

import { arrayMove } from '@dnd-kit/sortable';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import {
  createMenuCourse,
  createMenuDish,
  MAX_COURSE_DISHES,
  MAX_MENU_COURSES,
  MEAL_MENU_STYLES,
  MENU_TEXT_LIMITS,
  menuText,
  normalizeMenuCourses,
  resolveMealMenuStyle,
  type MenuDish,
} from './mealMenuContent';

const fieldClass = 'flex min-w-0 flex-col gap-1 text-sm text-text-secondary';
const inputClass =
  'w-full rounded-md border border-border-divider bg-white px-2.5 py-2 text-sm text-text-primary focus:border-primary';
const addClass =
  'w-full rounded-md border border-border-divider px-3 py-2 text-sm text-primary hover:bg-neutral-50 disabled:opacity-40';
const iconClass =
  'grid size-8 place-items-center rounded text-text-secondary hover:bg-neutral-100 disabled:opacity-30';
const STYLE_OPTIONS = MEAL_MENU_STYLES.map(({ id, name }) => ({
  value: id,
  label: name,
}));

function OrderControls({
  label,
  index,
  count,
  onMove,
  onRemove,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (destination: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        className={iconClass}
        aria-label={`${label} 위로 이동`}
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        <ArrowUp size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={iconClass}
        aria-label={`${label} 아래로 이동`}
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
      >
        <ArrowDown size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={iconClass}
        aria-label={`${label} 삭제`}
        onClick={onRemove}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export function MealMenuBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'mealMenu'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { props } = blockInfo;
  const courses = normalizeMenuCourses(props.courses);
  const { id: menuStyle, hasArtwork } = resolveMealMenuStyle(props.menuStyle);
  const update = (patch: Partial<EditorBlock<'mealMenu'>['props']>) =>
    updateBlock<'mealMenu'>(id, patch);
  const replaceCourse = (
    index: number,
    patch: Partial<(typeof courses)[number]>
  ) =>
    update({
      courses: courses.map((course, i) =>
        i === index ? { ...course, ...patch } : course
      ),
    });
  const replaceDish = (
    courseIndex: number,
    dishIndex: number,
    patch: Partial<MenuDish>
  ) =>
    replaceCourse(courseIndex, {
      dishes: courses[courseIndex].dishes.map((dish, i) =>
        i === dishIndex ? { ...dish, ...patch } : dish
      ),
    });

  return (
    <LeftEditorWrapper ariaLabel="식사 메뉴 편집" className="gap-3">
      <NavigationBar>식사 메뉴 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 pb-4">
        <FormSelector
          label="디자인"
          className={fieldClass}
          options={STYLE_OPTIONS}
          value={menuStyle}
          onChange={menuStyle => update({ menuStyle })}
        />
        {hasArtwork && (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={props.showCornerArt !== false}
              onChange={event =>
                update({ showCornerArt: event.target.checked })
              }
            />
            테두리 장식
          </label>
        )}
        {(
          [
            { field: 'title', label: '메뉴 제목' },
            { field: 'subtitle', label: '보조 제목 (선택)' },
          ] as const
        ).map(({ field, label }) => (
          <label key={field} className={fieldClass}>
            {label}
            <input
              className={inputClass}
              value={menuText(props[field], MENU_TEXT_LIMITS[field])}
              maxLength={MENU_TEXT_LIMITS[field]}
              onChange={event => update({ [field]: event.target.value })}
            />
          </label>
        ))}

        {courses.map((course, courseIndex) => {
          const courseLabel = `코스 ${courseIndex + 1}`;
          return (
            <section
              key={course.id}
              className="flex flex-col gap-3 rounded-lg border border-border-divider p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-text-primary">
                  {courseLabel}
                </h4>
                <OrderControls
                  label={courseLabel}
                  index={courseIndex}
                  count={courses.length}
                  onMove={destination =>
                    update({
                      courses: arrayMove(courses, courseIndex, destination),
                    })
                  }
                  onRemove={() =>
                    update({
                      courses: courses.filter(
                        (_, index) => index !== courseIndex
                      ),
                    })
                  }
                />
              </div>
              <label className={fieldClass}>
                코스 이름 (선택)
                <input
                  className={inputClass}
                  value={course.name}
                  maxLength={MENU_TEXT_LIMITS.course}
                  onChange={event =>
                    replaceCourse(courseIndex, { name: event.target.value })
                  }
                />
              </label>
              {course.dishes.map((dish, dishIndex) => (
                <div
                  key={dish.id}
                  className="flex flex-col gap-2 border-t border-border-divider pt-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-text-secondary">
                      요리 {dishIndex + 1}
                    </span>
                    <OrderControls
                      label={`${courseLabel} 요리 ${dishIndex + 1}`}
                      index={dishIndex}
                      count={course.dishes.length}
                      onMove={destination =>
                        replaceCourse(courseIndex, {
                          dishes: arrayMove(
                            course.dishes,
                            dishIndex,
                            destination
                          ),
                        })
                      }
                      onRemove={() =>
                        replaceCourse(courseIndex, {
                          dishes: course.dishes.filter(
                            (_, index) => index !== dishIndex
                          ),
                        })
                      }
                    />
                  </div>
                  <label className={fieldClass}>
                    요리 이름
                    <input
                      className={inputClass}
                      value={dish.name}
                      maxLength={MENU_TEXT_LIMITS.dish}
                      onChange={event =>
                        replaceDish(courseIndex, dishIndex, {
                          name: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={fieldClass}>
                    요리 설명 (선택)
                    <textarea
                      className={inputClass}
                      value={dish.description}
                      rows={2}
                      maxLength={MENU_TEXT_LIMITS.description}
                      onChange={event =>
                        replaceDish(courseIndex, dishIndex, {
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                className={addClass}
                disabled={course.dishes.length >= MAX_COURSE_DISHES}
                onClick={() =>
                  replaceCourse(courseIndex, {
                    dishes: [...course.dishes, createMenuDish()],
                  })
                }
              >
                + 요리 추가
              </button>
            </section>
          );
        })}
        <button
          type="button"
          className={addClass}
          disabled={courses.length >= MAX_MENU_COURSES}
          onClick={() => update({ courses: [...courses, createMenuCourse()] })}
        >
          + 코스 추가
        </button>
        <label className={fieldClass}>
          하단 안내 (선택)
          <textarea
            className={inputClass}
            rows={2}
            value={menuText(props.note, MENU_TEXT_LIMITS.note)}
            maxLength={MENU_TEXT_LIMITS.note}
            onChange={event => update({ note: event.target.value })}
          />
        </label>
      </div>
    </LeftEditorWrapper>
  );
}
