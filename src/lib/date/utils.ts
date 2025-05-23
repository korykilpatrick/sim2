import { 
  addDays, 
  addMonths, 
  addYears, 
  differenceInDays,
  differenceInMonths,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { TIME_UNITS } from './constants';

export function addDuration(date: Date, duration: number, unit: 'days' | 'months' | 'years'): Date {
  switch (unit) {
    case 'days':
      return addDays(date, duration);
    case 'months':
      return addMonths(date, duration);
    case 'years':
      return addYears(date, duration);
    default:
      return date;
  }
}

export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
}

export function getMonthsBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInMonths(end, start);
}

export function getDateRangeFromDays(days: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = addDays(endDate, -days);
  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(endDate),
  };
}

export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return isWithinInterval(checkDate, { start, end });
}

export function getRelativeTimeString(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / TIME_UNITS.second);
  const minutes = Math.floor(milliseconds / TIME_UNITS.minute);
  const hours = Math.floor(milliseconds / TIME_UNITS.hour);
  const days = Math.floor(milliseconds / TIME_UNITS.day);
  const months = Math.floor(milliseconds / TIME_UNITS.month);
  const years = Math.floor(milliseconds / TIME_UNITS.year);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

export function isDateInFuture(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(checkDate, new Date());
}

export function isDateInPast(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(checkDate, new Date());
}