export type DatePickerScalar = Date | string;
export type DatePickerValue = DatePickerScalar | DatePickerScalar[] | null;

export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

export function localDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function dateKey(value: unknown): string {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return '';
    return `${String(value.getFullYear()).padStart(4, '0')}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  const key = typeof value === 'string' ? value.slice(0, 10) : '';
  return parseDate(key) ? key : '';
}

/** Parse a calendar date without UTC conversion or JavaScript's invalid-day rollover. */
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = localDate(year, month, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

export function parseTime(value: string): TimeParts | null {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i.exec(value);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
  if (match[4]) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (match[4].toUpperCase() === 'PM' ? 12 : 0);
  }
  return hour <= 23 && minute <= 59 && second <= 59
    ? { hour, minute, second }
    : null;
}

export function parseDateTime(value: unknown, timeOnly = false): Date | null {
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? new Date(value) : null;
  if (typeof value !== 'string' || !value) return null;
  const [day, time] = timeOnly
    ? ['1970-01-01', value]
    : value.split(/[T ](?=\d{1,2}:)/);
  const date = parseDate(day);
  if (!date) return null;
  if (time !== undefined) {
    const parts = parseTime(time);
    if (!parts) return null;
    date.setHours(parts.hour, parts.minute, parts.second, 0);
  }
  return date;
}

export function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function timeString(value: TimeParts, seconds: boolean): string {
  return `${pad(value.hour)}:${pad(value.minute)}${seconds ? `:${pad(value.second)}` : ''}`;
}

export function monthKey(value: Date): string {
  return dateKey(value).slice(0, 7);
}

export function positiveInteger(
  value: number,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number {
  return Number.isFinite(value) && value > 0
    ? Math.min(max, Math.max(1, Math.trunc(value)))
    : fallback;
}

export function isoWeekNumber(date: Date): number {
  const day = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  return Math.ceil(
    ((day.getTime() - Date.UTC(day.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7,
  );
}
