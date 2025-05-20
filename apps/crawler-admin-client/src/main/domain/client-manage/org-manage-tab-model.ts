import type { OrganizationItem } from '@tk-crawler/biz-shared';
import type { ClientTabModel } from './types';
import { generateOrgMembersManageTabId } from './members-manage-tab-model';
import { generateMobileDevicesManageTabId } from './mobile-devices-tab-model';
import { ClientTabType } from './types';

export interface OrgManageTabModelContext {
  onOrgMembersManage: (org: OrganizationItem) => void;
  onMobileDevicesManage: (org: OrganizationItem) => void;
  closeTab: (tabId: string) => void;
}

export default class OrgManageTabModel implements ClientTabModel {
  private _context: OrgManageTabModelContext;
  readonly type = ClientTabType.OrgManage;
  readonly closable = false;

  refresh?: () => void;

  onOrgMembersManage(org: OrganizationItem) {
    this._context.onOrgMembersManage(org);
  }

  onMobileDevicesManage(org: OrganizationItem) {
    this._context.onMobileDevicesManage(org);
  }

  onOrgDelete(org: OrganizationItem) {
    this._context.closeTab(generateOrgMembersManageTabId(org.id));
    this._context.closeTab(generateMobileDevicesManageTabId(org.id));
  }

  get id() {
    return `org-manage`;
  }

  get label() {
    return '机构管理';
  }

  constructor({ context }: { context: OrgManageTabModelContext }) {
    this._context = context;
  }
}
