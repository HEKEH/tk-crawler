import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { I18N_LANGUAGE } from '../constants';

dayjs.extend(timezone);
dayjs.extend(utc);

export function formatDateTime(
  value: string | number | Date,
  config: {
    lang: I18N_LANGUAGE;
    timezone: string;
  } = {
    lang: I18N_LANGUAGE.ZH_CN,
    timezone: 'Asia/Shanghai',
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
