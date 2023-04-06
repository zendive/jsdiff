const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
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
export function timeFromNow(test: number, now: number) {
  const delta = now - test;
  const absDelta = Math.abs(delta);

  for (const interval of intervals) {
    if (absDelta >= interval.ge) {
      const time = Math.trunc(delta / interval.divisor);
      return interval.unit
        ? rtf.format(-time, interval.unit as Intl.RelativeTimeFormatUnit)
        : interval.text;
    }
  }
}
