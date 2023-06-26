export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;
const intervals = [
  { ge: YEAR, divisor: YEAR, unit: 'year' },
  { ge: MONTH, divisor: MONTH, unit: 'month' },
  { ge: WEEK, divisor: WEEK, unit: 'week' },
  { ge: DAY, divisor: DAY, unit: 'day' },
  { ge: HOUR, divisor: HOUR, unit: 'hour' },
  { ge: MINUTE, divisor: MINUTE, unit: 'minute' },
  { ge: SECOND, divisor: SECOND, unit: 'seconds' },
  { ge: 0, divisor: 1, text: 'now' },
];
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/**
 * @param test {number}
 * @param [now] {number}
 * @return {string}
 */
export function timeFromNow(test: number, now: number): string {
  const delta = now - test;
  const absDelta = Math.abs(delta);
  let rv = '';

  for (const interval of intervals) {
    if (absDelta >= interval.ge) {
      const time = Math.trunc(delta / interval.divisor);
      rv = interval.unit
        ? rtf.format(-time, interval.unit as Intl.RelativeTimeFormatUnit)
        : interval.text || '';
      break;
    }
  }

  return rv;
}
