import { createDefaultProps } from './createDefaultProps';

describe('createDefaultProps', () => {
  it('creates an initial interview question with a fresh id for each block', () => {
    const first = createDefaultProps('interview', 'wedding');
    const second = createDefaultProps('interview', 'wedding');

    expect(first.questions).toHaveLength(1);
    expect(second.questions).toHaveLength(1);
    expect(first.questions?.[0].id).toEqual(expect.any(String));
    expect(second.questions?.[0].id).toEqual(expect.any(String));
    expect(first.questions?.[0].id).not.toBe(second.questions?.[0].id);
  });

  it('creates an initial notice item with a fresh id for each block', () => {
    const first = createDefaultProps('notice', 'wedding');
    const second = createDefaultProps('notice', 'wedding');

    expect(first.noticeList).toHaveLength(1);
    expect(second.noticeList).toHaveLength(1);
    expect(first.noticeList?.[0].id).toEqual(expect.any(String));
    expect(second.noticeList?.[0].id).toEqual(expect.any(String));
    expect(first.noticeList?.[0].id).not.toBe(second.noticeList?.[0].id);
  });
});
