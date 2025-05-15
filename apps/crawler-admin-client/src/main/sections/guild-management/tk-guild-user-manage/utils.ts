import { TKGuildUserStatus } from '@tk-crawler/biz-shared';

// 获取状态标签类型
export function getStatusTagType(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.RUNNING:
      return 'success';
    case TKGuildUserStatus.STOPPED:
      return 'info';
    case TKGuildUserStatus.ERROR:
      return 'danger';
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return 'danger';
    case TKGuildUserStatus.WAITING:
      return 'primary';
    case TKGuildUserStatus.INACTIVE:
      return 'info';
    case TKGuildUserStatus.WARNING:
      return 'warning';
    default:
      return 'info';
  }
}

// 获取状态显示文本
export function getStatusText(status: TKGuildUserStatus) {
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

export function getStatusTip(status: TKGuildUserStatus) {
  switch (status) {
    case TKGuildUserStatus.COOKIE_EXPIRED:
      return '由于TK严格的风控机制，一次激活并不能保证Cookie后续验证通过，可能需要重复激活数次后，Cookie才能正常使用';
    default:
      return undefined;
  }
}
