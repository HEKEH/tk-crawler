import { TKGuildUserStatus } from '../types';

// 获取状态显示文本
export function getGuildUserStatusText(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return '运行中';
    case TKGuildUserStatus.STOPPED:
      return '已停止';
    case TKGuildUserStatus.ERROR:
      return '出错';
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return 'Cookie失效';
    case TKGuildUserStatus.WAITING:
      return '等待中';
    case TKGuildUserStatus.INACTIVE:
      return '未激活';
    case TKGuildUserStatus.WARNING:
      return '有警告';
    default:
      return '未知';
  }
}
