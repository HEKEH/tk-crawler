import { TKGuildUserStatus } from '../types';
import { getGuildUserStatusText } from '../utils/guild-user';

export const TKGuildUserStatusList = [
  TKGuildUserStatus.INACTIVE,
  TKGuildUserStatus.WAITING,
  TKGuildUserStatus.RUNNING,
  TKGuildUserStatus.STOPPED,
  TKGuildUserStatus.WARNING,
  TKGuildUserStatus.ERROR,
  TKGuildUserStatus.COOKIE_EXPIRED,
];

export const TKGuildUserStatusOptions = TKGuildUserStatusList.map(status => ({
  value: status,
  label: getGuildUserStatusText(status),
}));
