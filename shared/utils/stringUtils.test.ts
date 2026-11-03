import {
  parseValue,
  sanitizeEnglishTitle,
  sanitizeEnglishTitleInput,
} from './stringUtils';

describe('stringUtils', () => {
  describe('parseValue', () => {
    it('parses valid numeric values after replacement', () => {
      expect(parseValue('100px', 'px', '')).toBe(100);
      expect(parseValue('  50 % ', '%', '')).toBe(50);
    });

    it('returns null for non-numeric or invalid values', () => {
      expect(parseValue('abc', 'a', '')).toBeNull();
      expect(parseValue('invalid', '', '')).toBeNull();
    });
  });

  describe('sanitizeEnglishTitle', () => {
    it('allows English letters, numbers, and special characters', () => {
      expect(sanitizeEnglishTitle("Don't Be Late!")).toBe("Don't Be Late!");
      expect(sanitizeEnglishTitle('2026. 11. 03 - Part 1 & 2!')).toBe(
        '2026. 11. 03 - Part 1 & 2!'
      );
      expect(sanitizeEnglishTitle('Save the Date #1 @ Venue (100% Love)')).toBe(
        'Save the Date #1 @ Venue (100% Love)'
      );
    });

    it('normalizes smart quotes and dashes to standard ASCII', () => {
      expect(sanitizeEnglishTitle('Don’t Be Late!')).toBe("Don't Be Late!");
      expect(sanitizeEnglishTitle('“Welcome” – 2026')).toBe('"Welcome" - 2026');
    });

    it('removes Korean characters while preserving English, numbers, and special characters', () => {
      expect(sanitizeEnglishTitle("인사말 Don't Be Late! 123")).toBe(
        " Don't Be Late! 123"
      );
      expect(sanitizeEnglishTitle('모바일 초대장 2026')).toBe('  2026');
      expect(sanitizeEnglishTitle('ㄱㄴㄷabc!@#')).toBe('abc!@#');
    });
  });

  describe('sanitizeEnglishTitleInput', () => {
    it('updates input.value and returns sanitized string preserving spaces', () => {
      const input = document.createElement('input');
      input.value = "  Don't Be Late! 123  ";

      const result = sanitizeEnglishTitleInput(input);
      expect(result).toBe("  Don't Be Late! 123  ");
      expect(input.value).toBe("  Don't Be Late! 123  ");
    });

    it('cleans Korean input and synchronizes input.value', () => {
      const input = document.createElement('input');
      input.value = "한글 Don't Be Late!";

      const result = sanitizeEnglishTitleInput(input);
      expect(result).toBe(" Don't Be Late!");
      expect(input.value).toBe(" Don't Be Late!");
    });

    it('preserves trailing spaces during input so typing spaces works', () => {
      const input = document.createElement('input');
      input.value = 'ACCOUNT ';

      const result = sanitizeEnglishTitleInput(input);
      expect(result).toBe('ACCOUNT ');
      expect(input.value).toBe('ACCOUNT ');
    });
  });
});
