import type { GuestPayload } from '@/app/guest/[id]/types/guestTypes';

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
});
