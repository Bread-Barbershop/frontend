import { renderHook } from '@testing-library/react';
import { useCalendarData } from './useCalendarData';

describe('useCalendarData 훅 단위 테스트', () => {
  /**
   * useCalendarData 훅 테스트
   * 목적: 입력된 날짜와 언어 설정에 따라 템플릿 렌더링에 필요한 데이터가 올바르게 반환되는지 확인
   */
  it('기본 데이터를 올바르게 반환해야 함', () => {
    const { result } = renderHook(() =>
      useCalendarData({
        date: '2026-03-09',
        time: '오후 02:30',
        language: 'ko',
        template: 'calendarType1',
      })
    );

    // 1) 기본 날짜 정보 확인
    expect(result.current.currentYear).toBe(2026);
    expect(result.current.currentMonth).toBe(3);
    
    // 2) 포맷팅된 텍스트 확인 (KO)
    expect(result.current.monthText).toBe('3월');
    expect(result.current.targetLabel).toBe('결혼식');
    expect(result.current.timeLabel).toBe('2시 30분');
    
    // 3) 그리드 데이터 확인
    expect(result.current.calendarDays.length).toBe(42);
    const targetDay = result.current.calendarDays.find(d => d.num === 9 && d.isCurrentMonth);
    expect(targetDay?.isTargetDate).toBe(true);
  });

  it('영어(EN) 설정을 올바르게 반영해야 함', () => {
    const { result } = renderHook(() =>
      useCalendarData({
        date: '2026-03-09',
        time: '오후 02:30',
        language: 'en',
        template: 'calendarType1',
      })
    );

    // 1) 영어 포맷팅 텍스트 확인
    expect(result.current.monthText).toBe('March');
    expect(result.current.targetLabel).toBe('Wedding day');
    expect(result.current.timeLabel).toBe('2:30 PM');
    
    // 2) 영어 요일 헤더 확인
    expect(result.current.headerDays[0]).toBe('SUN');
  });

  /**
   * 템플릿별 필터링 테스트
   * 목적: template 설정에 따라 calendarDays의 개수가 의도대로 생성되는지 확인
   */
  it('calendarType5(5일 뷰) 템플릿일 때 5개의 날짜만 생성해야 함', () => {
    const { result } = renderHook(() =>
      useCalendarData({
        date: '2026-03-09',
        language: 'ko',
        template: 'calendarType5',
      })
    );

    expect(result.current.calendarDays.length).toBe(5);
  });

  it('calendarType2(1주일 뷰) 템플릿일 때 7개의 날짜만 생성해야 함', () => {
    const { result } = renderHook(() =>
      useCalendarData({
        date: '2026-03-09',
        language: 'ko',
        template: 'calendarType2',
      })
    );

    expect(result.current.calendarDays.length).toBe(7);
  });
});
