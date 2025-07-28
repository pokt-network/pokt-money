export enum Times {
  Last24h = 'last24h',
  Last7d = 'last7d',
  Last30d = 'last30d',
  Last365d = 'last365d',
}

export function normalizeIsoDate(dateStr: string): string {
  if (dateStr.length === 19) {
    return `${dateStr}.000Z`;
  }

  return dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
}

export function getDateFromIsoString(date: string) {
  return new Date(normalizeIsoDate(date))
}

export function getValidTime(time: string, defaultTime = Times.Last7d) {
  let timeSelected = defaultTime

  if (Object.values(Times).includes(time as Times)) {
    timeSelected = time as Times
  }

  return timeSelected
}

export function addHoursToUtc(date: Date | string, hours: number) {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function addDaysToUtc(date: Date | string, days: number) {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export const getUtcEndOfDay = (date: Date | string) => {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23,
    59,
    59,
    999
  ));
};

export function getUtcStartOfDay(date: Date | string) {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
    0
  ));
}

export const getUtcEndOfHour = (date: Date | string) => {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    59,
    59,
    999
  ));
}

export const getUtcStartOfHour = (date: Date | string) => {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    0,
    0,
    0
  ));
}

export function addMinutesToUtc(date: Date | string, minutes: number) {
  if (typeof date === 'string') {
    date = getDateFromIsoString(date);
  }

  return new Date(date.getTime() + minutes * 60 * 1000)
}

export function getStartAndEndDateBasedOnTime(dateStr: string, timeStr: string, endAndStartOfUnit = false) {
  const time = getValidTime(timeStr)

  let end = getDateFromIsoString(dateStr)

  let start: Date

  switch (time) {
    case Times.Last24h: {
      start = addHoursToUtc(end, -23)
      break
    }
    case Times.Last7d: {
      start = addDaysToUtc(end, -6)
      break
    }
    case Times.Last30d: {
      start = addDaysToUtc(end, -29)
      break
    }
    case Times.Last365d: {
      start = addDaysToUtc(end, -364)
      break
    }
  }

  if (endAndStartOfUnit) {
    const isHours = time === Times.Last24h
    end = isHours ? getUtcEndOfHour(end) : getUtcEndOfDay(end)
    start = isHours ? getUtcStartOfHour(start) : getUtcStartOfDay(start)
  }

  return {
    start,
    end,
    truncInterval: time === Times.Last24h ? 'hour' as const : 'day' as const,
  }
}

export function getStartMiddleAndEndDateBasedOnTime(
  dateStr: string,
  timeStr: string,
  endAndStartOfUnit = false
) {
  const time = getValidTime(timeStr)

  let end = getDateFromIsoString(dateStr)

  let start: Date, middle: Date

  switch (time) {
    case Times.Last24h: {
      middle = addHoursToUtc(end, -23)
      start = addHoursToUtc(middle, -23)
      break
    }
    case Times.Last7d: {
      middle = addDaysToUtc(end, -6)
      start = addDaysToUtc(middle, -6)
      break
    }
    case Times.Last30d: {
      middle = addDaysToUtc(end, -29)
      start = addDaysToUtc(middle, -29)
      break
    }
    case Times.Last365d: {
      middle = addDaysToUtc(end, -364)
      start = addDaysToUtc(middle, -364)
      break
    }
  }

  if (endAndStartOfUnit) {
    const isHours = time === Times.Last24h
    end = isHours ? getUtcEndOfHour(end) : getUtcEndOfDay(end)
    start = isHours ? getUtcStartOfHour(start) : getUtcStartOfDay(start)
    middle = isHours ? getUtcStartOfHour(middle) : getUtcStartOfDay(middle)
  }

  return {
    start,
    middle,
    end,
    truncInterval: time === Times.Last24h ? 'hour' as const : 'day' as const,
  }
}

export type UnitTimeGroup = 'hour' | 'day' | 'week' | 'month' | 'year';
export function formatDate(dateString: string, type: UnitTimeGroup, includeMonth = false): string {
  const date = new Date(dateString);

  if (type === "day") {
    if (includeMonth) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      }).replace(',', '');
    }

    return date.getUTCDate().toString();
  }

  if (type === "hour") {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).replace(',', '');
  }

  throw new Error("Invalid type. Use 'day' or 'hour'.");
}
