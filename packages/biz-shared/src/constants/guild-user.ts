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

export const TK_GUILD_USER_EVENTS = {
  IS_ANY_GUILD_USER_ERROR: 'guild-user:is-any-error',
};
