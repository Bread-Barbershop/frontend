'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { SortableEditorRow } from '@/features/DndKit/Sort/SortableEditorRow';
import SortableWrapper from '@/features/DndKit/Sort/SortableWrapper';
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
const STYLE_OPTIONS = MEAL_MENU_STYLES.map(({ id, name }) => ({
  value: id,
  label: name,
}));

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

        <SortableWrapper
          vertical
          items={courses}
          className="flex-col gap-4"
          onChange={courses => update({ courses })}
        >
          {(course, courseIndex, moveCourse) => {
            const courseLabel = `코스 ${courseIndex + 1}`;
            return (
              <SortableEditorRow
                key={course.id}
                id={course.id}
                label={courseLabel}
                removeLabel={`${courseLabel} 삭제`}
                heading={
                  <h4 className="text-sm font-semibold text-text-primary">
                    {courseLabel}
                  </h4>
                }
                className="flex flex-col gap-3 rounded-lg border border-border-divider p-3"
                onMove={moveCourse}
                onRemove={() =>
                  update({
                    courses: courses.filter(item => item.id !== course.id),
                  })
                }
              >
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
                <SortableWrapper
                  vertical
                  items={course.dishes}
                  className="flex-col gap-3"
                  onChange={dishes => replaceCourse(courseIndex, { dishes })}
                >
                  {(dish, dishIndex, moveDish) => {
                    const dishLabel = `요리 ${dishIndex + 1}`;
                    const fullLabel = `${courseLabel} ${dishLabel}`;
                    return (
                      <SortableEditorRow
                        key={dish.id}
                        id={dish.id}
                        label={fullLabel}
                        removeLabel={`${fullLabel} 삭제`}
                        heading={
                          <span className="text-xs font-semibold text-text-secondary">
                            {dishLabel}
                          </span>
                        }
                        className="flex flex-col gap-2 border-t border-border-divider pt-2"
                        onMove={moveDish}
                        onRemove={() =>
                          replaceCourse(courseIndex, {
                            dishes: course.dishes.filter(
                              item => item.id !== dish.id
                            ),
                          })
                        }
                      >
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
                      </SortableEditorRow>
                    );
                  }}
                </SortableWrapper>
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
              </SortableEditorRow>
            );
          }}
        </SortableWrapper>
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
