import {
  parseDateInfo,
  generateCalendarGrid,
  getFormattedTimeLabel,
  getMonthText,
  getWeekdayStr,
  getFormattedTimeStr,
} from './utils';


describe('Calendar Utils 단위 테스트', () => {
  /**
   * parseDateInfo 함수 테스트
   * 목적: 날짜 문자열(YYYY-MM-DD)이 올바른 객체 구조로 파싱되는지 확인
   */
  describe('parseDateInfo', () => {
    it('올바른 날짜 문자열을 파싱해야 함', () => {
      const result = parseDateInfo('2026-03-09');
      expect(result).toEqual({
        year: 2026,
        month: 3,
        day: 9,
        dayOfWeek: 1, // 2026-03-09는 월요일(1)
      });
    });

    it('날짜가 없을 경우 현재 날짜를 기반으로 반환해야 함', () => {
      const result = parseDateInfo();
      const now = new Date();
      expect(result.year).toBe(now.getFullYear());
      expect(result.month).toBe(now.getMonth() + 1);
    });
  });

  /**
   * generateCalendarGrid 함수 테스트
   * 목적: 특정 월의 달력 그리드가 이전/다음 달을 포함해 총 42칸(6주)으로 생성되는지 확인
   */
  describe('generateCalendarGrid', () => {
    it('핵심 42개 날짜 정보를 생성해야 함', () => {
      // 2026년 3월 기준 (3월 1일은 일요일)
      const grid = generateCalendarGrid(2026, 2, 9); // 2는 3월(0-indexed)
      expect(grid.length).toBe(42);
      
      // 3월 9일이 타겟 날짜로 설정되었는지 확인
      const targetDay = grid.find(d => d.num === 9 && d.isCurrentMonth);
      expect(targetDay?.isTargetDate).toBe(true);
      
      // 3월 1일(일요일) 앞에는 이전 달 데이터가 없어야 함(offset 0)
      expect(grid[0].num).toBe(1);
      expect(grid[0].isCurrentMonth).toBe(true);
    });
  });

  /**
   * getMonthText 함수 테스트
   * 목적: 설정된 언어(KO/EN)와 포맷에 따라 올바른 월 이름을 반환하는지 확인
   */
  describe('getMonthText', () => {
    it('한국어 월 이름을 반환해야 함', () => {
      expect(getMonthText(3, 'ko')).toBe('3월');
    });

    it('영어 월 이름을 반환해야 함 (기본형)', () => {
      expect(getMonthText(3, 'en')).toBe('March');
    });

    it('영어 월 이름을 대문자로 반환해야 함 (Type 4용)', () => {
      expect(getMonthText(3, 'en', 'upper')).toBe('MARCH');
    });
  });

  /**
   * getFormattedTimeLabel 함수 테스트
   * 목적: 24시간 형식의 시간 문자열이 언어별로 읽기 좋은 형태로 변환되는지 확인
   */
  describe('getFormattedTimeLabel', () => {
    it('한국어 시간 포맷 (정시)', () => {
      expect(getFormattedTimeLabel('14:00', 'ko')).toBe('2시');
    });

    it('한국어 시간 포맷 (분 포함)', () => {
      expect(getFormattedTimeLabel('14:30', 'ko')).toBe('2시 30분');
    });

    it('영어 시간 포맷 (PM)', () => {
      expect(getFormattedTimeLabel('14:00', 'en')).toBe('2 PM');
    });

    it('영어 시간 포맷 (AM)', () => {
      expect(getFormattedTimeLabel('09:30', 'en')).toBe('9:30 AM');
    });
  });

  /**
   * getWeekdayStr 함수 테스트
   * 목적: Date 객체로부터 언어별 요일 문자열을 올바르게 가져오는지 확인
   */
  describe('getWeekdayStr', () => {
    it('한국어 요일을 반환해야 함', () => {
      const date = new Date(2026, 2, 9); // 월요일
      expect(getWeekdayStr(date, 'ko')).toBe('월');
    });

    it('영어 요일을 반환해야 함', () => {
      const date = new Date(2026, 2, 9); // 월요일
      expect(getWeekdayStr(date, 'en')).toBe('MON');
    });
  });

  /**
   * getFormattedTimeStr 함수 테스트
   * 목적: 다양한 요일 및 시간 입력 형식을 받았을 때 "요일 오전/오후 H시 [M분]" 형태로 포맷팅되는지 확인
   */
  describe('getFormattedTimeStr', () => {
    it('24시간제 형식을 올바르게 포맷팅해야 함 (오후)', () => {
      expect(getFormattedTimeStr(1, '14:30')).toBe('월요일 오후 2시 30분');
    });

    it('24시간제 형식을 올바르게 포맷팅해야 함 (오전)', () => {
      expect(getFormattedTimeStr(2, '09:00')).toBe('화요일 오전 9시');
    });

    it('오전/오후 HH:MM 형식을 올바르게 포맷팅해야 함 (오후)', () => {
      expect(getFormattedTimeStr(3, '오후 12:00')).toBe('수요일 오후 12시');
    });

    it('오전/오후 HH:MM 형식을 올바르게 포맷팅해야 함 (오전)', () => {
      expect(getFormattedTimeStr(4, '오전 09:30')).toBe('목요일 오전 9시 30분');
    });

    it('오후 01:00 형식을 올바르게 포맷팅해야 함', () => {
      expect(getFormattedTimeStr(5, '오후 01:15')).toBe('금요일 오후 1시 15분');
    });

    it('시간이 없을 때 요일만 반환해야 함', () => {
      expect(getFormattedTimeStr(0)).toBe('일요일');
    });

    it('00:00은 오전 12시로 표시해야 함', () => {
      expect(getFormattedTimeStr(6, '00:00')).toBe('토요일 오전 12시');
    });
  });
});

