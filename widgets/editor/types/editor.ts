import { blockRegistry } from './registry';

export type BlockType = keyof typeof blockRegistry;

type Field<T> = {
  default: T | (() => T); //string | number | boolean
  required: boolean;
};

type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;
type DefaultValue<T> = T extends () => infer R ? R : T;

type FieldValue<F extends Field<any>> = Widen<DefaultValue<F['default']>>;

// export type PropsFromFields<F extends Record<string, Field<any>>> = {
//   [K in keyof F as F[K] extends { required: true } ? K : never]: Widen<
//     F[K]['default']
//   >;
// } & {
//   [K in keyof F as F[K] extends { required: true } ? never : K]?: Widen<
//     F[K]['default']
//   >;
// };
export type PropsFromFields<F extends Record<string, Field<any>>> = {
  [K in keyof F as F[K]['required'] extends true ? K : never]: FieldValue<F[K]>;
} & {
  [K in keyof F as F[K]['required'] extends true ? never : K]?: FieldValue<
    F[K]
  >;
};
