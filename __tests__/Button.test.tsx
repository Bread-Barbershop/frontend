import { Button, ButtonProps } from '@/components/atoms/button/Button';

import * as ButtonStories from '@/components/atoms/button/Button.stories';

import { fireEvent, render, screen } from '@testing-library/react';

// describe 테스트 그룹화 : 같은 컴포넌트나 기능 단위로 테스트를 묶을 때 사용
// 첫 번째 인자 : 그룹 이름
// 두 번째 인자 : 콜백 함수안에 실제 테스트 코드(it)
describe('Button 컴포넌트 테스트', () => {
  // it 또는 test : 실제 하나의 테스트 케이스 정의
  // 첫 번쨰 인자 : 테스트 설명
  // 두 번째 인자 : 테스트 실행 함수
  it('Primary 버튼 렌더링', () => {
    // render : React 컴포넌트를 테스트 환경(DOM)에 렌더링
    // React Testing Library의 핵심 함수
    // 반환값 : query / select 관련 함수
    render(<Button {...(ButtonStories.Default.args as ButtonProps)} />);
    // screen : 렌더링된 DOM에 접근하는 전역 query 객체
    // render() 로 렌더링된 결과를 자동으로 참조
    // 정점 : 테스트마다 렌더링 결과를 변수에 담지 않아도 바로 조회 가능
    // 연계 : RTL의 query 함수(getByText, getByRole, queryByText 등)와 사용
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('Primary 버튼 클릭 이벤트', () => {
    const handleClick = jest.fn();
    render(
      <Button
        {...(ButtonStories.Default.args as ButtonProps)}
        onClick={handleClick}
      />
    );
    fireEvent.click(screen.getByText('Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
