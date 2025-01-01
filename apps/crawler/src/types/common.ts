import type { LANGUAGE } from '../constants';
import type { Region } from './region';

export type WithLng<T extends object> = T & { lng: LANGUAGE };

export type WithRegion<T extends object> = T & { region: Region | 'all' };
