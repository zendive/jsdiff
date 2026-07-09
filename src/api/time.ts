export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;
const PERIODS: [number, Intl.RelativeTimeFormatUnit][] = [
  [SECOND, 'second'],
  [MINUTE, 'minute'],
  [HOUR, 'hour'],
  [DAY, 'day'],
  [WEEK, 'week'],
  [MONTH, 'month'],
  [YEAR, 'year'],
];
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const dtf = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'full',
  timeStyle: 'full',
});

export function timeFromNow(test: number, now: number): string {
  const delta = test - now;
  const absDelta = Math.abs(delta);

  if (absDelta < SECOND) {
    return rtf.format(0, 'second');
  }

  for (let n = 0; n < PERIODS.length; n++) {
    const [curPeriod, curUnit] = PERIODS[n] || [];
    const [nextPeriod] = PERIODS[n + 1] || [];

    if (
      curPeriod && curUnit &&
      absDelta >= curPeriod &&
      (nextPeriod ? absDelta < nextPeriod : true)
    ) {
      return rtf.format(Math.trunc(delta / curPeriod), curUnit);
    }
  }

  return '';
}

export function timeToString(time: number): string {
  return dtf.format(time);
}
