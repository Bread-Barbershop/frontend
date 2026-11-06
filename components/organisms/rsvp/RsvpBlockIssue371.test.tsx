import { render, screen } from '@testing-library/react';

import { RsvpBlock } from './RsvpBlock';

import type { EditorBlock } from '@/shared/types/block';

describe('RSVP 편집기 Google Forms 링크 안내', () => {
  it('관리 링크에는 응답자용 링크 오류와 안내를 표시한다', () => {
    const blockInfo: EditorBlock<'rsvp'> = {
      id: 'rsvp-block',
      type: 'wedding',
      component: 'rsvp',
      props: {
        title: '참석 여부 안내',
        description: '참석 가능 여부를 알려주세요.',
        formUrl: 'https://docs.google.com/forms/d/example/edit',
        buttonText: '참석 여부 응답하기',
      },
    };

    render(<RsvpBlock blockInfo={blockInfo} id={blockInfo.id} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '응답자용 Google Forms HTTPS 링크를 입력해 주세요.'
    );
    expect(
      screen.getByText('Google Forms에서 응답자용 링크를 복사해 입력하세요.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/\/edit|\/responses|\/create/)
    ).not.toBeInTheDocument();
  });
});
