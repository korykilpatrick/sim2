export const DATE_FORMATS = {
  display: {
    date: 'MMM dd, yyyy',
    dateTime: 'MMM dd, yyyy HH:mm',
    time: 'HH:mm',
    relative: 'relative', // for "2 hours ago" style
  },
  input: {
    date: 'yyyy-MM-dd',
    dateTime: 'yyyy-MM-dd\'T\'HH:mm',
  },
  api: {
    date: 'yyyy-MM-dd',
    dateTime: 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'',
  },
} as const;

export const DURATION_OPTIONS = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 30, label: '1 month' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
] as const;

export const TIME_UNITS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
} as const;