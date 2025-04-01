import type { OrganizationItem } from '@tk-crawler/biz-shared';
import type { ClientTabModel } from './types';
import { ClientTabType } from './types';

export function generateOrgMembersManageTabId(orgId: string) {
  return `org-members-manage-${orgId}`;
}

export default class OrgMembersManageTabModel implements ClientTabModel {
  readonly type = ClientTabType.OrgMembersManage;
  readonly closable = true;
  private _org: OrganizationItem;

  get org() {
    return this._org;
  }

  get id() {
    return generateOrgMembersManageTabId(this._org.id);
  }

  get label() {
    return `${this._org.name}-成员管理`;
  }

  constructor(props: { org: OrganizationItem }) {
    this._org = props.org;
  }
}
