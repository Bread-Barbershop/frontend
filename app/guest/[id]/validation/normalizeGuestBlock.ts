import { blockSchema } from '@/shared/data/registry/block.schema';
import type { BlockType } from '@/shared/types/editor';

import type { GuestBlock } from '../types/guestTypes';

type GuestBlockWarningCode =
  | 'invalid_block_shape'
  | 'unknown_component'
  | 'invalid_block_props';

export type GuestBlockWarning = {
  code: GuestBlockWarningCode;
  index: number;
  blockId?: string;
  component?: string;
};

type NormalizeGuestBlockResult =
  | {
      ok: true;
      block: GuestBlock;
    }
  | {
      ok: false;
      warning: GuestBlockWarning;
    };

type SchemaField = {
  default: unknown;
  required: boolean;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function hasOwn(obj: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isKnownBlockComponent(component: string): component is BlockType {
  return hasOwn(blockSchema, component);
}

function cloneDefaultValue(value: unknown): unknown {
  const resolved =
    typeof value === 'function' ? (value as () => unknown)() : value;

  if (resolved === null || typeof resolved !== 'object') {
    return resolved;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(resolved);
    } catch {
      // Fall through to JSON cloning for plain schema defaults.
    }
  }

  try {
    return JSON.parse(JSON.stringify(resolved));
  } catch {
    return resolved;
  }
}

function normalizeProps(
  props: Record<string, unknown>,
  fields: Record<string, SchemaField>
) {
  const normalizedProps: Record<string, unknown> = { ...props };

  // blockSchema의 default를 주입해 새/기존 저장 데이터의 props 차이를 흡수한다.
  Object.entries(fields).forEach(([fieldName, field]) => {
    if (normalizedProps[fieldName] === undefined) {
      normalizedProps[fieldName] = cloneDefaultValue(field.default);
    }
  });

  return normalizedProps;
}

export function normalizeGuestBlock(
  input: unknown,
  index: number
): NormalizeGuestBlockResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      warning: { code: 'invalid_block_shape', index },
    };
  }

  const blockId = typeof input.id === 'string' ? input.id : undefined;
  const component =
    typeof input.component === 'string' ? input.component : undefined;

  if (
    typeof input.id !== 'string' ||
    typeof input.type !== 'string' ||
    typeof input.component !== 'string'
  ) {
    return {
      ok: false,
      warning: {
        code: 'invalid_block_shape',
        index,
        blockId,
        component,
      },
    };
  }

  if (!isKnownBlockComponent(input.component)) {
    return {
      ok: false,
      warning: {
        code: 'unknown_component',
        index,
        blockId: input.id,
        component: input.component,
      },
    };
  }

  if (!isRecord(input.props)) {
    return {
      ok: false,
      warning: {
        code: 'invalid_block_props',
        index,
        blockId: input.id,
        component: input.component,
      },
    };
  }

  // blockRegistry는 변경하지 않고, 같은 source인 blockSchema만 읽어서 검증한다.
  const schema = blockSchema[input.component];
  const normalizedProps = normalizeProps(
    input.props,
    schema.fields as Record<string, SchemaField>
  );

  return {
    ok: true,
    block: {
      id: input.id,
      type: input.type,
      component: input.component,
      props: normalizedProps,
    },
  };
}
