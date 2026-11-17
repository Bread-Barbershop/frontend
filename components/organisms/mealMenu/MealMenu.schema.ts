import {
  DEFAULT_MEAL_MENU_STYLE,
  getSampleMenuCourses,
} from './mealMenuContent';

export const mealMenuSchema = {
  type: null,
  fields: {
    title: { default: '식사 메뉴', required: true },
    subtitle: { default: 'Dinner Menu', required: true },
    courses: { default: getSampleMenuCourses, required: true },
    note: { default: '', required: true },
    menuStyle: { default: DEFAULT_MEAL_MENU_STYLE, required: true },
    showCornerArt: { default: true, required: true },
  },
} as const;
