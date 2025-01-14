import type { Region } from '@tk-crawler/shared';
import type { LANGUAGE } from '../constants';

export type WithLng<T extends object> = T & { lng: LANGUAGE };

export type WithRegion<T extends object> = T & { region: Region | 'all' };
