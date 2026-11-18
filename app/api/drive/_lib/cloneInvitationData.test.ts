import { remapInvitationJson } from './cloneInvitationData';

describe('복제하는 초대장 본문의 공유 링크', () => {
  it('가족 초대장 자체를 가리키는 링크만 친구 초대장으로 교체한다', () => {
    const guestUrl = 'https://invia.test/i/sample?to=friends';
    const sourceDataId = 'family-data-id';
    const links = {
      share: 'https://invia.test/i/sample?to=family',
      body: [
        '/i/sample?ref=body&to=family',
        '/i/sample',
        '/i/sample?to=colleagues',
        '/i/sample?to=family&to=colleagues',
        '/i/sample?to=',
        `/guest/${sourceDataId}`,
        `/guest/${sourceDataId}?to=colleagues`,
      ],
    };

    const copy = remapInvitationJson(links, {
      ids: new Map(),
      sourceLinks: new Set([links.share]),
      sourceDataId,
      guestUrl,
    });

    expect(copy).toEqual({
      share: guestUrl,
      body: [
        guestUrl,
        '/i/sample',
        '/i/sample?to=colleagues',
        '/i/sample?to=family&to=colleagues',
        '/i/sample?to=',
        guestUrl,
        `/guest/${sourceDataId}?to=colleagues`,
      ],
    });
  });

  it('기본 초대장 링크를 복제할 때 명시된 하객별 링크는 유지한다', () => {
    const guestUrl = '/i/copy';
    const sourceDataId = 'root-data-id';
    const shortPath = '/i/sample';
    const legacyPath = `/guest/${sourceDataId}`;

    expect(
      remapInvitationJson(
        [
          shortPath,
          legacyPath,
          `${shortPath}?to=family`,
          `${legacyPath}?to=family`,
        ],
        {
          ids: new Map(),
          sourceLinks: new Set([`https://invia.test${shortPath}`]),
          sourceDataId,
          guestUrl,
        }
      )
    ).toEqual([
      guestUrl,
      guestUrl,
      `${shortPath}?to=family`,
      `${legacyPath}?to=family`,
    ]);
  });
});
