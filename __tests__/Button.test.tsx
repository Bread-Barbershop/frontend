import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from '@/components/Button';
import { Primary, Large } from '@/components/Button.stories';

describe('Button 컴포넌트 (스토리 args 재사용)', () => {
  it('Primary 버튼 렌더링', () => {
    render(<Button {...Primary.args} onClick={jest.fn()} />); // 테스트용 이벤트 덮어쓰기
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('Large 버튼 렌더링', () => {
    render(<Button {...Large.args} onClick={jest.fn()} />);
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('Primary 클릭 이벤트 작동', () => {
    const handleClick = jest.fn();
    render(<Button {...Primary.args} onClick={handleClick} />); // 테스트용 핸들러
    fireEvent.click(screen.getByText('Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Large 클릭 이벤트 작동', () => {
    const handleClick = jest.fn();
    render(<Button {...Large.args} onClick={handleClick} />);
    fireEvent.click(screen.getByText('Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
