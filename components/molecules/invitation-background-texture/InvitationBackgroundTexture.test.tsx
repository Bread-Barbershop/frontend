import { render, waitFor } from '@testing-library/react';

import { InvitationBackgroundTexture } from './InvitationBackgroundTexture';

describe('초대장 배경 질감 레이어', () => {
  it('어두운 배경에서 색상 투명도를 반영해 질감을 문서 뒤에 합성한다', () => {
    const { container } = render(
      <InvitationBackgroundTexture
        color="#203451CC"
        texture={{ material: 'wood', strength: 50 }}
      />
    );

    const texture = container.querySelector<HTMLElement>(
      '[style*="background-image"]'
    );
    expect(texture).toHaveStyle({
      backgroundImage: 'url("/images/invitation-textures/wood.webp")',
      backgroundSize: '275px',
      mixBlendMode: 'soft-light',
    });
    expect(Number(texture?.style.opacity)).toBeCloseTo(0.4);
    expect(texture?.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('질감을 바꾸면 두 무늬가 겹쳐 전환된 뒤 마지막으로 선택한 무늬만 남는다', async () => {
    const { container, rerender } = render(
      <InvitationBackgroundTexture
        color="#FFFFFF"
        texture={{ material: 'wood', strength: 65 }}
      />
    );
    const wood = container.querySelector('[style*="wood.webp"]');

    rerender(
      <InvitationBackgroundTexture
        color="#FFFFFF"
        texture={{ material: 'linen', strength: 26 }}
      />
    );
    const linen = container.querySelector('[style*="linen.webp"]');
    expect(wood).toBeInTheDocument();
    expect(linen).toBeInTheDocument();
    await waitFor(() => {
      expect(wood).not.toBeInTheDocument();
      expect(linen).toHaveStyle({ opacity: '0.26' });
    });

    rerender(
      <InvitationBackgroundTexture
        color="#FFFFFF"
        texture={{ material: 'none', strength: 26 }}
      />
    );
    expect(linen).toBeInTheDocument();
    await waitFor(() => expect(linen).not.toBeInTheDocument());
  });

  it.each([
    undefined,
    { material: 'none', strength: 50 } as const,
    { material: 'wood', strength: 0 } as const,
  ])('배경 질감이 보이지 않을 때 이미지 요청을 만들지 않는다', texture => {
    const { container } = render(
      <InvitationBackgroundTexture color="#FFFFFF" texture={texture} />
    );
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });
});
