import { weddingDayDefinition } from '@/components/organisms/sample/WeddingDay.definition';
import { introduceDefinition } from '@/components/organisms/sample2/Introduce.definition';

export const blockRegistry = {
  weddingDay: weddingDayDefinition,
  introduce: introduceDefinition,
} as const;
