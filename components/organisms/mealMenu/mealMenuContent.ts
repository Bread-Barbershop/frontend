export const MEAL_MENU_STYLES = [
  {
    id: 'classic',
    name: '클래식',
    description: '덩굴 장식과 명조체를 담은 종이 메뉴판',
    hasArtwork: true,
  },
  {
    id: 'minimal',
    name: '미니멀',
    description: '코스명과 요리를 나란히 놓은 메뉴판',
    hasArtwork: false,
  },
  {
    id: 'tasting',
    name: '셰프 테이스팅',
    description: '요리마다 서빙 순서를 표시한 테이스팅 메뉴',
    hasArtwork: false,
  },
  {
    id: 'bistro',
    name: '비스트로',
    description: '버건디 테두리와 코스 리본을 더한 메뉴판',
    hasArtwork: false,
  },
  {
    id: 'garden',
    name: '잉크 가든',
    description: '종이의 두 모서리를 감싼 섬세한 꽃 테두리',
    hasArtwork: true,
  },
  {
    id: 'ribbon',
    name: '리본과 별',
    description: '두 개의 리본과 작은 별이 있는 손그림 프레임',
    hasArtwork: true,
  },
  {
    id: 'ivy',
    name: '앤틱 아이비',
    description: '잎이 무성한 담쟁이를 대각선에 배치한 메뉴판',
    hasArtwork: true,
  },
  {
    id: 'artDeco',
    name: '아르데코',
    description: '대칭 기하학과 이중선이 어우러진 프레임',
    hasArtwork: true,
  },
] as const;

export type MealMenuStyle = (typeof MEAL_MENU_STYLES)[number]['id'];

export const DEFAULT_MEAL_MENU_STYLE: MealMenuStyle = 'classic';
export const MAX_MENU_COURSES = 12;
export const MAX_COURSE_DISHES = 20;
export const MENU_TEXT_LIMITS = {
  title: 60,
  subtitle: 60,
  course: 40,
  dish: 80,
  description: 200,
  note: 200,
} as const;

export type MenuDish = {
  id: string;
  name: string;
  description: string;
};

export type MenuCourse = {
  id: string;
  name: string;
  dishes: MenuDish[];
};

export function createMenuDish(): MenuDish {
  return { id: crypto.randomUUID(), name: '', description: '' };
}

export function createMenuCourse(): MenuCourse {
  return { id: crypto.randomUUID(), name: '', dishes: [createMenuDish()] };
}

export function getSampleMenuCourses(): MenuCourse[] {
  return [
    {
      id: 'starter',
      name: '전채',
      dishes: [
        {
          id: 'soup',
          name: '구운 단호박 수프',
          description: '브라운 버터와 호박씨',
        },
      ],
    },
    {
      id: 'main',
      name: '메인',
      dishes: [
        {
          id: 'steak',
          name: '안심 스테이크',
          description: '감자 퓌레와 레드와인 소스',
        },
      ],
    },
    {
      id: 'dessert',
      name: '디저트',
      dishes: [
        {
          id: 'panna-cotta',
          name: '바닐라 판나코타',
          description: '제철 베리 콩포트',
        },
      ],
    },
  ];
}

export function resolveMealMenuStyle(value: unknown) {
  return (
    MEAL_MENU_STYLES.find(style => style.id === value) ?? MEAL_MENU_STYLES[0]
  );
}

function records(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item)
    )
    .slice(0, limit)
    .map((item, index) => {
      let id = menuText(item.id, 80) || `item-${index}`;
      while (ids.has(id)) id += '-';
      ids.add(id);
      return { item, id };
    });
}

export function menuText(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.slice(0, limit) : '';
}

export function normalizeMenuCourses(value: unknown): MenuCourse[] {
  return records(value, MAX_MENU_COURSES).map(({ item: course, id }) => ({
    id,
    name: menuText(course.name, MENU_TEXT_LIMITS.course),
    dishes: records(course.dishes, MAX_COURSE_DISHES).map(
      ({ item: dish, id }) => ({
        id,
        name: menuText(dish.name, MENU_TEXT_LIMITS.dish),
        description: menuText(dish.description, MENU_TEXT_LIMITS.description),
      })
    ),
  }));
}
