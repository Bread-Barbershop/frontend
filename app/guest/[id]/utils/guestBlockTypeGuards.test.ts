/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/guest/[id]/utils/guestBlockTypeGuards.ts 의 isGuestPayload 함수를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 정상 payload는 true를 반환하는지
 * 2) blocks가 배열이 아니면 false를 반환하는지
 * 3) mainPoster 구조가 잘못되면 false를 반환하는지
 * 4) bgm 구조가 잘못되면 false를 반환하는지
 * 5) block 항목 구조가 잘못되면 false를 반환하는지
 *
 * 왜 중요한가:
 * GuestPage는 fetch한 공개 데이터를 바로 쓰지 않고,
 * 먼저 isGuestPayload로 구조를 검증한 뒤에만 렌더링한다.
 * 즉, 이 함수는 "공개 데이터 계약(Contract)"을 보장하는 핵심 방어 로직이다.
 */

import { isGuestPayload } from '@/app/guest/[id]/utils/guestBlockTypeGuards';

// ------------------------------
// 정상 payload 샘플
// isGuestPayload가 통과해야 하는 최소 조건에 맞춰 작성한다.
// ------------------------------
const validPayload = {
  mainPoster: {
    version: '1.0.0',
    objects: [],
    background: '#ffffff',
  },
  blocks: [
    {
      id: 'block-1',
      type: 'wedding',
      component: 'greeting',
      props: {
        title: '안녕하세요',
      },
    },
  ],
  bgm: {
    selectedBgmId: null,
    isLoop: false,
    volume: 0.2,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  },
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: {
      font: 'Inter',
      fontSize: '24px',
      color: '#000000',
      bold: false,
      italic: false,
      align: 'center',
      isDefault: true,
    },
    bodyData: {
      font: 'Inter',
      fontSize: '16px',
      color: '#000000',
      bold: false,
      italic: false,
      align: 'center',
      isDefault: true,
    },
  },
};

describe('isGuestPayload 테스트', () => {
  it('정상 payload이면 true를 반환한다', () => {
    /**
     * 목적:
     * GuestPage가 정상적으로 렌더링할 수 있는 최소 구조의 payload가
     * 타입 가드를 통과하는지 확인한다.
     */

    expect(isGuestPayload(validPayload)).toBe(true);
  });

  it('blocks가 배열이 아니면 false를 반환한다', () => {
    /**
     * 목적:
     * blocks는 반드시 배열이어야 하므로,
     * 배열이 아닌 경우 타입 가드가 실패해야 한다.
     */

    const invalidPayload = {
      ...validPayload,
      blocks: 'not-an-array',
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('mainPoster 구조가 잘못되면 false를 반환한다', () => {
    /**
     * 목적:
     * mainPoster는 최소한
     * - version: string
     * - objects: array
     * 구조를 가져야 한다.
     *
     * 여기서는 version을 number로 바꿔서 invalid payload를 만든다.
     */

    const invalidPayload = {
      ...validPayload,
      mainPoster: {
        version: 1234,
        objects: [],
      },
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('bgm 구조가 잘못되면 false를 반환한다', () => {
    /**
     * 목적:
     * bgm은 GuestPage가 사용하는 핵심 필드이므로
     * 필드 타입이 맞지 않으면 타입 가드가 실패해야 한다.
     *
     * 여기서는 isLoop를 boolean이 아닌 string으로 바꿔 invalid payload를 만든다.
     */

    const invalidPayload = {
      ...validPayload,
      bgm: {
        ...validPayload.bgm,
        isLoop: 'false',
      },
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('block 항목 구조가 잘못되면 false를 반환한다', () => {
    /**
     * 목적:
     * blocks 배열 안의 각 항목은 최소한
     * - id: string
     * - type: string
     * - component: string
     * - props 존재
     * 조건을 만족해야 한다.
     *
     * 여기서는 id를 제거해서 invalid block을 만든다.
     */

    const invalidPayload = {
      ...validPayload,
      blocks: [
        {
          type: 'wedding',
          component: 'greeting',
          props: {},
        },
      ],
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('bulkData 구조가 잘못되면 false를 반환한다', () => {
    /**
     * 목적:
     * bulkData는 backgroundColor, titleData, bodyData를 가져야 한다.
     */

    const invalidPayload = {
      ...validPayload,
      bulkData: {
        ...validPayload.bulkData,
        bodyData: undefined,
      },
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('bulkData.titleData 내의 align이 올바르지 않으면 false를 반환한다', () => {
    /**
     * 목적:
     * align은 'left' | 'center' | 'right' 중 하나여야 한다.
     */

    const invalidPayload = {
      ...validPayload,
      bulkData: {
        ...validPayload.bulkData,
        titleData: {
          ...validPayload.bulkData.titleData,
          align: 'justify',
        },
      },
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('bgm 자체가 객체가 아니면 false를 반환한다', () => {
    /**
     * 목적:
     * bgm은 반드시 객체여야 하므로,
     * null 같은 값이 들어오면 타입 가드가 실패해야 한다.
     */

    const invalidPayload = {
      ...validPayload,
      bgm: null,
    };

    expect(isGuestPayload(invalidPayload)).toBe(false);
  });

  it('payload가 객체가 아니면 false를 반환한다', () => {
    /**
     * 목적:
     * 최상위 payload 자체가 객체가 아니면
     * GuestPage에서 사용할 수 없으므로 false를 반환해야 한다.
     */

    expect(isGuestPayload(null)).toBe(false);
    expect(isGuestPayload('not-an-object')).toBe(false);
    expect(isGuestPayload(1234)).toBe(false);
  });
});
