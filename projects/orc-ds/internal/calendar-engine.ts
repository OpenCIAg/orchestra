/**
 * Shared calendar engine.
 *
 * One signal-based date engine backs the surviving date contracts: the
 * popup date picker (`orc-date-picker` with its embedded month grids and
 * time editor), the inline calendar (`orc-calendar`), and the native
 * date input (`orc-date-input`). The engine owns the ISO date core
 * (local-date construction, key parsing without UTC conversion or day
 * rollover), the six-week month-grid generation with per-contract
 * disable policies, the locale-aware localization seams (week start,
 * weekday and month labels), the roving-day keyboard state machine, the
 * single/multiple/range selection algebra, and the PrimeNG-era
 * `dateFormat` pattern parsing kept for the production consumer until
 * the 23.0.0 gate. Nothing here is a public component API.
 */

export type CalendarEngineTimeParts = {
  hour: number;
  minute: number;
  second: number;
};

export type CalendarEngineSelectionMode = 'single' | 'multiple' | 'range';

/** Build a local calendar date without UTC conversion or year offsets. */
export function calendarLocalDate(
  year: number,
  month: number,
  day: number,
): Date {
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Zero-pad a number to two digits (ISO key building block). */
export function calendarPad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * The `yyyy-MM-dd` key of a Date or date-like string, or '' when the
 * value is not a real calendar date.
 */
export function calendarDateKey(value: unknown): string {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return '';
    return `${String(value.getFullYear()).padStart(4, '0')}-${calendarPad(value.getMonth() + 1)}-${calendarPad(value.getDate())}`;
  }
  const key = typeof value === 'string' ? value.slice(0, 10) : '';
  return calendarParseDate(key) ? key : '';
}

/** Parse `yyyy-MM-dd` without JavaScript's invalid-day rollover. */
export function calendarParseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = calendarLocalDate(year, month, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

/** Parse a clock time, including a 12-hour AM/PM suffix. */
export function calendarParseTime(
  value: string,
): CalendarEngineTimeParts | null {
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

/** Parse a date, date-time, or (when timeOnly) bare time into a Date. */
export function calendarParseDateTime(
  value: unknown,
  timeOnly = false,
): Date | null {
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? new Date(value) : null;
  if (typeof value !== 'string' || !value) return null;
  const [day, time] = timeOnly
    ? ['1970-01-01', value]
    : value.split(/[T ](?=\d{1,2}:)/);
  const date = calendarParseDate(day);
  if (!date) return null;
  if (time !== undefined) {
    const parts = calendarParseTime(time);
    if (!parts) return null;
    date.setHours(parts.hour, parts.minute, parts.second, 0);
  }
  return date;
}

/** Format time parts as `HH:mm` with an optional `:ss` suffix. */
export function calendarTimeString(
  value: CalendarEngineTimeParts,
  seconds: boolean,
): string {
  return `${calendarPad(value.hour)}:${calendarPad(value.minute)}${seconds ? `:${calendarPad(value.second)}` : ''}`;
}

/** The `yyyy-MM` key of a date. */
export function calendarMonthKey(value: Date): string {
  return calendarDateKey(value).slice(0, 7);
}

/** The first day of the `yyyy-MM` month key, tolerating malformed keys. */
export function calendarMonthStart(monthKey: string): Date {
  const [year, month] = monthKey.split('-').map(Number);
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? month - 1 : new Date().getMonth();
  return calendarLocalDate(safeYear, safeMonth + 1, 1);
}

/** A positive integer clamped to `max`, or the fallback when unusable. */
export function calendarPositiveInteger(
  value: number,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number {
  return Number.isFinite(value) && value > 0
    ? Math.min(max, Math.max(1, Math.trunc(value)))
    : fallback;
}

/** The ISO-8601 week number of a date. */
export function calendarIsoWeekNumber(date: Date): number {
  const day = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  return Math.ceil(
    ((day.getTime() - Date.UTC(day.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7,
  );
}

/** Shift a date by whole months, clamping the day to the target month. */
export function calendarShiftMonth(date: Date, months: number): Date {
  const targetMonth = calendarLocalDate(
    date.getFullYear(),
    date.getMonth() + 1 + months,
    1,
  );
  const lastDay = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  ).getDate();
  return calendarLocalDate(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    Math.min(date.getDate(), lastDay),
  );
}

/** One rendered day cell of the month grid. */
export type CalendarEngineDay = {
  iso: string;
  day: number;
  /** Full localized date label; empty when no label locale is supplied. */
  label: string;
  /** ISO week number of the row-leading day, else undefined. */
  weekNumber: number | undefined;
  inCurrentMonth: boolean;
  today: boolean;
  disabled: boolean;
};

export type CalendarEngineGridOptions = {
  /** Any date inside the displayed month. */
  month: Date;
  /** 0 = Sunday … 6 = Saturday. */
  firstDayOfWeek: number;
  /** Locale for full-date labels; omit to skip label computation. */
  labelLocale?: string;
  /** The day treated as today (pass the current date). */
  today: Date;
  /** Cells per row; defaults to the fixed six-week grid of 42 days. */
  weeks?: number;
  /** Compute ISO week numbers for the row-leading days. */
  weekNumbers?: boolean;
  /** Whether leading/trailing other-month days are selectable. */
  selectOtherMonths: boolean;
  /** The per-contract constraint policy (min/max/disabled lists). */
  isAllowed: (date: Date) => boolean;
};

/**
 * Generate the fixed six-week month grid both calendars render. A day is
 * disabled when the contract's constraint policy rejects it or when it
 * belongs to another month whose days are not selectable.
 */
export function calendarMonthGrid(
  options: CalendarEngineGridOptions,
): CalendarEngineDay[] {
  const weeks = options.weeks ?? 6;
  const month = options.month;
  const offset = (month.getDay() - options.firstDayOfWeek + 7) % 7;
  const start = calendarLocalDate(
    month.getFullYear(),
    month.getMonth() + 1,
    1 - offset,
  );
  const formatter = options.labelLocale
    ? new Intl.DateTimeFormat(options.labelLocale, { dateStyle: 'full' })
    : null;
  const todayKey = calendarDateKey(options.today);
  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = calendarLocalDate(
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate() + index,
    );
    const iso = calendarDateKey(date);
    const inCurrentMonth = date.getMonth() === month.getMonth();
    return {
      iso,
      day: date.getDate(),
      label: formatter ? formatter.format(date) : '',
      weekNumber:
        options.weekNumbers && index % 7 === 0
          ? calendarIsoWeekNumber(
              calendarLocalDate(
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate() + 3,
              ),
            )
          : undefined,
      inCurrentMonth,
      today: iso === todayKey,
      disabled:
        !options.isAllowed(date) ||
        (!inCurrentMonth && !options.selectOtherMonths),
    };
  });
}

/** Group a generated grid into week rows for template iteration. */
export function calendarWeekRows(
  days: readonly CalendarEngineDay[],
  weeks = 6,
): CalendarEngineDay[][] {
  return Array.from({ length: weeks }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  );
}

/** Short weekday names starting at `firstDayOfWeek`. */
export function calendarWeekdayLabels(
  locale: string | undefined,
  firstDayOfWeek: number,
): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      new Date(2021, 7, 1 + ((index + firstDayOfWeek) % 7)),
    ),
  );
}

/** The `Month Year` heading of the displayed month. */
export function calendarMonthLabel(
  month: Date,
  locale: string | undefined,
): string {
  return month.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

type CalendarEngineLocaleWeekInfo = {
  weekInfo?: { firstDay?: number };
  getWeekInfo?: () => { firstDay?: number };
  maximize?: () => { region?: string };
};

const SUNDAY_FIRST_REGIONS = new Set([
  'AG',
  'AR',
  'AS',
  'BD',
  'BR',
  'BS',
  'BT',
  'BZ',
  'CA',
  'CO',
  'DM',
  'DO',
  'ET',
  'GT',
  'GU',
  'HK',
  'HN',
  'JM',
  'JP',
  'KE',
  'KH',
  'KR',
  'LA',
  'MH',
  'MM',
  'MO',
  'MT',
  'MX',
  'MZ',
  'NI',
  'NP',
  'PA',
  'PE',
  'PH',
  'PK',
  'PR',
  'PT',
  'SA',
  'SG',
  'SV',
  'TH',
  'TT',
  'TW',
  'UM',
  'US',
  'VE',
  'VI',
  'WS',
  'YE',
  'ZA',
  'ZW',
]);

const SATURDAY_FIRST_REGIONS = new Set([
  'AF',
  'BH',
  'DJ',
  'DZ',
  'EG',
  'IR',
  'IQ',
  'JO',
  'KW',
  'LY',
  'OM',
  'QA',
  'SD',
  'SY',
]);

// Older browsers may not expose weekInfo/getWeekInfo on Intl.Locale. Keep a
// regional fallback for those runtimes, defaulting to the ISO Monday start.
const fallbackFirstDayOfWeek = (
  localeId: string,
  locale?: CalendarEngineLocaleWeekInfo,
): number => {
  const explicitRegion = localeId
    .replace(/_/g, '-')
    .split('-')
    .slice(1)
    .find((part) => /^[A-Z]{2}$|^\d{3}$/i.test(part))
    ?.toUpperCase();
  const region = explicitRegion || locale?.maximize?.().region;

  if (region && SATURDAY_FIRST_REGIONS.has(region)) return 6;
  if (region && SUNDAY_FIRST_REGIONS.has(region)) return 0;
  return 1;
};

/**
 * The locale's first day of the week (0 = Sunday … 6 = Saturday) from
 * Intl week data, with a regional fallback for runtimes without it.
 */
export function calendarLocaleFirstDay(locale: string | undefined): number {
  try {
    const localeId =
      locale || new Intl.DateTimeFormat().resolvedOptions().locale;
    const LocaleConstructor = (
      Intl as unknown as {
        Locale?: new (locale: string) => CalendarEngineLocaleWeekInfo;
      }
    ).Locale;
    const resolved = LocaleConstructor
      ? new LocaleConstructor(localeId)
      : undefined;
    const firstDay =
      resolved?.getWeekInfo?.().firstDay ?? resolved?.weekInfo?.firstDay;
    if (
      typeof firstDay === 'number' &&
      Number.isInteger(firstDay) &&
      firstDay >= 1 &&
      firstDay <= 7
    ) {
      return firstDay % 7;
    }
    return fallbackFirstDayOfWeek(localeId, resolved);
  } catch {
    return fallbackFirstDayOfWeek(
      locale || new Intl.DateTimeFormat().resolvedOptions().locale,
    );
  }
}

/**
 * The roving-day keyboard state machine: arrows move one day or week,
 * Home/End jump to the week edges, PageUp/PageDown move one month (or
 * twelve when the platform modifier is held) with the day clamped to the
 * target month. Returns the next date, or null for unhandled keys.
 */
export function calendarNavigateDay(
  date: Date,
  key: string,
  largeStep: boolean,
  firstDayOfWeek: number,
): Date | null {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  switch (key) {
    case 'ArrowRight':
      next.setDate(next.getDate() + 1);
      break;
    case 'ArrowLeft':
      next.setDate(next.getDate() - 1);
      break;
    case 'ArrowDown':
      next.setDate(next.getDate() + 7);
      break;
    case 'ArrowUp':
      next.setDate(next.getDate() - 7);
      break;
    case 'Home':
      next.setDate(next.getDate() - ((next.getDay() - firstDayOfWeek + 7) % 7));
      break;
    case 'End':
      next.setDate(
        next.getDate() + 6 - ((next.getDay() - firstDayOfWeek + 7) % 7),
      );
      break;
    case 'PageUp':
    case 'PageDown':
      return calendarShiftMonth(
        next,
        (key === 'PageDown' ? 1 : -1) * (largeStep ? 12 : 1),
      );
    default:
      return null;
  }
  return next;
}

export type CalendarEngineSelectionOptions = {
  /**
   * Whether clicking the range's current bound restarts the range with
   * that single day. The date picker restarts; the inline calendar keeps
   * its historical behavior of extending the range from the same day.
   */
  restartRangeOnSameDay?: boolean;
};

/**
 * The selection algebra shared by all three modes over ISO day keys.
 * Returns the next key list; callers map keys onto their own value
 * shapes (plain ISO strings, time-suffixed strings, or Date objects).
 */
export function calendarSelection(
  mode: CalendarEngineSelectionMode,
  currentKeys: readonly string[],
  iso: string,
  options: CalendarEngineSelectionOptions = {},
): string[] {
  if (mode === 'single') return [iso];
  const current = [...currentKeys];
  if (mode === 'multiple') {
    const index = current.indexOf(iso);
    if (index >= 0) current.splice(index, 1);
    else current.push(iso);
    return current;
  }
  if (current.length !== 1) return [iso];
  if (current[0] === iso)
    return options.restartRangeOnSameDay ? [iso] : [current[0], iso];
  return current[0] < iso ? [current[0], iso] : [iso, current[0]];
}

export type CalendarEngineActiveDayOptions = {
  /** Whether trailing/leading other-month days are visible. */
  showOtherMonths: boolean;
  /**
   * Whether candidates must land on an enabled day. When false only the
   * fallback prefers enabled days, matching the date picker's policy.
   */
  requireEnabled: boolean;
};

/**
 * The roving (active) day of a grid: the first candidate found among the
 * visible days, else the first enabled in-month day, else the first
 * visible day. Candidates arrive in precedence order (roving position,
 * then selection, then today).
 */
export function calendarActiveDay(
  days: readonly CalendarEngineDay[],
  candidates: readonly (string | null | undefined)[],
  options: CalendarEngineActiveDayOptions,
): string | null {
  const visible = days.filter(
    (day) => day.inCurrentMonth || options.showOtherMonths,
  );
  const match = (day: CalendarEngineDay) =>
    !options.requireEnabled || !day.disabled;
  for (const candidate of candidates) {
    if (!candidate) continue;
    const hit = visible.find((day) => day.iso === candidate && match(day));
    if (hit) return hit.iso;
  }
  if (options.requireEnabled) {
    const pool = visible.filter(match);
    return pool.find((day) => day.inCurrentMonth)?.iso ?? pool[0]?.iso ?? null;
  }
  return (
    visible.find((day) => day.inCurrentMonth && !day.disabled)?.iso ??
    visible[0]?.iso ??
    null
  );
}

/**
 * Format a date for the visible input using the PrimeNG-era
 * `dateFormat` pattern tokens (`dd d mm m yy y`), falling back to the
 * locale's numeric date presentation when no pattern is configured.
 */
export function calendarFormatDatePattern(
  format: string | undefined,
  locale: string | undefined,
  year: number,
  month: number,
  day: number,
): string {
  if (format) {
    const replacements: Record<string, string> = {
      dd: calendarPad(day),
      d: String(day),
      mm: calendarPad(month),
      m: String(month),
      yy: String(year),
      y: calendarPad(year % 100),
    };
    return format.replace(/dd|d|mm|m|yy|y/g, (token) => replacements[token]);
  }
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

/**
 * Normalize typed date text to the ISO day key using the configured
 * `dateFormat` pattern order, or the locale's numeric order when no
 * pattern is set. Returns the original text when it is not a real date.
 */
export function calendarNormalizeDateInput(
  value: string,
  format: string | undefined,
  locale: string | undefined,
): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const numbers = value.match(/\d+/g)?.map(Number);
  if (!numbers || numbers.length !== 3) return value;
  const configuredTokens = format?.match(/dd|d|mm|m|yy|y/g);
  const localeTokens = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
    .formatToParts(new Date(2006, 10, 22))
    .filter(
      (part) =>
        part.type === 'day' || part.type === 'month' || part.type === 'year',
    )
    .map((part) =>
      part.type === 'day' ? 'd' : part.type === 'month' ? 'm' : 'yy',
    );
  const tokens =
    configuredTokens?.length === 3 ? configuredTokens : localeTokens;
  const parts: Record<'day' | 'month' | 'year', number> = {
    day: 0,
    month: 0,
    year: 0,
  };
  tokens.forEach((token, index) => {
    parts[
      token.startsWith('d') ? 'day' : token.startsWith('m') ? 'month' : 'year'
    ] = numbers[index];
  });
  if (parts.year < 100) parts.year += 2000;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  if (
    date.getFullYear() !== parts.year ||
    date.getMonth() !== parts.month - 1 ||
    date.getDate() !== parts.day
  )
    return value;
  return `${parts.year}-${calendarPad(parts.month)}-${calendarPad(parts.day)}`;
}
