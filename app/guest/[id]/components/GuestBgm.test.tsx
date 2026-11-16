import { fireEvent, render, screen } from '@testing-library/react';

import GuestBgm from './GuestBgm';

const bgm = {
  selectedBgmId: 'user-bgm',
  isLoop: true,
  volume: 0.2,
  userBgmTitle: '우리 노래',
  userBgmDuration: '03:00',
  userBgmFileId: null,
};

describe('미업로드 배경음악 미리보기', () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});
    jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('미리보기에서는 로컬 음악을 사용자 조작 후 재생한다', () => {
    const { container } = render(
      <GuestBgm
        bgm={bgm}
        mode="dashboard-preview"
        localAudioSrc="blob:our-song"
      />
    );
    const audio = container.querySelector('audio');
    expect(audio).not.toHaveAttribute('src');
    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }));
    expect(audio).toHaveAttribute('src', 'blob:our-song');
    expect(
      screen.getByRole('button', { name: '배경음악 끄기' })
    ).toBeInTheDocument();
  });

  it('공개 모드에서는 로컬 미리보기 주소를 사용하지 않는다', () => {
    const { container } = render(
      <GuestBgm bgm={bgm} localAudioSrc="blob:our-song" />
    );
    expect(container.querySelector('audio')).not.toHaveAttribute('src');
    expect(
      screen.queryByRole('button', { name: '배경음악 켜기' })
    ).not.toBeInTheDocument();
  });
});
