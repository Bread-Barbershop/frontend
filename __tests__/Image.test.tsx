import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as ImageStories from '@/components/atoms/image/Image.stories';
import { Image } from '@/components/atoms/image/Image';

jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => {
  return {
    __esModule: true,
    default: (props: any) => <svg data-testid="loading-spinner" {...props} />,
  };
});

describe('Image 컴포넌트 테스트', () => {
  it('기본 이미지 렌더링 및 로딩 완료 후 상태 변경 테스트', async () => {
    const { container } = render(<Image {...ImageStories.Default.args} />);

    // 처음 렌더링 시에는 LoadingSpinner(animate-spin 클래스 포함)가 보여야 함
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // 넘겨준 alt 속성으로 이미지 엘리먼트 검색
    const image = screen.getByAltText(ImageStories.Default.args!.alt as string);
    expect(image).toBeInTheDocument();

    // 이미지 로드 이벤트 발생
    fireEvent.load(image);

    // 로드가 완료되면 LoadingSpinner 엘리먼트가 사라져야 함
    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  it('이미지 로드 에러 시 스켈레톤 상태 테스트', async () => {
    const { container } = render(<Image {...ImageStories.Skeleton.args} />);

    // 처음에 로딩 표시
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    const image = screen.getByAltText(
      ImageStories.Skeleton.args!.alt as string
    );

    // 이미지 로드 에러 이벤트 발생
    fireEvent.error(image);

    // 에러 발생 시에도 무한 로딩을 피하기 위해 LoadingSpinner 엘리먼트가 사라져야 함
    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });
});
