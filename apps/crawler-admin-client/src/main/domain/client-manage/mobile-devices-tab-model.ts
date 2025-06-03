import type { OrganizationItem } from '@tk-crawler/biz-shared';
import type { ClientTabModel } from './types';
import { ClientTabType } from './types';

export function generateMobileDevicesManageTabId(orgId: string) {
  return `mobile-devices-manage-${orgId}`;
}

export default class MobileDevicesManageTabModel implements ClientTabModel {
  readonly type = ClientTabType.MobileDevicesManage;
  readonly closable = true;
  private _org: OrganizationItem;

  get org() {
    return this._org;
  }

  get id() {
    return generateMobileDevicesManageTabId(this._org.id);
  }

  get label() {
    return `${this._org.name}-自动建联设备管理`;
  }

  constructor(props: { org: OrganizationItem }) {
    this._org = props.org;
  }
}
