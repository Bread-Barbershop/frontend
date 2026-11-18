/* global jest */
export const redisEntries = new Map<string, string>();
export const cookieEntries = new Map<string, string>();
export const redisMock = {
  get: jest.fn(async (key: string) => redisEntries.get(key) ?? null),
  set: jest.fn(
    async (key: string, value: string, options?: { nx?: boolean }) => {
      if (options?.nx && redisEntries.has(key)) return null;
      redisEntries.set(key, value);
      return 'OK';
    }
  ),
  del: jest.fn(async (key: string) => Number(redisEntries.delete(key))),
  eval: jest.fn(async (_script: string, keys: string[], args: string[]) => {
    if (redisEntries.get(keys[0]) !== args[0]) return 0;
    if (args.length > 1) redisEntries.set(keys[0], args[1]);
    else redisEntries.delete(keys[0]);
    return 1;
  }),
};
