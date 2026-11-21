import type { GuestPayload } from '@/app/guest/[id]/types/guestTypes';
import { DEFAULT_SCROLL_ANIMATION } from '@/components/molecules/scroll-fade-in/animationConfig';

import { applyInvitationPrivacy } from './applyInvitationPrivacy';
import { INVITATION_PRIVACY_FIELDS } from './settings';

const bulkStyle = {
  font: 'Pretendard',
  fontSize: '14px',
  color: '#000',
  fontWeight: '400',
  isDefault: false,
};
const block = (component: string, props: unknown) => ({
  id: component,
  type: 'wedding',
  component,
  props,
});

function makeInvitation(): GuestPayload {
  return {
    bulkData: {
      backgroundColor: '#fff',
      titleData: bulkStyle,
      bodyData: bulkStyle,
      isZoom: false,
      scrollAnimation: DEFAULT_SCROLL_ANIMATION,
      invitationPrivacy: {
        enabled: true,
        eventDate: '2026-11-21',
        fields: INVITATION_PRIVACY_FIELDS.map(({ key }) => key),
      },
    },
    bgm: {
      selectedBgmId: null,
      isLoop: false,
      volume: 0.2,
      userBgmTitle: null,
      userBgmDuration: null,
      userBgmFileId: null,
    },
    mainPoster: {
      version: '1',
      objects: [],
      thumbnailFileId: 'poster-file-id',
    },
    blocks: [
      block('phone', {
        groups: [
          {
            id: 'family',
            name: '혼주',
            contacts: [
              { id: 'contact', label: '박민준', number: '01012345678' },
            ],
          },
        ],
      }),
      block('account', {
        groupList: [{ name: '신랑 측' }],
        accountList: [
          [
            {
              name: '박민준',
              bank: '신한',
              account: '123-1234',
              kakao: true,
              kakaoPayUrl: 'original-kakao',
              tossUrl: 'original-toss',
            },
          ],
        ],
      }),
      block('myFamilyWedding', {
        groomFamily: [{ id: 'parent', name: '박지수' }],
        brideFamily: [],
      }),
      block('myChild', {
        name: '이하늘',
        nickname: '구름',
        birthday: '2025.04.18',
        image: ['baby-file-id'],
      }),
      block('coupleIntroduction', {
        groom: '박민준',
        bride: '이세연',
        groomImage: { id: 'src', image: ['groom-file-id'] },
      }),
      block('speakerInformation', {
        speakers: [
          { id: 'speaker', name: '이서준', image: ['speaker-file-id'] },
        ],
      }),
      block('video', { videoUrl: 'original-video' }),
      block('gallery', { images: ['gallery-file-id'] }),
      block('photoStory', { pages: [{ id: 'first', image: ['story-file-id'] }] }),
      block('place', {
        placeName: 'private-place',
        placeAddress: 'private-address',
        lat: 37.599,
        lng: 127.123,
      }),
    ],
    shareUrl: {
      title: '박민준의 초대장',
      urlTitle: '박민준의 결혼식',
      description: '',
      urlDescription: '',
      images: ['kakao-file-id'],
      urlImage: ['og-file-id'],
      showLocationButton: true,
      locationInfo: { placeName: 'private-place', lat: 37.599, lng: 127.123 },
    },
    renderHints: {
      schemaVersion: 1,
      fonts: [],
      aboveTheFoldBlockIds: [],
      primaryImageFileIds: ['gallery-file-id'],
    },
  };
}

const cutoff = Date.parse('2026-11-21T15:00:00.000Z');

describe('행사일 이후 공개 초대장', () => {
  it('행사일에는 기존 표시를 유지하고 한국 시간 다음 날 자정부터 가린다', () => {
    const original = makeInvitation();
    expect(applyInvitationPrivacy(original, cutoff - 1)).toBe(original);
    expect(
      applyInvitationPrivacy(original, cutoff).activePrivacyFields
    ).toHaveLength(7);
  });

  it('휴대전화와 계좌는 형식을 유지하고 생년월일과 여러 곳의 성함을 가린다', () => {
    const projected = applyInvitationPrivacy(makeInvitation(), cutoff);
    const props = (component: string) =>
      projected.blocks.find(block => block.component === component)?.props;
    expect(props('phone')).toMatchObject({
      groups: [{ contacts: [{ number: '010-****-****' }] }],
    });
    expect(props('account')).toMatchObject({
      accountList: [
        [{ name: '박○○', bank: '**', account: '***-****', kakao: false }],
      ],
    });
    expect(props('myFamilyWedding')).toMatchObject({
      groomFamily: [{ name: '박○○' }],
    });
    expect(props('myChild')).toMatchObject({
      nickname: '구○',
      birthday: '****.**.**',
    });
    expect(props('coupleIntroduction')).toMatchObject({
      groom: '박○○',
      bride: '이○○',
    });
    expect(props('speakerInformation')).toMatchObject({
      speakers: [{ name: '이○○' }],
    });
  });

  it('공개 응답에서 선택한 원본 미디어와 위치 및 송금 데이터를 제외한다', () => {
    const original = makeInvitation();
    const projected = applyInvitationPrivacy(original, cutoff);
    const result = JSON.stringify(projected);
    for (const confidential of [
      'poster-file-id',
      'gallery-file-id',
      'story-file-id',
      'baby-file-id',
      'groom-file-id',
      'speaker-file-id',
      'kakao-file-id',
      'og-file-id',
      'original-video',
      'original-kakao',
      'original-toss',
      'private-address',
      'private-place',
      '박민준',
      '01012345678',
      '123-1234',
      '2025.04.18',
    ]) {
      expect(result).not.toContain(confidential);
    }
    expect(projected.blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          component: 'gallery',
          privacyPlaceholder: 'photo',
        }),
        expect.objectContaining({
          component: 'video',
          privacyPlaceholder: 'video',
        }),
        expect.objectContaining({
          component: 'place',
          privacyPlaceholder: 'location',
        }),
      ])
    );
    expect(original.mainPoster.thumbnailFileId).toBe('poster-file-id');
  });

  it('계좌만 가리면 예금주명과 장소, 미디어는 유지한다', () => {
    const original = makeInvitation();
    original.bulkData.invitationPrivacy!.fields = ['account'];
    const projected = applyInvitationPrivacy(original, cutoff);
    expect(projected.mainPoster).toBe(original.mainPoster);
    expect(projected.blocks.find(item => item.component === 'place')).toEqual(
      original.blocks.find(item => item.component === 'place')
    );
    expect(
      projected.blocks.find(item => item.component === 'account')?.props
    ).toMatchObject({
      accountList: [[{ name: '박민준', bank: '**', account: '***-****' }]],
    });
  });

  it('생년월일을 선택하면 아이 소개 외의 답변과 편집 문구에서도 생년월일을 가린다', () => {
    const original = makeInvitation();
    original.bulkData.invitationPrivacy!.fields = ['birthday'];
    original.blocks = [
      block('faq', {
        items: [
          { question: '아이의 생년월일은 언제인가요?', answer: '2025. 08. 11' },
          {
            question: '생년월일은 언제인가요?',
            answer: '초대장을 2026년 11월 1일에 보냈어요. 아이는 2025년 8월 11일에 태어났어요.',
          },
          { question: '일정은 언제인가요?', answer: '2026. 11. 21' },
        ],
      }),
      block('greeting', {
        messageHtml:
          '<p><strong>태어난 날:</strong> 2025년 <em>8월</em> 11일. 일정: 2026년 11월 21일</p>',
        messageJson: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '태어난 날:', marks: [{ type: 'bold' }] },
                { type: 'text', text: ' 2025년 ' },
                { type: 'text', text: '8월', marks: [{ type: 'italic' }] },
                { type: 'text', text: ' 11일. 일정: 2026년 11월 21일' },
              ],
            },
          ],
        },
      }),
      block('calendar', { date: '2026-11-21' }),
      block('countdown', { eventDateTime: '2026-11-21T13:00' }),
    ];

    const guest = applyInvitationPrivacy(original, cutoff);

    expect(guest.blocks[0].props).toMatchObject({
      items: [
        { answer: '****. **. **' },
        {
          answer: '초대장을 2026년 11월 1일에 보냈어요. 아이는 ****년 *월 **일에 태어났어요.',
        },
        { answer: '2026. 11. 21' },
      ],
    });
    expect(guest.blocks[1].props).toMatchObject({
      messageHtml:
        '<p><strong>태어난 날:</strong> ****년 <em>*월</em> **일. 일정: 2026년 11월 21일</p>',
      messageJson: {
        content: [
          {
            content: [
              { text: '태어난 날:', marks: [{ type: 'bold' }] },
              { text: ' ****년 ' },
              { text: '*월', marks: [{ type: 'italic' }] },
              { text: ' **일. 일정: 2026년 11월 21일' },
            ],
          },
        ],
      },
    });
    expect(guest.blocks.slice(2)).toEqual(original.blocks.slice(2));
    expect(JSON.stringify(original)).toContain('2025. 08. 11');
  });

  it('중첩된 생년월일과 본문에 반복한 날짜를 가리고 일정과 이미지 경로는 유지한다', () => {
    const original = makeInvitation();
    original.bulkData.invitationPrivacy!.fields = ['birthday'];
    original.blocks = [
      block('speakerInformation', {
        speakers: [{ name: '이서준', dateOfBirth: '1989-08-11' }],
      }),
      block('myChild', { birthday: '2025. 08. 11' }),
      block('greeting', {
        title: '2025년 8월 11일부터 함께한 우리',
        messageHtml:
          '<p>2025/08/11 첫 만남. 행사일: 2025/08/11. 2026/11/21에 봐요.</p>',
        image: ['https://example.test/2025-08-11/image.png'],
      }),
    ];

    const guest = applyInvitationPrivacy(original, cutoff);

    expect(guest.blocks[0].props).toMatchObject({
      speakers: [{ name: '이서준', dateOfBirth: '****-**-**' }],
    });
    expect(guest.blocks[1].props).toMatchObject({ birthday: '****. **. **' });
    expect(guest.blocks[2].props).toMatchObject({
      title: '****년 *월 **일부터 함께한 우리',
      messageHtml:
        '<p>****/**/** 첫 만남. 행사일: 2025/08/11. 2026/11/21에 봐요.</p>',
      image: ['https://example.test/2025-08-11/image.png'],
    });
  });

  it('이름을 포함한 생년월일 문답과 생일 표시를 가리고 생일 행사 날짜는 유지한다', () => {
    const original = makeInvitation();
    original.bulkData.invitationPrivacy!.fields = ['birthday'];
    original.blocks = [
      block('faq', {
        items: [
          { question: '민준이의 생년월일은 언제인가요?', answer: '2025.08.11' },
          { question: '생일은 언제인가요?', answer: '2025.08.11' },
          { question: '생일 파티는 언제인가요?', answer: '2026.11.21' },
        ],
      }),
      block('greeting', {
        messageHtml: '<p>생일: 2025.08.11 · 생일 행사: 2026.11.21</p>',
      }),
    ];

    const guest = applyInvitationPrivacy(original, cutoff);

    expect(guest.blocks[0].props).toMatchObject({
      items: [
        { answer: '****.**.**' },
        { answer: '****.**.**' },
        { answer: '2026.11.21' },
      ],
    });
    expect(guest.blocks[1].props).toMatchObject({
      messageHtml: '<p>생일: ****.**.** · 생일 행사: 2026.11.21</p>',
    });
  });

  it('후원사 이름과 로고를 하객의 개인정보 설정에 따라 각각 가린다', () => {
    const original = makeInvitation();
    const sponsor = block('sponsorshipInfomation', {
      images: ['private-sponsor-logo'],
      sponsors: [{ id: 'a', name: '한빛재단', logoIndex: 0 }],
    });
    original.blocks = [sponsor];
    original.bulkData.invitationPrivacy!.fields = ['media'];
    const mediaHidden = applyInvitationPrivacy(original, cutoff);
    expect(mediaHidden.blocks[0]).toMatchObject({
      privacyMediaHidden: true,
      props: { images: [], sponsors: [{ name: '한빛재단', logoIndex: null }] },
    });
    expect(JSON.stringify(mediaHidden)).not.toContain('private-sponsor-logo');
    original.bulkData.invitationPrivacy!.fields = ['name'];
    const nameHidden = applyInvitationPrivacy(original, cutoff);
    expect(nameHidden.blocks[0].props).toMatchObject({
      images: ['private-sponsor-logo'],
      sponsors: [{ name: '한○○○', logoIndex: 0 }],
    });
  });

  it('공지사항의 업로드 사진만 가리고 안내 문구와 소유자의 원본을 유지한다', () => {
    const original = makeInvitation();
    const notice = block('notice', {
      noticeList: [
        { id: 'a', notice: '주차 안내', image: ['private-notice-photo'] },
        { id: 'b', notice: '식사 안내', image: [] },
      ],
    });
    original.blocks = [notice];
    original.bulkData.invitationPrivacy!.fields = ['media'];

    const guest = applyInvitationPrivacy(original, cutoff);
    expect(guest.blocks[0]).toMatchObject({
      privacyMediaHidden: true,
      props: {
        noticeList: [
          { id: 'a', notice: '주차 안내', image: [] },
          { id: 'b', notice: '식사 안내', image: [] },
        ],
      },
    });
    expect(JSON.stringify(guest)).not.toContain('private-notice-photo');
    expect(JSON.stringify(notice)).toContain('private-notice-photo');
    original.bulkData.invitationPrivacy!.fields = ['phone'];
    expect(applyInvitationPrivacy(original, cutoff).blocks[0]).toBe(notice);
  });
});
