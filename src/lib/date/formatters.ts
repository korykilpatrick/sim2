import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS } from './constants';

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, DATE_FORMATS.display.date);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, DATE_FORMATS.display.dateTime);
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, DATE_FORMATS.display.time);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatApiDate(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  
  return format(date, DATE_FORMATS.api.date);
}

export function formatApiDateTime(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  
  return format(date, DATE_FORMATS.api.dateTime);
}

export function formatInputDate(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  
  return format(date, DATE_FORMATS.input.date);
}

export function formatInputDateTime(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return '';
  
  return format(date, DATE_FORMATS.input.dateTime);
}