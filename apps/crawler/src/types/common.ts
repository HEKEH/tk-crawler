import type { LANGUAGE } from '../constants';

export type WithLng<T extends object> = T & { lng?: LANGUAGE };
