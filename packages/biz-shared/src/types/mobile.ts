import type { OrganizationItem } from './org-and-user';

export interface MobileDeviceItem {
  id: string;
  device_id: string;
  device_name: string;
  organization?: Omit<
    OrganizationItem,
    'areas' | 'if_membership_valid' | 'user_count'
  >;
  created_at: Date | string;
  updated_at: Date | string;
}
