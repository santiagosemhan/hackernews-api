/**
 * Turn a month name (string) into a number. For example, 'january' becomes 0.
 * @param {string} month - The month name. Example: 'january'
 * @throws {Error} Invalid month
 * @returns {number} The month number. Example: 0
 */
function turnMonthIntoNumber(month: string): number {
  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const monthIndex = monthNames.indexOf(month.toLowerCase());

  if (monthIndex === -1) {
    throw new Error('Invalid month');
  }

  return monthIndex;
}

/**
 * Check if an object is empty
 * @param obj - The object to check
 * @returns {boolean} True if the object is empty, false otherwise
 */
function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

export { turnMonthIntoNumber, isEmpty };
