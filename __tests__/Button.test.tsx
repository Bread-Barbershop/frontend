import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';
import * as ButtonStories from '@/components/Button.stories'; // 모든 스토리 import

describe('Button 컴포넌트 (스토리 args 재사용)', () => {
  const testCases = [
    { story: ButtonStories.TemplatePrimaryButton, label: 'Primary' },
  ];

  testCases.forEach(({ story, label }) => {
    it(`${label} 버튼 렌더링`, () => {
      render(<Button {...story.args} onClick={jest.fn()} />);
      expect(
        screen.getByText(story.args.children as string)
      ).toBeInTheDocument();
    });

    it(`${label} 클릭 이벤트 작동`, () => {
      const handleClick = jest.fn();
      render(<Button {...story.args} onClick={handleClick} />);
      fireEvent.click(screen.getByText(story.args.children as string));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
