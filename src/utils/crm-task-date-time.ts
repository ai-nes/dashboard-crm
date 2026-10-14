export const CRM_TASK_TIME_ZONE = "Asia/Ho_Chi_Minh";

const vietnamDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CRM_TASK_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function parseDate(
  value: string,
): { year: string; month: string; day: string } | null {
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const local = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const parts = iso
    ? { year: iso[1], month: iso[2], day: iso[3] }
    : local
      ? {
          year: local[3],
          month: local[2].padStart(2, "0"),
          day: local[1].padStart(2, "0"),
        }
      : null;
  if (!parts) return null;

  const date = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
  );
  if (
    date.getUTCFullYear() !== Number(parts.year) ||
    date.getUTCMonth() + 1 !== Number(parts.month) ||
    date.getUTCDate() !== Number(parts.day)
  ) {
    return null;
  }
  return parts;
}

function validTime(value?: string): string {
  return value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "23:59";
}

function displayDate(year: string, month: string, day: string): string {
  return `${day}/${month}/${year}`;
}

export function crmDateTimeToApi(
  date: string,
  time = "23:59",
): string | undefined {
  const parts = parseDate(date);
  if (!parts) return undefined;
  return `${parts.year}-${parts.month}-${parts.day}T${validTime(time)}:00+07:00`;
}

export function crmTaskDateTimeToTimestamp(
  date: string,
  time = "23:59",
): number | null {
  const value = crmDateTimeToApi(date, time);
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function crmTaskDateTimeParts(value?: string): {
  date: string;
  time?: string;
} {
  if (!value) return { date: "" };
  const trimmed = value.trim();
  const isoDate = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return { date: displayDate(isoDate[1], isoDate[2], isoDate[3]) };
  }

  const localDateTime = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?/,
  );
  if (localDateTime) {
    return {
      date: displayDate(
        localDateTime[3],
        localDateTime[2].padStart(2, "0"),
        localDateTime[1].padStart(2, "0"),
      ),
      time:
        localDateTime[4] && localDateTime[5]
          ? `${localDateTime[4]}:${localDateTime[5]}`
          : undefined,
    };
  }

  const naiveIsoDateTime = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/,
  );
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  if (naiveIsoDateTime && !hasOffset) {
    return {
      date: displayDate(
        naiveIsoDateTime[1],
        naiveIsoDateTime[2],
        naiveIsoDateTime[3],
      ),
      time: `${naiveIsoDateTime[4]}:${naiveIsoDateTime[5]}`,
    };
  }

  const instant = new Date(trimmed);
  if (Number.isNaN(instant.getTime())) return { date: value };

  const formatted = Object.fromEntries(
    vietnamDateTimeFormatter
      .formatToParts(instant)
      .map(({ type, value: part }) => [type, part]),
  );
  return {
    date: displayDate(formatted.year, formatted.month, formatted.day),
    time: `${formatted.hour}:${formatted.minute}`,
  };
}

export function crmTaskDateForInput(value?: string): string {
  const formatted = crmTaskDateTimeParts(value).date;
  const local = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return local ? `${local[3]}-${local[2]}-${local[1]}` : "";
}

export function crmTaskDateKey(value?: string): string {
  return crmTaskDateForInput(value);
}

export function crmCurrentDateKey(now = new Date()): string {
  return crmTaskDateKey(now.toISOString());
}
