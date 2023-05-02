import { turnMonthIntoNumber, isEmpty } from './utils';

describe('Utils', () => {
  describe('turnMonthIntoNumber', () => {
    it('should return 0 when month is January', () => {
      const monthNumber = turnMonthIntoNumber('january');
      expect(monthNumber).toBe(0);
    });

    it('should return 11 when month is December', () => {
      const monthNumber = turnMonthIntoNumber('december');
      expect(monthNumber).toBe(11);
    });

    it('should throw an error when month is invalid', () => {
      expect(() => {
        turnMonthIntoNumber('invalid month');
      }).toThrowError('Invalid month');
    });
  });

  describe('isEmpty', () => {
    it('should return true when object is empty', () => {
      const emptyObject = {};
      const result = isEmpty(emptyObject);
      expect(result).toBe(true);
    });

    it('should return false when object is not empty', () => {
      const notEmptyObject = { key: 'value' };
      const result = isEmpty(notEmptyObject);
      expect(result).toBe(false);
    });
  });
});
