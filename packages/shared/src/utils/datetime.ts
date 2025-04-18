import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { I18N_LANGUAGE } from '../constants';

dayjs.extend(timezone);
dayjs.extend(utc);

export const BrowserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function formatDateTime(
  value: string | number | Date | null | undefined,
  config: {
    lang: I18N_LANGUAGE;
    timezone: string;
  } = {
    lang: I18N_LANGUAGE.ZH_CN,
    timezone: BrowserTimezone,
  },
) {
  if (!value) {
    return null;
  }
  return dayjs(value)
    .tz(config.timezone)
    .format(
      config.lang === I18N_LANGUAGE.ZH_CN
        ? 'YYYY年MM月DD日 HH:mm:ss'
        : 'YYYY-MM-DD HH:mm:ss',
    );
}

export const CommonDatePickerShortcuts = [
  {
    text: '30天后',
    value: () => {
      const date = dayjs().add(30, 'day');
      return date.toDate();
    },
  },
  {
    text: '60天后',
    value: () => {
      const date = dayjs().add(60, 'day');
      return date.toDate();
    },
  },
  {
    text: '90天后',
    value: () => {
      const date = dayjs().add(90, 'day');
      return date.toDate();
    },
  },
  {
    text: '180天后',
    value: () => {
      const date = dayjs().add(180, 'day');
      return date.toDate();
    },
  },
  {
    text: '360天后',
    value: () => {
      const date = dayjs().add(360, 'day');
      return date.toDate();
    },
  },
];
